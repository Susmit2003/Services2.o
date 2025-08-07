import jwt from 'jsonwebtoken';

// --- FIX: Remove the fallback value to ensure the .env secret is always used ---
const JWT_SECRET = process.env.JWT_SECRET;

// This check will cause the server to stop immediately if the secret is not configured,
// which is much safer than using a default key.
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
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * The secret key used for verifying tokens.
 */
export const secret = JWT_SECRET;