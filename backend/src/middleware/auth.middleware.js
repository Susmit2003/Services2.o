// import jwt from 'jsonwebtoken';
// import asyncHandler from 'express-async-handler';
// import User from '../models/user.model.js';
// import { secret } from '../utils/jwt.utils.js';

// // This is the main authentication middleware for your application.
// const protect = asyncHandler(async (req, res, next) => {
//   let token;

//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     try {
//       // 1. Get token from the header
//       token = req.headers.authorization.split(' ')[1];

//       // 2. Verify the token using your JWT_SECRET
//       const decoded = jwt.verify(token, secret);

//       // 3. Find the user by the ID from the token
//       // We exclude the password from being attached to the request object.
//       req.user = await User.findById(decoded.id).select('-password');
      
//       if (!req.user) {
//           res.status(401);
//           throw new Error('Not authorized, user not found');
//       }

//       // 4. If the user is found, proceed to the next step (the controller).
//       next();

//     } catch (error) {
//       console.error('AUTHENTICATION ERROR:', error.message);
//       res.status(401);
//       throw new Error('Not authorized, token failed');
//     }
//   }

//   if (!token) {
//     res.status(401);
//     throw new Error('Not authorized, no token provided');
//   }
// });

// export { protect };



import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';
import cookie from 'cookie';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  console.log('Headers:', req.headers.authorization);

  // 1. Try to get token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
    } catch (error) {
      // Malformed header, proceed to check cookies
    }
  }
  // 2. If not in header, try to get it from the cookies
  else if (req.headers.cookie) {
    try {
      const cookies = cookie.parse(req.headers.cookie);
      token = cookies.authToken;
    } catch (error) {
      // Malformed cookie, proceed to fail
    }
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Attach user to the request object
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      next();
    } catch (error) {
      console.error('Authentication error:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};