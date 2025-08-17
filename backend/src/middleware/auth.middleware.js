import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';
import { secret } from '../utils/jwt.utils.js';

// This is the main authentication middleware for your application.
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Get token from the header
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify the token using your JWT_SECRET
      const decoded = jwt.verify(token, secret);

      // 3. Find the user by the ID from the token
      // We exclude the password from being attached to the request object.
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
          res.status(401);
          throw new Error('Not authorized, user not found');
      }

      // 4. If the user is found, proceed to the next step (the controller).
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