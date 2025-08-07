// import asyncHandler from 'express-async-handler';
// import User from '../models/user.model.js';
// import { generateToken } from '../utils/jwt.utils.js';
// import { getCoordsForPincode } from '../utils/location.utils.js';

// // --- FIX: Import the missing 'crypto' module ---
// import crypto from 'crypto';

// /**
//  * @desc    Register a new user
//  * @route   POST /api/users/register
//  * @access  Public
//  */
// const registerUser = asyncHandler(async (req, res) => {
//     const { name, email, password, mobile } = req.body;

//     if (!name || !email || !password || !mobile) {
//         res.status(400);
//         throw new Error('Please provide all required fields');
//     }

//     const userExists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { mobile }] });
//     if (userExists) {
//         res.status(409); // Conflict
//         throw new Error('User with this email or mobile number already exists');
//     }

//     // This part now works because 'crypto' is imported
//     const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
//     const randomSuffix = crypto.randomBytes(2).toString('hex');
//     const finalUsername = `${baseUsername}${randomSuffix}`;

//     const user = await User.create({
//         name,
//         username: finalUsername,
//         email,
//         password,
//         mobile,
//     });

//     if (user) {
//         res.status(201).json({
//             _id: user._id,
//             name: user.name,
//             username: user.username,
//             email: user.email,
//             mobile: user.mobile,
//             role: user.role,
//             token: generateToken(user._id),
//         });
//     } else {
//         res.status(500);
//         throw new Error('Server error: User could not be created.');
//     }
// });

// /**
//  * @desc    Authenticate user & get token (Login)
//  * @route   POST /api/users/login
//  * @access  Public
//  */
// const loginUser = asyncHandler(async (req, res) => {
//     const { identifier, password } = req.body;
//     if (!identifier || !password) {
//         res.status(400).json({ message: 'Please provide credentials.' });
//     }

//     const user = await User.findOne({
//         $or: [
//             { email: identifier },
//             { mobile: identifier },
//             { username: identifier }
//         ]
//     }).select('+password');

//     if (user && (await user.matchPassword(password))) {
//         res.json({
//             _id: user._id,
//             name: user.name,
//             email: user.email,
//             mobile: user.mobile,
//             role: user.role,
//             token: generateToken(user._id),
//         });
//     } else {
//         res.status(401);
//         throw new Error('Invalid credentials');
//     }
// });


// const getUserProfile = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id);
//   if (!user) { res.status(404); throw new Error('User not found'); }
//   res.json({
//     _id: user._id, name: user.name, email: user.email, mobile: user.mobile,
//     role: user.role, address: user.address, currency: user.currency,
//     walletBalance: user.walletBalance, profileImage: user.profileImage,
//   });
// });

// const updateUserProfile = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id);
//   if (!user) { res.status(404); throw new Error('User not found'); }

//   user.name = req.body.name || user.name;
//   user.mobile = req.body.mobile || user.mobile;
//   user.profileImage = req.body.profileImage || user.profileImage;

//   if (req.body.address) {
//     user.address = { ...user.address, ...req.body.address };

//     if (req.body.address.pinCode) {
//       const coords = await getCoordsForPincode(req.body.address.pinCode);
//       if (coords) {
//         user.location = {
//           type: 'Point',
//           coordinates: [coords.longitude, coords.latitude],
//         };
//         console.log(`Updated location for user ${user._id}`);
//       } else {
//         user.location = undefined; 
//       }
//     }
//   }

//   const updatedUser = await user.save();
//   res.json({
//     _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email,
//     mobile: updatedUser.mobile, address: updatedUser.address,
//   });
// });

// export {
//   registerUser,
//   loginUser,
//   getUserProfile,
//   updateUserProfile
// };







// ... other imports at the top
import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';
import { getCoordsForPincode } from '../utils/location.utils.js';
import crypto from 'crypto';
import { generateToken, secret } from '../utils/jwt.utils.js'; // <-- Make sure 'secret' is imported here too
// ...

const loginUser = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
        res.status(400).json({ message: 'Please provide credentials.' });
    }

    // --- ADDED FOR DEBUGGING ---
    console.log('[Login Controller] Creating token. Using SECRET:', secret);
    // -------------------------

    const user = await User.findOne({
        $or: [
            { email: identifier },
            { mobile: identifier },
            { username: identifier }
        ]
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

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, mobile } = req.body;

    if (!name || !email || !password || !mobile) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    const userExists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { mobile }] });
    if (userExists) {
        res.status(409); // Conflict
        throw new Error('User with this email or mobile number already exists');
    }

    // This part now works because 'crypto' is imported
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomSuffix = crypto.randomBytes(2).toString('hex');
    const finalUsername = `${baseUsername}${randomSuffix}`;

    const user = await User.create({
        name,
        username: finalUsername,
        email,
        password,
        mobile,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            token: generateToken(user._id),
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


const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({
    _id: user._id, name: user.name, email: user.email, mobile: user.mobile,
    role: user.role, address: user.address, currency: user.currency,
    walletBalance: user.walletBalance, profileImage: user.profileImage,
  });
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  user.name = req.body.name || user.name;
  user.mobile = req.body.mobile || user.mobile;
  user.profileImage = req.body.profileImage || user.profileImage;

  if (req.body.address) {
    user.address = { ...user.address, ...req.body.address };

    if (req.body.address.pinCode) {
      const coords = await getCoordsForPincode(req.body.address.pinCode);
      if (coords) {
        user.location = {
          type: 'Point',
          coordinates: [coords.longitude, coords.latitude],
        };
        console.log(`Updated location for user ${user._id}`);
      } else {
        user.location = undefined; 
      }
    }
  }

  const updatedUser = await user.save();
  res.json({
    _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email,
    mobile: updatedUser.mobile, address: updatedUser.address,
  });
});

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
};



// ... rest of the file (registerUser, getUserProfile, etc.)