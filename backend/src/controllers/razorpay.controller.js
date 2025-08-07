import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/user.model.js';
import Transaction from '../models/transaction.model.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @desc    Create a Razorpay order
 * @route   POST /api/razorpay/create-order
 * @access  Private
 */
export const createOrder = asyncHandler(async (req, res) => {
  const {
    amount,
    currency,
    receipt,
    notes
  } = req.body;

  try {
    const options = {
      amount: amount * 100, // Amount in the smallest currency unit
      currency: currency || 'INR',
      receipt,
      notes,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      res.status(500);
      throw new Error('Failed to create Razorpay order');
    }

    res.status(200).json({
      key: process.env.RAZORPAY_KEY_ID,
      order,
      displayAmount: `${currencySymbols[order.currency] || ''}${(order.amount / 100).toFixed(2)}`
    });

  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500);
    throw new Error('Could not create payment order.');
  }
});

/**
 * @desc    Verify a Razorpay payment and top up wallet
 * @route   POST /api/razorpay/verify-payment
 * @access  Private
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;
  const userId = req.user._id;

  try {
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({
        error: 'Payment verification failed. Signature mismatch.'
      });
    }

    // Retrieve order details to get amount and currency
    const orderDetails = await razorpay.orders.fetch(razorpay_order_id);
    const amount = orderDetails.amount / 100; // Convert from paisa to rupees
    const currency = orderDetails.currency;

    // Update user's wallet balance
    const user = await User.findByIdAndUpdate(
      userId, {
        $inc: {
          walletBalance: amount
        }
      }, {
        new: true
      }
    );

    // Create a transaction record
    await Transaction.create({
      user: userId,
      type: 'top_up',
      amount,
      currency,
      description: 'Wallet top-up via Razorpay',
      razorpay_payment_id,
    });

    res.status(200).json({
      message: 'Payment verified successfully and wallet updated.',
      newBalance: user.walletBalance,
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500);
    throw new Error('Server error during payment verification.');
  }
});

// Helper for currency symbols, can be moved to constants
const currencySymbols = {
  'INR': '₹',
  'USD': '$'
};