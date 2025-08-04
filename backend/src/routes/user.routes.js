import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  changePassword, 
  deleteAccount 
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/users/profile
router.get('/profile', getProfile);

// PUT /api/users/profile/:userId
router.put('/profile/:userId', updateProfile);

// POST /api/users/change-password
router.post('/change-password', changePassword);

// DELETE /api/users/account
router.delete('/account', deleteAccount);

export default router;