// // backend/src/middleware/auth.middleware.js
// import jwt from 'jsonwebtoken';
// import asyncHandler from 'express-async-handler';
// import User from '../models/user.model.js';
// import { secret } from '../utils/jwt.utils.js'; // <-- Import the secret from our utility file

// const protect = asyncHandler(async (req, res, next) => {
//   let token;

//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     try {
//       // 1. Get token from header
//       token = req.headers.authorization.split(' ')[1];

//       // 2. Verify the token using the consistent secret
//       const decoded = jwt.verify(token, secret);

//       // 3. Find the user by ID from the token, excluding the password
//       const user = await User.findById(decoded.id).select('-password');

//       // 4. Perform checks
//       if (!user) {
//         res.status(401);
//         throw new Error('Not authorized, user not found for this token');
//       }

//       if (!user.isActive) {
//         res.status(403); // 403 Forbidden
//         throw new Error('User account is deactivated');
//       }
      
//       // 5. Attach user object to the request
//       req.user = user;
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
import { secret } from '../utils/jwt.utils.js'; // Imports the secret

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // --- ADDED FOR DEBUGGING ---
  console.log('[Auth Middleware] Verifying token. Using SECRET:', secret);
  // -------------------------

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        res.status(401);
        throw new Error('Not authorized, user not found for this token');
      }

      req.user = user;
      next();

    } catch (error) {
      console.error('AUTHENTICATION ERROR:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

export { protect };