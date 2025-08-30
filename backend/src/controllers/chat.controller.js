import asyncHandler from 'express-async-handler';
import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import Booking from '../models/booking.model.js';
import { createNotification } from './notification.controller.js';

// @desc    Get messages for a specific booking
// @route   GET /api/chat/messages/:bookingId
// @access  Private
export const getMessages = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const conversation = await Conversation.findOne({ booking: bookingId });

    if (!conversation) {
        // If there's no conversation, there are no messages.
        return res.json([]);
    }

    const messages = await Message.find({ conversation: conversation._id })
        .populate('sender', 'name profileImage')
        .sort({ createdAt: 'asc' });

    res.json(messages);
});

export const saveMessage = async (messageData) => {
    try {
        const { bookingId, sender, messageType, content } = messageData;

        // Find or create the conversation for the booking
        let conversation = await Conversation.findOne({ booking: bookingId });

        if (!conversation) {
            const booking = await Booking.findById(bookingId);
            if (!booking) throw new Error('Booking not found');
            conversation = await Conversation.create({
                booking: bookingId,
                participants: [booking.user, booking.provider]
            });
        }

        const newMessage = await Message.create({
            conversation: conversation._id,
            sender,
            messageType,
            content,
            readBy: [sender]
        });
        
        conversation.lastMessage = newMessage._id;
        await conversation.save();
        
        // Populate sender info for broadcasting
        const populatedMessage = await Message.findById(newMessage._id)
            .populate('sender', 'name profileImage');
            
        return populatedMessage;

    } catch (error) {
        console.error('Error saving message:', error);
        return null;
    }
};
