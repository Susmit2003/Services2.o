import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.utils.js';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';


export const signup = asyncHandler(async (req, res) => {
  const { name, mobile, password, email } = req.body;

  // --- FIX: Automatically generate a unique username ---
  // 1. Create a base username from the email address
  let baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  // 2. Add random characters to ensure it's unique
  const randomSuffix = crypto.randomBytes(2).toString('hex');
  const finalUsername = `${baseUsername}${randomSuffix}`;
  
  const existingUser = await User.findOne({ $or: [{ mobile }, { email }] });
  if (existingUser) {
    res.status(409);
    throw new Error('User with this email or mobile number already exists.');
  }

  const user = await User.create({
    name,
    username: finalUsername, // Use the generated username
    mobile, // Use the 'mobile' field from the form
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      mobile: user.mobile,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(500);
    throw new Error('User could not be created.');
  }
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  
  const user = await User.findOne({ 
    $or: [{ email: identifier }, { mobile: identifier }, { username: identifier }] 
  }).select('+password');

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});


export const forgotPassword = async (req, res) => {
  const { mobile } = req.body;
  
  try {
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this mobile number.' });
    }

    // Generate a temporary password
    const tempPassword = crypto.randomBytes(4).toString('hex'); // 8 characters
    const salt = await bcrypt.genSalt(10);
    const hashedTempPassword = await bcrypt.hash(tempPassword, salt);
    
    // Update user's password with temporary password
    user.password = hashedTempPassword;
    await user.save();

    // Return the temporary password in response
    // In production, you should send this via SMS or email
    res.json({
      message: 'Temporary password generated. Please use it to log in and change your password.',
      tempPassword: tempPassword
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};