// Authentication and authorization middleware
import { validateToken, validateSession } from '../services/authService.js';

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    // Check for authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Validate token
    const tokenValidation = await validateToken(token);
    
    if (!tokenValidation.success) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Attach user to request
    req.user = tokenValidation.user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Authentication failed', message: err.message });
  }
};

// Authorization middleware for roles
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Check if user has required role
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      next();
    } catch (err) {
      return res.status(500).json({ error: 'Authorization check failed', message: err.message });
    }
  };
};

// Optional authentication middleware (for endpoints that can be accessed by both authenticated and unauthenticated users)
const optionalAuth = async (req, res, next) => {
  try {
    // Check for authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token, continue without user
      next();
      return;
    }
    
    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Validate token
    const tokenValidation = await validateToken(token);
    
    if (tokenValidation.success) {
      // Attach user to request
      req.user = tokenValidation.user;
    }
    
    next();
  } catch (err) {
    // If token validation fails, continue without user
    next();
  }
};

export {
  authenticate,
  authorize,
  optionalAuth
};