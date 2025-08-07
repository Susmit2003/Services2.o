import express from 'express';
import {
  createOrder,
  verifyPayment
} from '../controllers/razorpay.controller.js';
import {
  protect
} from '../middleware/auth.middleware.js';

const router = express.Router();

// All Razorpay routes should be protected to ensure a user is logged in
router.use(protect);

router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);

export default router;