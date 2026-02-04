import dotenv from 'dotenv';
dotenv.config();

import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

import Message from "../models/message.model.js";

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
    }
});

const userSocketMap = {};

io.on("connection", async (socket) => {
    const userId = socket.handshake.query.userId;
    if (!userId) return;

    userSocketMap[userId] = socket.id;
    io.emit("onlineUsers", Object.keys(userSocketMap));

    // Update messages to delivered
    try {
        const messagesToUpdate = await Message.find({ receiverId: userId, status: 'sent' });
        if (messagesToUpdate.length > 0) {
            await Message.updateMany({ receiverId: userId, status: 'sent' }, { $set: { status: 'delivered' } });

            // Notify senders
            messagesToUpdate.forEach(msg => {
                const senderSocketId = userSocketMap[msg.senderId.toString()];
                if (senderSocketId) {
                    io.to(senderSocketId).emit("messageDelivered", { messageId: msg._id, receiverId: userId });
                }
            });
        }
    } catch (error) {
        console.error("Error updating delivered status:", error);
    }


    // Join Chat Room
    socket.on("join-chat", (room) => {
        socket.join(room);
        // console.log(`User joined room: ${room}`);
    });

    // Typing indicator
    socket.on("typing", (data) => {
        if (data.conversationId) {
            // Group Typing (Broadcast to room)
            // Emit to everyone in room including sender (frontend filters sender)
            // Or use socket.to(room) to exclude sender
            socket.to(data.conversationId).emit("userTyping", {
                senderId: data.senderId,
                isTyping: data.isTyping,
                conversationId: data.conversationId
            });
        } else {
            // 1-on-1 Typing
            const receiverSocketId = userSocketMap[data.receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userTyping", {
                    senderId: data.senderId,
                    isTyping: data.isTyping
                });
            }
        }
    });

    socket.on("markMessagesAsSeen", async (data) => {
        try {
            const { senderId, seenBy } = data;
            // Update all messages from senderId to seenBy as 'seen'
            await Message.updateMany(
                { senderId: senderId, receiverId: seenBy, status: { $ne: 'seen' } },
                { $set: { status: 'seen' } }
            );

            const receiverSocketId = userSocketMap[senderId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("messagesSeen", {
                    receiverId: seenBy
                });
            }
        } catch (error) {
            console.error("Error marking messages as seen:", error);
        }
    });

    socket.on("disconnect", () => {
        delete userSocketMap[userId];
        io.emit("onlineUsers", Object.keys(userSocketMap));
    });
});

const getSocketId = (userId) => {
    return userSocketMap[userId];
};

export { io, app, server, getSocketId };