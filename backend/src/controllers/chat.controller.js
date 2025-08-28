import asyncHandler from 'express-async-handler';
import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import Booking from '../models/booking.model.js';

// @desc    Get messages for a specific booking
// @route   GET /api/chat/messages/:bookingId
// @access  Private
export const getMessages = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;

    // First, find the conversation associated with the booking
    let conversation = await Conversation.findOne({ booking: bookingId });

    if (!conversation) {
        // If no conversation exists, it means no messages have been sent.
        // We can optionally create one here or just return an empty array.
        // Let's return an empty array for simplicity.
        return res.json([]);
    }

    // Find all messages belonging to this conversation
    const messages = await Message.find({ conversation: conversation._id })
        .populate('sender', 'name profileImage') // Populate sender info
        .sort({ createdAt: 'asc' });

    res.json(messages);
});


// This function will be called by Socket.IO, not via a direct API route
export const saveMessage = async (messageData) => {
    try {
        const { bookingId, sender, messageType, content } = messageData;

        // Find or create the conversation for the booking
        let conversation = await Conversation.findOne({ booking: bookingId });

        if (!conversation) {
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                throw new Error('Booking not found');
            }
            conversation = await Conversation.create({
                booking: bookingId,
                participants: [booking.user, booking.provider]
            });
        }

        // Create the new message
        const newMessage = await Message.create({
            conversation: conversation._id,
            sender,
            messageType,
            content,
            readBy: [sender] // The sender has obviously read it
        });

        // Update the conversation's lastMessage
        conversation.lastMessage = newMessage._id;
        await conversation.save();

        // Populate sender info for broadcasting
        const populatedMessage = await Message.findById(newMessage._id)
            .populate('sender', 'name profileImage');
            
        return populatedMessage;

    } catch (error) {
        console.error('Error saving message:', error);
        return null; // Return null on error
    }
};