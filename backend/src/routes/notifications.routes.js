import express from 'express';
import {
    getNotifications, // Use the more generic name
    markAllNotificationsAsRead,
    markNotificationAsRead,
    deleteNotification,
    getUnreadNotificationCount,
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// --- THIS IS THE FIX ---
// The router now correctly handles a GET request to the root '/' path.
router.get('/', getNotifications);

// Other routes remain the same
router.get('/unread-count', getUnreadNotificationCount);
router.put('/mark-all-read', markAllNotificationsAsRead);

router.route('/:notificationId')
    .put(markNotificationAsRead)
    .delete(deleteNotification);

export default router;