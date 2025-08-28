import dotenv from 'dotenv';
// Load environment variables at the very top
dotenv.config();

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie'; // Make sure you have run 'npm install cookie'

import connectDB from './src/services/db.service.js';
import { initializeFirebaseAdmin } from './src/services/firebase.service.js';
import User from './src/models/user.model.js';
import { saveMessage } from './src/controllers/chat.controller.js';

// Import all routes
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import serviceRoutes from './src/routes/service.routes.js';
import bookingRoutes from './src/routes/booking.routes.js';
import reviewRoutes from './src/routes/review.routes.js';
import notificationRoutes from './src/routes/notifications.routes.js';
import transactionRoutes from './src/routes/transaction.routes.js';
import razorpayRoutes from './src/routes/razorpay.routes.js';
import chatRoutes from './src/routes/chat.routes.js';

// Initialize Database and Firebase
connectDB();
initializeFirebaseAdmin();

// 1. Initialize the Express app
const app = express();
// 2. Create the HTTP server using the app
const server = http.createServer(app);
// 3. Attach Socket.IO to the HTTP server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true // Important for HttpOnly cookies
  },
});

// Middleware
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
app.use('/api/notifications', notificationRoutes);
app.use('/api/wallet/transactions', transactionRoutes);
app.use('/api/razorpay', razorpayRoutes);
app.use('/api/chat', chatRoutes);

// Robust Socket.IO Authentication Middleware
io.use(async (socket, next) => {
  let token;

  // 1. Try to get token from the auth payload (for non-HttpOnly cookies)
  if (socket.handshake.auth && socket.handshake.auth.token) {
    token = socket.handshake.auth.token;
  }
  // 2. If not found, try to get it from the HTTP cookie headers (for HttpOnly cookies)
  else if (socket.handshake.headers.cookie) {
    const cookies = cookie.parse(socket.handshake.headers.cookie);
    token = cookies.authToken; // The cookie must be named 'authToken'
  }

  if (!token) {
    return next(new Error('Authentication error: Token not provided.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = await User.findById(decoded.id).select('-password');
    if (!socket.user) {
      return next(new Error('Authentication error: User not found.'));
    }
    next();
  } catch (error) {
    console.error('Detailed JWT Error:', error.name, error.message);
    next(new Error('Authentication error: Invalid token.'));
  }
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.user.name} (${socket.id})`);

  socket.on('joinRoom', (bookingId) => {
    socket.join(bookingId);
    console.log(`[JOIN] User ${socket.user.name} joined room: ${bookingId}`);
  });

  socket.on('sendMessage', async (messageData) => {
    const savedMessage = await saveMessage(messageData);
    if (savedMessage) {
      io.to(messageData.bookingId).emit('receiveMessage', savedMessage);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.user.name} (${socket.id})`);
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

const PORT = process.env.PORT || 5000;

// Start the HTTP server, which includes Express and Socket.IO
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});