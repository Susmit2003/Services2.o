import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';
import { generateToken } from '../utils/jwt.utils.js';

// --- registerUser function remains the same ---
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, mobile } = req.body;
    if (!name || !email || !password || !mobile) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }
    const userExists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { mobile }] });
    if (userExists) {
        return res.status(400).json({ message: 'User with this email or mobile already exists' });
    }
    const user = await User.create({ name, email, password, mobile, role: 'user', currency: 'INR' });
    if (user) {
        res.status(201).json({ _id: user._id, name: user.name, email: user.email, mobile: user.mobile, role: user.role, token: generateToken(user._id) });
    } else {
        res.status(500);
        throw new Error('Server error: User could not be created.');
    }
});


/**
 * @desc    Authenticate user & get token (Login) - ROBUST VERSION
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ message: 'Please provide your email/mobile and password.' });
    }

    let user;
    try {
        // --- FIX 1: More specific and safe database query ---
        console.log(`Attempting to find user with identifier: ${identifier}`);
        user = await User.findOne({
            $or: [
                { email: typeof identifier === 'string' ? identifier.toLowerCase() : identifier },
                { mobile: identifier }
            ]
        }).select('+password'); // Explicitly include password for comparison

        if (!user) {
            console.log('Login failed: No user found.');
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // --- FIX 2: Safer password comparison ---
        console.log(`User found: ${user.email}. Comparing password...`);
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            console.log('Login failed: Password does not match.');
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // If everything is correct, send success response
        console.log('Login successful.');
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            token: generateToken(user._id),
        });

    } catch (error) {
        // --- FIX 3: Catch any unexpected errors during the process ---
        console.error('CRITICAL LOGIN ERROR:', error);
        res.status(500);
        throw new Error('A critical server error occurred during login.');
    }
});


// --- getUserProfile and updateUserProfile functions remain the same ---
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({ _id: user._id, name: user.name, email: user.email, mobile: user.mobile, role: user.role, address: user.address, currency: user.currency, walletBalance: user.walletBalance, profileImage: user.profileImage, createdAt: user.createdAt });
  } else {
    res.status(404).throw(new Error('User not found'));
  }
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.mobile = req.body.mobile || user.mobile;
    if (req.body.address) { user.address = { ...user.address, ...req.body.address }; }
    if (req.body.password) { user.password = req.body.password; }
    const updatedUser = await user.save();
    res.json({ _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, mobile: updatedUser.mobile, role: updatedUser.role, token: generateToken(updatedUser._id) });
  } else {
    res.status(404).throw(new Error('User not found'));
  }
});


export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};