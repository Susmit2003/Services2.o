// backend/src/routes/notification.routes.js
import express from 'express';
import {
    getUserNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    deleteNotification,
    getUnreadNotificationCount,
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All notification routes are private and require an authenticated user.
// The `protect` middleware is applied to all routes in this file.
router.use(protect);

// Route to get all notifications for the logged-in user
router.get('/user', getUserNotifications);

// Route to get the count of unread notifications
router.get('/unread-count', getUnreadNotificationCount);

// Route to mark all notifications as read
router.put('/mark-all-read', markAllNotificationsAsRead);

// Routes for a single notification by its ID
router.route('/:notificationId')
    .put(markNotificationAsRead)   // Mark a specific notification as read
    .delete(deleteNotification);   // Delete a specific notification

export default router;