import asyncHandler from 'express-async-handler';
import Transaction from '../models/transaction.model.js';

/**
 * @desc    Get all transactions for the logged-in user
 * @route   GET /api/wallet/transactions
 * @access  Private
 */
export const getWalletTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({
    user: req.user._id
  }).sort({
    createdAt: -1
  }).limit(50); // Limit to the last 50 transactions

  // Transform data to match frontend expectations
  const transformedTransactions = transactions.map(t => ({
    id: t._id,
    type: t.type,
    amount: t.amount,
    description: t.description,
    currency: t.currency,
    createdAt: t.createdAt,
  }));

  res.status(200).json(transformedTransactions);
});