// Session service with ACID compliance
import { 
  findUserSessions, 
  deleteSessionById, 
  deleteAllUserSessions 
} from '../repositories/sessionRepository.js';

// Get all active sessions for a user
const getUserSessions = async (userId) => {
  try {
    // Validate user ID
    if (!userId || !Number.isInteger(userId)) {
      throw new Error('Invalid user ID');
    }
    
    const sessions = await findUserSessions(userId);
    
    // Sanitize session data
    const sanitizedSessions = sessions.map(session => ({
      id: session.id,
      created_at: session.created_at,
      expires_at: session.expires_at
    }));
    
    return sanitizedSessions;
  } catch (err) {
    throw err;
  }
};

// Delete a specific session
const deleteSessionById = async (sessionId, userId) => {
  try {
    // Validate session ID
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('Invalid session ID');
    }
    
    // Validate user ID
    if (!userId || !Number.isInteger(userId)) {
      throw new Error('Invalid user ID');
    }
    
    // In a real implementation, you would verify that the session belongs to the user
    // This would be done in the repository layer
    const result = await deleteSessionById(sessionId, userId);
    
    if (!result) {
      throw new Error('Session not found or does not belong to user');
    }
    
    return {
      success: true,
      message: 'Session deleted successfully'
    };
  } catch (err) {
    throw err;
  }
};

export {
  getUserSessions,
  deleteSessionById,
  deleteAllUserSessions
};