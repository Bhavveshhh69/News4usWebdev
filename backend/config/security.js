// Security utilities
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Salt rounds for bcrypt hashing
const SALT_ROUNDS = 12;

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'news4us_jwt_secret_key_2025';

// Add validation for JWT secret in production
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'news4us_jwt_secret_key_2025')) {
  throw new Error('JWT_SECRET must be set in production environment');
}

// Hash a password
const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return hashedPassword;
  } catch (err) {
    throw new Error('Password hashing failed');
  }
};

// Compare password with hash
const comparePassword = async (password, hash) => {
  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (err) {
    throw new Error('Password comparison failed');
  }
};

// Generate JWT token
const generateToken = (payload, expiresIn = '24h') => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn });
    return token;
  } catch (err) {
    throw new Error('Token generation failed');
  }
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error('Token verification failed');
  }
};

// Generate random string
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate session ID
const generateSessionId = () => {
  return generateRandomString(32);
};

// Sanitize user data for response
const sanitizeUser = (user) => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

export {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  generateRandomString,
  generateSessionId,
  sanitizeUser,
  SALT_ROUNDS,
  JWT_SECRET
};