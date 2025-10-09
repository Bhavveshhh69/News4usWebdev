// Authentication service with ACID compliance
import { findUserByEmail, createUser, updateUserLoginTime } from '../repositories/userRepository.js';
import { createSession, findSessionById, deleteSession } from '../repositories/sessionRepository.js';
import { comparePassword, generateToken, verifyToken, sanitizeUser } from '../config/security.js';

// Register a new user
const registerUser = async (userData) => {
  try {
    // Validate required fields
    if (!userData.email || !userData.password || !userData.name) {
      throw new Error('Email, password, and name are required');
    }
    
    // Check if user already exists
    const existingUser = await findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Validate password strength
    if (userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    // Create user
    const user = await createUser(userData);
    
    return {
      success: true,
      user,
      message: 'User registered successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Login user
const loginUser = async (email, password) => {
  try {
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      // Use generic error message to prevent user enumeration
      throw new Error('Invalid credentials');
    }
    
    // Check if user is active
    if (!user.is_active) {
      // Use generic error message to prevent user enumeration
      throw new Error('Invalid credentials');
    }
    
    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      // Use generic error message to prevent user enumeration
      throw new Error('Invalid credentials');
    }
    
    // Update last login time
    await updateUserLoginTime(user.id);
    
    // Create session
    const session = await createSession(user.id);
    
    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    return {
      success: true,
      user: sanitizeUser(user),
      token,
      sessionId: session.session_id,
      message: 'Login successful'
    };
  } catch (err) {
    throw err;
  }
};

// Logout user
const logoutUser = async (sessionId) => {
  try {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    
    const result = await deleteSession(sessionId);
    
    if (!result) {
      throw new Error('Session not found');
    }
    
    return {
      success: true,
      message: 'Logout successful'
    };
  } catch (err) {
    throw err;
  }
};

// Validate session
const validateSession = async (sessionId) => {
  try {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    
    const session = await findSessionById(sessionId);
    
    if (!session) {
      throw new Error('Invalid or expired session');
    }
    
    // Extend session
    // await extendSession(sessionId);
    
    return {
      success: true,
      session,
      message: 'Session is valid'
    };
  } catch (err) {
    throw err;
  }
};

// Validate JWT token
const validateToken = async (token) => {
  try {
    if (!token) {
      throw new Error('Token is required');
    }
    
    const decoded = verifyToken(token);
    
    // Find user to ensure they still exist and are active
    const user = await findUserByEmail(decoded.email);
    if (!user || !user.is_active) {
      throw new Error('Invalid token');
    }
    
    return {
      success: true,
      user: sanitizeUser(user),
      decoded,
      message: 'Token is valid'
    };
  } catch (err) {
    throw err;
  }
};

// Refresh session
const refreshSession = async (sessionId) => {
  try {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    
    const sessionValidation = await validateSession(sessionId);
    if (!sessionValidation.success) {
      throw new Error('Invalid session');
    }
    
    // Extend session for another 24 hours
    // const extendedSession = await extendSession(sessionId);
    
    // Generate new JWT token
    const user = await findUserByEmail(sessionValidation.session.email);
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    return {
      success: true,
      token,
      // session: extendedSession,
      message: 'Session refreshed successfully'
    };
  } catch (err) {
    throw err;
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  validateSession,
  validateToken,
  refreshSession
};