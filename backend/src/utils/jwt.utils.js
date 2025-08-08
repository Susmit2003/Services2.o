import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined in the .env file.');
}

/**
 * Generates a JWT for a given user ID.
 * @param {string} id - The user's MongoDB document ID.
 * @returns {string} - The generated JSON Web Token.
 */
export const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    // --- THIS IS THE FIX ---
    // The token will now expire in exactly 24 hours.
    expiresIn: '24h',
  });
};

export const secret = JWT_SECRET;