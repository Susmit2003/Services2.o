import jwt from 'jsonwebtoken';

// Use a consistent secret for development
const JWT_SECRET = 'your-super-secret-jwt-key-here-2024';

export const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};