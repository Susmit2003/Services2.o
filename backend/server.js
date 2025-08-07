import dotenv from 'dotenv';
// --- FIX: Load environment variables at the very top ---
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './src/services/db.service.js';

// Import routes
import authRoutes from './src/routes/auth.routes.js';
import serviceRoutes from './src/routes/service.routes.js';
import bookingRoutes from './src/routes/booking.routes.js';
import reviewRoutes from './src/routes/review.routes.js';
import userRoutes from './src/routes/user.routes.js';
import notificationRoutes from './src/routes/notification.routes.js';
import transactionRoutes from './src/routes/transaction.routes.js';
import razorpayRoutes from './src/routes/razorpay.routes.js';


// Connect to the database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wallet/transactions', transactionRoutes);
app.use('/api/razorpay', razorpayRoutes);


// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend API is running...'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ 
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});