import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/user.model.js';
import Transaction from '../models/transaction.model.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount) || amount <= 0) {
      res.status(400); throw new Error("A valid amount is required.");
  }
  const options = {
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: `receipt_order_${new Date().getTime()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error("RAZORPAY ORDER CREATION ERROR:", error);
    res.status(500); throw new Error('Failed to create Razorpay order.');
  }
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const userId = req.user._id;

  try {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error("SIGNATURE MISMATCH!");
      console.error("Expected Signature:", expectedSignature);
      console.error("Received Signature:", razorpay_signature);
      res.status(400);
      throw new Error('Payment verification failed. Signature mismatch.');
    }

    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    const amount = paymentDetails.amount / 100;

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: amount } },
      { new: true }
    );

    await Transaction.create({
      user: userId, type: 'top_up', amount, currency: 'INR',
      description: 'Wallet top-up via Razorpay',
      razorpay_payment_id,
    });

    res.status(200).json({
      message: 'Payment verified successfully.',
      newBalance: user.walletBalance,
    });

  } catch (error) {
    console.error("RAZORPAY VERIFICATION ERROR:", error);
    res.status(500); throw new Error('Server error during payment verification.');
  }
});