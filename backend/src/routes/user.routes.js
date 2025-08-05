// backend/src/routes/user.routes.js
import express from 'express';
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private routes (protected by the 'protect' middleware)
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

export default router;