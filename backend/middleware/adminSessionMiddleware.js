// Admin session validation middleware
import { findSessionById } from '../repositories/sessionRepository.js';
import { findUserById } from '../repositories/userRepository.js';

// Admin session validation middleware
const validateAdminSession = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Check for session ID in headers or request
    const sessionId = req.headers['x-session-id'] || req.body.sessionId;
    if (!sessionId) {
      return res.status(401).json({ error: 'Session ID required for admin operations' });
    }
    
    // Validate session
    const session = await findSessionById(sessionId);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
    
    // Check if session belongs to the authenticated user
    if (session.user_id !== req.user.id) {
      return res.status(401).json({ error: 'Session does not belong to authenticated user' });
    }
    
    // Check if user is still active
    const user = await findUserById(req.user.id);
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User account is inactive' });
    }
    
    // Check if user still has admin role
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'User no longer has admin privileges' });
    }
    
    // Attach session to request
    req.session = session;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Session validation failed', message: err.message });
  }
};

export {
  validateAdminSession
};