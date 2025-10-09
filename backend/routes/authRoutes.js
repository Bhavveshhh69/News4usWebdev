// Authentication routes
import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshSession
} from '../services/authService.js';

import {
  validateEmailFormat,
  validatePasswordStrength,
  validateRequiredFields,
  sanitizeInput
} from '../middleware/validationMiddleware.js';

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
      res.status(200).json(result);
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
      res.status(200).json(result);
    } catch (err) {
      if (err.message === 'Session not found') {
        return res.status(404).json({ error: err.message });
      }
      res.status(400).json({ error: err.message });
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