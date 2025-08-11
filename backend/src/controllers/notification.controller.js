import asyncHandler from 'express-async-handler';
import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import { sendPushNotification } from '../services/firebase.service.js';

// This function creates a notification AND sends a real-time push notification
export const createNotification = async (userId, title, message, type, data = {}) => {
    try {
        await Notification.create({ user: userId, title, message, type, data });
        const user = await User.findById(userId);
        if (user && user.fcmToken) {
            await sendPushNotification(user.fcmToken, title, message, data);
        }
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};

// --- RESTORED & CORRECTED FUNCTIONS ---

/**
 * @desc    Get all notifications for the logged-in user
 * @route   GET /api/notifications/user
 */
export const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);
    res.status(200).json(notifications);
});

/**
 * @desc    Mark a single notification as read
 * @route   PUT /api/notifications/:notificationId
 */
export const markNotificationAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.notificationId, user: req.user._id },
        { isRead: true },
        { new: true }
    );
    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }
    res.status(200).json(notification);
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/mark-all-read
 */
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ message: 'All notifications marked as read.' });
});

/**
 * @desc    Delete a single notification
 * @route   DELETE /api/notifications/:notificationId
 */
export const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndDelete({ 
        _id: req.params.notificationId, 
        user: req.user._id 
    });
    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }
    res.status(200).json({ message: 'Notification deleted successfully.' });
});

/**
 * @desc    Get the count of unread notifications
 * @route   GET /api/notifications/unread-count
 */
export const getUnreadNotificationCount = asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.status(200).json({ count });
});