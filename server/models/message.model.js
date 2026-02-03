import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        message: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['sent', 'delivered', 'seen'],
            default: 'sent'
        },
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;