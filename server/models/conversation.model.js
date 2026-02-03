import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        messages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Message',
                default: [],
            },
        ],
        isGroup: {
            type: Boolean,
            default: false,
        },
        groupName: {
            type: String,
            default: null, // Only for group chats
        },
        groupAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null, // Only for group chats
        },
        groupAvatar: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;