import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';
import { generateToken } from '../utils/jwt.utils.js'; // <-- Use the centralized token generator

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, mobile } = req.body;

    if (!name || !email || !password || !mobile) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { mobile }] });
    if (userExists) {
        return res.status(400).json({ message: 'User with this email or mobile number already exists' });
    }

    const user = await User.create({
        name,
        email,
        password,
        mobile,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            token: generateToken(user._id), // Use the consistent function
        });
    } else {
        res.status(500);
        throw new Error('Server error: User could not be created.');
    }
});

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ message: 'Please provide your email/mobile and password.' });
    }

    const user = await User.findOne({
        $or: [
            { email: typeof identifier === 'string' ? identifier.toLowerCase() : identifier },
            { mobile: identifier }
        ]
    }).select('+password');

    if (user && (await user.matchPassword(password))) {
        if (!user.isActive) {
            return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
        }
        
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            token: generateToken(user._id), // Use the consistent function
        });
    } else {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }
});

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  // The 'protect' middleware has already found the user and attached it to req.user
  const user = req.user;
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    address: user.address,
    currency: user.currency,
    walletBalance: user.walletBalance,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.mobile = req.body.mobile || user.mobile;

    if (req.body.address) {
        user.address = {
            ...user.address,
            ...req.body.address
        };
    }
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      role: updatedUser.role,
      token: generateToken(updatedUser._id), // Re-issue token with consistent function
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};