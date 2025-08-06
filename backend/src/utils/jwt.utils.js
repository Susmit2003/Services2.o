// backend/src/utils/jwt.utils.js
import jwt from 'jsonwebtoken';

// Define the secret key in one place. Use a more complex key in production.
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-2024';

/**
 * Generates a JWT for a given user ID.
 * @param {string} id - The user's MongoDB document ID.
 * @returns {string} - The generated JSON Web Token.
 */
export const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d', // Token will expire in 30 days
  });
};

/**
 * The secret key used for verifying tokens.
 */
export const secret = JWT_SECRET;