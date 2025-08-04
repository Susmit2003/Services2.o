import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.utils.js';
import crypto from 'crypto';

export const signup = async (req, res) => {
  const { name, mobile, password, email } = req.body;
  try {
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(409).json({ message: 'Mobile number already registered.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      name,
      mobile,
      email,
      password: hashedPassword,
    });
    const token = generateToken(newUser._id);
    res.status(201).json({
      message: 'Signup successful',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        mobile: newUser.mobile,
        email: newUser.email,
        role: newUser.role,
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

export const login = async (req, res) => {
  const { mobile, password } = req.body;
  
  try {
    // Find user by mobile
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated.' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user data (excluding password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      currency: user.currency,
      address: user.address,
      freeTransactionsUsed: user.freeTransactionsUsed,
      dailyBookings: user.dailyBookings
    };

    res.status(200).json({ 
      message: 'Login successful',
      token, 
      user: userResponse 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

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