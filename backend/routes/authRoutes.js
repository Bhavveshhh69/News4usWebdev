// Authentication routes
import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshSession,
  validateToken
} from '../services/authService.js';

import {
  validateEmailFormat,
  validatePasswordStrength,
  validateRequiredFields,
  sanitizeInput
} from '../middleware/validationMiddleware.js';

import { sanitizeUser } from '../config/security.js';

import {
  authRateLimit
} from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Register endpoint
router.post('/register',
  authRateLimit,
  sanitizeInput,
  validateRequiredFields('email', 'password', 'name'),
  validateEmailFormat,
  validatePasswordStrength,
  async (req, res) => {
    try {
      const result = await registerUser(req.body);
      res.status(201).json(result);
    } catch (err) {
      if (err.message.includes('already exists')) {
        return res.status(409).json({ error: err.message });
      }
      res.status(400).json({ error: err.message });
    }
  }
);

// Login endpoint
router.post('/login',
  authRateLimit,
  sanitizeInput,
  validateRequiredFields('email', 'password'),
  validateEmailFormat,
  async (req, res) => {
    try {
      const result = await loginUser(req.body.email, req.body.password);

      // Set HTTP-only cookie with JWT token (bulletproof security)
      res.cookie('auth_token', result.token, {
        httpOnly: true,        // Prevents XSS attacks
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict',    // CSRF protection
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/'              // Available for all routes
      });

      // Remove token from response body for security
      const { token, ...responseWithoutToken } = result;

      res.status(200).json({
        ...responseWithoutToken,
        message: 'Login successful'
      });
    } catch (err) {
      if (err.message === 'Invalid credentials') {
        return res.status(401).json({ error: err.message });
      }
      if (err.message === 'Account is deactivated') {
        return res.status(403).json({ error: err.message });
      }
      res.status(400).json({ error: err.message });
    }
  }
);

// Logout endpoint
router.post('/logout',
  authRateLimit,
  sanitizeInput,
  validateRequiredFields('sessionId'),
  async (req, res) => {
    try {
      const result = await logoutUser(req.body.sessionId);

      // Clear HTTP-only cookie (bulletproof cleanup)
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });

      res.status(200).json(result);
    } catch (err) {
      if (err.message === 'Session not found') {
        return res.status(404).json({ error: err.message });
      }
      res.status(400).json({ error: err.message });
    }
  }
);

// Get current user endpoint (for cookie-based auth)
router.get('/me',
  async (req, res) => {
    try {
      // Check for JWT token in HTTP-only cookie
      const token = req.cookies?.auth_token;
      if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Validate token and get user info
      const tokenValidation = await validateToken(token);

      if (!tokenValidation.success) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      res.status(200).json({
        success: true,
        user: sanitizeUser(tokenValidation.user)
      });
    } catch (err) {
      res.status(401).json({ error: 'Authentication failed' });
    }
  }
);

// Refresh session endpoint
router.post('/refresh',
  authRateLimit,
  sanitizeInput,
  validateRequiredFields('sessionId'),
  async (req, res) => {
    try {
      const result = await refreshSession(req.body.sessionId);
      res.status(200).json(result);
    } catch (err) {
      if (err.message === 'Invalid session') {
        return res.status(401).json({ error: err.message });
      }
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;