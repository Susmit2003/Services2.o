import express from 'express';
import { 
  getUserNotifications, 
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification,
  getUnreadNotificationCount
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/notifications
router.get('/', getUserNotifications);

// POST /api/notifications/mark-all-read
router.post('/mark-all-read', markAllNotificationsAsRead);

// GET /api/notifications/unread-count - Must come before /:notificationId
router.get('/unread-count', getUnreadNotificationCount);

// PUT /api/notifications/:notificationId/read
router.put('/:notificationId/read', markNotificationAsRead);

// DELETE /api/notifications/:notificationId
router.delete('/:notificationId', deleteNotification);

export default router; 