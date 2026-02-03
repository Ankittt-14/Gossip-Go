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

  // Check if receiver is a User (1-on-1)
  const userReceiver = await User.findById(receiverId);

  if (userReceiver) {
    // --- 1-on-1 Logic ---
    const isFriend = userReceiver.friends.some(friendId => friendId.toString() === senderId.toString());
    const sender = await User.findById(senderId); // Needed to check sender's friends list? Actually userReceiver.friends check is enough if bidirectional.

    // Check if they are friends (Double check sender side to be safe)
    if (!sender.friends.includes(receiverId)) {
      return next(new errorhandler("You can only send messages to your friends", 403));
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
      isGroup: false
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        isGroup: false
      });
    }

    const socketId = getSocketId(receiverId);
    const status = socketId ? 'delivered' : 'sent';

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
      status,
      conversationId: conversation._id
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
      await conversation.save();
    }

    if (socketId) {
      io.to(socketId).emit("newMessage", newMessage);
    }

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage
    });

  } else {
    // --- Group Logic ---
    const groupConversation = await Conversation.findById(receiverId);

    if (!groupConversation) {
      return next(new errorhandler("User or Group not found", 404));
    }

    // Check if sender is participant
    if (!groupConversation.participants.includes(senderId)) {
      return next(new errorhandler("You are not a member of this group", 403));
    }

    const newMessage = await Message.create({
      senderId,
      receiverId: groupConversation._id, // Linking to Group ID temporarily or just for ref
      message,
      status: 'sent', // Group messages don't really use single delivered status easily
      conversationId: groupConversation._id
    });

    if (newMessage) {
      groupConversation.messages.push(newMessage._id);
      await groupConversation.save();
    }

    // Emit to all participants except sender
    groupConversation.participants.forEach(participantId => {
      if (participantId.toString() !== senderId.toString()) {
        const socketId = getSocketId(participantId.toString());
        if (socketId) {
          // Emit same 'newMessage' event. Frontend needs to handle it.
          // If frontend checks selectedUser._id === newMessage.senderId, it works for 1-on-1.
          // For Group, frontend might need 'conversationId'.
          io.to(socketId).emit("newMessage", newMessage);
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Group message sent successfully",
      data: newMessage
    });
  }
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
  const otherParticipantId = req.params.otherParticipantId; // Can be User ID or Group ID

  if (!myId || !otherParticipantId) {
    return next(new errorhandler("All fields are required", 400));
  }

  // Check if it's a Group (Conversation)
  const groupConversation = await Conversation.findById(otherParticipantId).populate("messages");

  if (groupConversation && groupConversation.isGroup) {
    // Check if user is member
    if (!groupConversation.participants.includes(myId)) {
      return next(new errorhandler("You are not a member of this group", 403));
    }

    return res.status(200).json({
      success: true,
      message: "Group messages fetched successfully",
      data: groupConversation
    });
  }

  // --- 1-on-1 Logic ---
  // If not a group, assume it's a User ID
  const isFriend = (await User.findById(myId)).friends.includes(otherParticipantId);

  if (!isFriend) {
    // If not friend, maybe handle strictly? Or just return empty?
    // Existing logic was strict.
    return next(new errorhandler("You can only view messages from your friends", 403));
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [myId, otherParticipantId] },
    isGroup: false
  }).populate("messages");

  if (!conversation) {
    return res.status(200).json({
      success: true,
      message: "No conversation yet",
      data: { messages: [] }
    });
  }

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