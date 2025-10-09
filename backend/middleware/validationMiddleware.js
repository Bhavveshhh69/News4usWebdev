// Input validation middleware
import { validateEmail } from '../config/db-utils.js';

// Validate email format
const validateEmailFormat = (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Email validation failed', message: err.message });
  }
};

// Validate password strength
const validatePasswordStrength = (req, res, next) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    // Check minimum length
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    
    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one uppercase letter' });
    }
    
    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one lowercase letter' });
    }
    
    // Check for number
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one number' });
    }
    
    // Check for special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one special character' });
    }
    
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Password validation failed', message: err.message });
  }
};

// Validate required fields
const validateRequiredFields = (...requiredFields) => {
  return (req, res, next) => {
    try {
      const missingFields = [];
      
      for (const field of requiredFields) {
        if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
          missingFields.push(field);
        }
      }
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: 'Missing required fields', 
          missingFields 
        });
      }
      
      next();
    } catch (err) {
      return res.status(500).json({ error: 'Field validation failed', message: err.message });
    }
  };
};

// Sanitize input to prevent injection attacks
const sanitizeInput = (req, res, next) => {
  try {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      for (const [key, value] of Object.entries(req.body)) {
        if (typeof value === 'string') {
          // Remove potentially dangerous characters
          req.body[key] = value
            .replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, '') // Remove control characters
            .trim(); // Trim whitespace
        }
      }
    }
    
    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string') {
          req.query[key] = value
            .replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, '')
            .trim();
        }
      }
    }
    
    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      for (const [key, value] of Object.entries(req.params)) {
        if (typeof value === 'string') {
          req.params[key] = value
            .replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, '')
            .trim();
        }
      }
    }
    
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Input sanitization failed', message: err.message });
  }
};

export {
  validateEmailFormat,
  validatePasswordStrength,
  validateRequiredFields,
  sanitizeInput
};