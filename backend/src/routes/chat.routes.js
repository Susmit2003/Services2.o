import express from 'express';
import { getMessages } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// This route will be used to fetch the initial chat history when the modal opens
router.get('/messages/:bookingId', protect, getMessages);

export default router;