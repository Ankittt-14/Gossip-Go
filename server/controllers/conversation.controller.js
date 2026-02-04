import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { asynchandler } from "../utilities/asynchandler.utilities.js";
import { errorhandler } from "../utilities/errorhandler.utilities.js";

// Create a Group Chat
export const createGroup = asynchandler(async (req, res, next) => {
    const { name, participants } = req.body;
    const adminId = req.user._id;

    if (!name || !participants || participants.length < 2) {
        return next(new errorhandler("Group must have a name and at least 2 other members", 400));
    }

    // Only admin is in participants initially
    const initialParticipants = [adminId];

    // Others are pending
    const pendingParticipantsList = participants;

    // Generate Group Avatar (Initials of Group Name)
    const groupAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;

    const groupChat = await Conversation.create({
        participants: initialParticipants,
        pendingParticipants: pendingParticipantsList,
        isGroup: true,
        groupName: name,
        groupAdmin: adminId,
        groupAvatar: groupAvatar
    });

    // Create System Message
    const adminUser = await User.findById(adminId);
    // Import needed

    await Message.create({
        senderId: adminId,
        receiverId: adminId, // Placeholder, mostly relevant for 1-on-1 but required by schema if we didn't make optional... checking schema... made optional.
        conversationId: groupChat._id,
        message: `${adminUser.fullName} created the group "${name}"`,
        isSystemMessage: true
    });

    const fullGroupChat = await Conversation.findOne({ _id: groupChat._id })
        .populate("participants", "-password")
        .populate("pendingParticipants", "-password")
        .populate("groupAdmin", "-password");

    res.status(201).json({
        success: true,
        message: "Group created successfully. Invites sent.",
        data: fullGroupChat
    });
});

export const acceptInvite = asynchandler(async (req, res, next) => {
    const { groupId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(groupId);
    if (!conversation) return next(new errorhandler("Group not found", 404));

    if (!conversation.pendingParticipants.includes(userId)) {
        return next(new errorhandler("No pending invite found", 400));
    }

    // Move from pending to participants
    conversation.pendingParticipants = conversation.pendingParticipants.filter(id => id.toString() !== userId.toString());
    conversation.participants.push(userId);
    await conversation.save();

    // System Message
    const user = await User.findById(userId);

    await Message.create({
        conversationId: conversation._id,
        message: `${user.fullName} joined the group`,
        isSystemMessage: true
    });

    res.status(200).json({ success: true, message: "Joined group successfully", data: conversation });
});

export const rejectInvite = asynchandler(async (req, res, next) => {
    const { groupId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(groupId);
    if (!conversation) return next(new errorhandler("Group not found", 404));

    if (!conversation.pendingParticipants.includes(userId)) {
        return next(new errorhandler("No pending invite found", 400));
    }

    conversation.pendingParticipants = conversation.pendingParticipants.filter(id => id.toString() !== userId.toString());
    await conversation.save();

    res.status(200).json({ success: true, message: "Invite rejected" });
});

export const leaveGroup = asynchandler(async (req, res, next) => {
    const { groupId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(groupId);
    if (!conversation) return next(new errorhandler("Group not found", 404));

    // Remove from participants
    conversation.participants = conversation.participants.filter(id => id.toString() !== userId.toString());

    // If Admin leaves, assign new admin? Or random? For now, if admin leaves, just leave logic as is.
    // If group empty -> delete?
    if (conversation.participants.length === 0) {
        await conversation.deleteOne();
        return res.status(200).json({ success: true, message: "Group deleted as last member left" });
    }

    // If Admin left, assign new admin from participants[0]
    if (conversation.groupAdmin.toString() === userId.toString()) {
        conversation.groupAdmin = conversation.participants[0];
    }

    await conversation.save();

    // System Message
    const user = await User.findById(userId);

    await Message.create({
        conversationId: conversation._id,
        message: `${user.fullName} left the group`,
        isSystemMessage: true
    });

    res.status(200).json({ success: true, message: "Left group successfully" });
});

export const addMemberToGroup = asynchandler(async (req, res, next) => {
    const { groupId } = req.params;
    const { participants } = req.body; // Array of userIds to add
    const userId = req.user._id;

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
        return next(new errorhandler("Please select members to add", 400));
    }

    const conversation = await Conversation.findById(groupId);
    if (!conversation) return next(new errorhandler("Group not found", 404));

    // Check if requester is admin
    if (conversation.groupAdmin.toString() !== userId.toString()) {
        return next(new errorhandler("Only admin can add members", 403));
    }

    // Filter out users who are already participants or pending
    const newParticipants = participants.filter(id =>
        !conversation.participants.includes(id) &&
        !conversation.pendingParticipants.includes(id)
    );

    if (newParticipants.length === 0) {
        return next(new errorhandler("All selected users are already in the group or invited", 400));
    }

    // Add to pendingParticipants
    conversation.pendingParticipants.push(...newParticipants);
    await conversation.save();

    // System Message
    // Fetch names of added users for the message? Or just generic.
    // Let's just say "Admin invited X users"
    const adminUser = await User.findById(userId);

    await Message.create({
        conversationId: conversation._id,
        message: `${adminUser.fullName} invited ${newParticipants.length} new member(s)`,
        isSystemMessage: true
    });

    res.status(200).json({ success: true, message: "Invites sent successfully", data: conversation });
});

// Get User's Conversations (including 1-on-1 and Groups)
export const getMyConversations = asynchandler(async (req, res, next) => {
    const userId = req.user._id;

    const conversations = await Conversation.find({
        $or: [
            { participants: { $in: [userId] } },
            { pendingParticipants: { $in: [userId] } }
        ]
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
