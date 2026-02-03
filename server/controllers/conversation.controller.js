import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";
import { asynchandler } from "../utilities/asynchandler.utilities.js";
import { errorhandler } from "../utilities/errorhandler.utilities.js";

// Create a Group Chat
export const createGroup = asynchandler(async (req, res, next) => {
    const { name, participants } = req.body;
    const adminId = req.user._id;

    if (!name || !participants || participants.length < 2) {
        return next(new errorhandler("Group must have a name and at least 2 other members", 400));
    }

    // Add admin to participants
    const allParticipants = [...participants, adminId];

    // Generate Group Avatar (Initials of Group Name)
    const groupAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;

    const groupChat = await Conversation.create({
        participants: allParticipants,
        isGroup: true,
        groupName: name,
        groupAdmin: adminId,
        groupAvatar: groupAvatar
    });

    const fullGroupChat = await Conversation.findOne({ _id: groupChat._id })
        .populate("participants", "-password")
        .populate("groupAdmin", "-password");

    res.status(201).json({
        success: true,
        message: "Group created successfully",
        data: fullGroupChat
    });
});

// Get User's Conversations (including 1-on-1 and Groups)
export const getMyConversations = asynchandler(async (req, res, next) => {
    const userId = req.user._id;

    const conversations = await Conversation.find({
        participants: { $in: [userId] }
    })
        .populate("participants", "-password")
        .populate("groupAdmin", "-password")
        .sort({ updatedAt: -1 });

    res.status(200).json({
        success: true,
        message: "Conversations fetched successfully",
        data: conversations
    });
});
