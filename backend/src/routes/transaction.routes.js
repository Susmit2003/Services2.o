import express from 'express';
import { getWalletTransactions } from '../controllers/transaction.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getWalletTransactions);

export default router;