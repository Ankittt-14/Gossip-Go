import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";
import { asynchandler } from "../utilities/asynchandler.utilities.js";
import { errorhandler } from "../utilities/errorhandler.utilities.js";
import { getSocketId, io } from "../socket/socket.js";

export const sendMessage = asynchandler(async (req, res, next) => {
  const senderId = req.user._id;
  const receiverId = req.params.receiverId;
  const message = req.body.message;

  if (!senderId || !receiverId || !message) {
    return next(new errorhandler("All fields are required", 400));
  }

  // Check if users are friends
  const sender = await User.findById(senderId);
  const isFriend = sender.friends.some(friendId => friendId.toString() === receiverId.toString());

  if (!isFriend) {
    return next(new errorhandler("You can only send messages to your friends", 403));
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] }
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId]
    });
  }

  // Check if receiver is online
  const socketId = getSocketId(receiverId);
  const status = socketId ? 'delivered' : 'sent';

  const newMessage = await Message.create({
    senderId,
    receiverId,
    message,
    status
  });

  if (newMessage) {
    conversation.messages.push(newMessage._id);
    await conversation.save();
  }

  // Socket.IO - send message to receiver
  if (socketId) {
    io.to(socketId).emit("newMessage", newMessage);
  }

  res.status(200).json({
    success: true,
    message: "Message sent successfully",
    data: newMessage
  });
});

export const markAsSeen = asynchandler(async (req, res, next) => {
  const { senderId } = req.params;
  const receiverId = req.user._id;

  await Message.updateMany(
    { senderId, receiverId, status: { $ne: 'seen' } },
    { $set: { status: 'seen' } }
  );

  const socketId = getSocketId(senderId);
  if (socketId) {
    io.to(socketId).emit("messagesSeen", { receiverId });
  }

  res.status(200).json({
    success: true,
    message: "Messages marked as seen"
  });
});

export const getMessages = asynchandler(async (req, res, next) => {
  const myId = req.user._id;
  const otherParticipantId = req.params.otherParticipantId;

  if (!myId || !otherParticipantId) {
    return next(new errorhandler("All fields are required", 400));
  }

  // Check if users are friends
  const user = await User.findById(myId);
  const isFriend = user.friends.some(friendId => friendId.toString() === otherParticipantId.toString());

  if (!isFriend) {
    return next(new errorhandler("You can only view messages from your friends", 403));
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [myId, otherParticipantId] }
  }).populate("messages");

  res.status(200).json({
    success: true,
    message: "Messages fetched successfully",
    data: conversation
  });
});

export const getUnreadMessages = asynchandler(async (req, res, next) => {
  const userId = req.user._id;

  const distinctSenders = await Message.distinct("senderId", {
    receiverId: userId,
    status: { $ne: "seen" }
  });

  res.status(200).json({
    success: true,
    message: "Unread messages fetched successfully",
    data: distinctSenders
  });
});