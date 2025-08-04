import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ mobile: '+1234567890' });
    if (existingUser) {
      console.log('Test user already exists');
      process.exit(0);
    }

    // Create test user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('testpass123', salt);
    
    const testUser = await User.create({
      name: 'Test User',
      mobile: '+1234567890',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user',
      isActive: true,
      currency: 'USD',
      freeTransactionsUsed: 0,
      dailyBookings: 0,
      address: {
        pinCode: '12345'
      }
    });

    console.log('Test user created successfully:', {
      id: testUser._id,
      name: testUser.name,
      mobile: testUser.mobile,
      email: testUser.email
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
};

createTestUser(); 