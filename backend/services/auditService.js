// Audit service for logging security-relevant events
import { logAuditEvent } from '../repositories/auditRepository.js';

// Log admin user management events
const logAdminUserAction = async (userId, action, targetUserId, details = {}, req = null) => {
  try {
    const eventData = {
      user_id: userId,
      action: action,
      target_type: 'user',
      target_id: targetUserId,
      details: details
    };
    
    // Add IP address and user agent if request object is provided
    if (req) {
      eventData.ip_address = req.ip || req.connection.remoteAddress;
      eventData.user_agent = req.get('User-Agent');
    }
    
    await logAuditEvent(eventData);
  } catch (err) {
    console.error('Failed to log audit event:', err);
    // Don't throw error as audit logging should not break main functionality
  }
};

// Log admin content management events
const logAdminContentAction = async (userId, action, targetType, targetId, details = {}, req = null) => {
  try {
    const eventData = {
      user_id: userId,
      action: action,
      target_type: targetType,
      target_id: targetId,
      details: details
    };
    
    // Add IP address and user agent if request object is provided
    if (req) {
      eventData.ip_address = req.ip || req.connection.remoteAddress;
      eventData.user_agent = req.get('User-Agent');
    }
    
    await logAuditEvent(eventData);
  } catch (err) {
    console.error('Failed to log audit event:', err);
    // Don't throw error as audit logging should not break main functionality
  }
};

// Log authentication events
const logAuthEvent = async (userId, action, details = {}, req = null) => {
  try {
    const eventData = {
      user_id: userId,
      action: action,
      target_type: 'auth',
      target_id: null,
      details: details
    };
    
    // Add IP address and user agent if request object is provided
    if (req) {
      eventData.ip_address = req.ip || req.connection.remoteAddress;
      eventData.user_agent = req.get('User-Agent');
    }
    
    await logAuditEvent(eventData);
  } catch (err) {
    console.error('Failed to log audit event:', err);
    // Don't throw error as audit logging should not break main functionality
  }
};

export {
  logAdminUserAction,
  logAdminContentAction,
  logAuthEvent
};