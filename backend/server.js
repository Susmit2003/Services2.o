import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './src/services/db.service.js';
import { initializeFirebaseAdmin } from './src/services/firebase.service.js';

// Import routes
import authRoutes from './src/routes/auth.routes.js';
import serviceRoutes from './src/routes/service.routes.js';
import bookingRoutes from './src/routes/booking.routes.js';
import reviewRoutes from './src/routes/review.routes.js';
import userRoutes from './src/routes/user.routes.js';
// --- THIS IS THE FIX ---
// Updated the import path to use the plural 'notifications'
import notificationRoutes from './src/routes/notifications.routes.js'; 
import transactionRoutes from './src/routes/transaction.routes.js';
import razorpayRoutes from './src/routes/razorpay.routes.js';

// Initialize Database and Firebase
connectDB();
initializeFirebaseAdmin();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes); // This now correctly uses the imported routes
app.use('/api/wallet/transactions', transactionRoutes);
app.use('/api/razorpay', razorpayRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ 
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});