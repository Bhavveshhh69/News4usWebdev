// Session repository with ACID compliance
import { executeQuery } from '../config/db-utils.js';
import { generateSessionId } from '../config/security.js';

// Create a new session
const createSession = async (userId, expiresInHours = 24) => {
  try {
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    
    const query = `
      INSERT INTO sessions (session_id, user_id, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, session_id, user_id, expires_at, created_at
    `;
    
    const values = [sessionId, userId, expiresAt];
    const result = await executeQuery(query, values);
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Find session by session ID
const findSessionById = async (sessionId) => {
  try {
    const query = `
      SELECT s.*, u.is_active as user_is_active
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_id = $1 AND s.expires_at > NOW() AND u.is_active = true
    `;
    const values = [sessionId];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Update session expiration
const extendSession = async (sessionId, expiresInHours = 24) => {
  try {
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    
    const query = `
      UPDATE sessions 
      SET expires_at = $1, updated_at = NOW()
      WHERE session_id = $2
      RETURNING id, session_id, user_id, expires_at, updated_at
    `;
    
    const values = [expiresAt, sessionId];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Session not found or expired');
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Delete session (logout)
const deleteSession = async (sessionId) => {
  try {
    const query = 'DELETE FROM sessions WHERE session_id = $1 RETURNING id';
    const values = [sessionId];
    const result = await executeQuery(query, values);
    
    return result.rowCount > 0;
  } catch (err) {
    throw err;
  }
};

// Delete expired sessions
const cleanupExpiredSessions = async () => {
  try {
    const query = 'DELETE FROM sessions WHERE expires_at < NOW()';
    const result = await executeQuery(query);
    
    return result.rowCount;
  } catch (err) {
    throw err;
  }
};

// Delete all sessions for a user (force logout from all devices)
const deleteAllUserSessions = async (userId) => {
  try {
    const query = 'DELETE FROM sessions WHERE user_id = $1';
    const values = [userId];
    const result = await executeQuery(query, values);
    
    return result.rowCount;
  } catch (err) {
    throw err;
  }
};

// Get all sessions for a user
const findUserSessions = async (userId) => {
  try {
    const query = `
      SELECT id, session_id, created_at, expires_at
      FROM sessions 
      WHERE user_id = $1 AND expires_at > NOW()
      ORDER BY created_at DESC
    `;
    const values = [userId];
    const result = await executeQuery(query, values);
    
    return result.rows;
  } catch (err) {
    throw err;
  }
};

// Delete a specific session by ID and user ID
const deleteSessionById = async (sessionId, userId) => {
  try {
    const query = 'DELETE FROM sessions WHERE session_id = $1 AND user_id = $2 RETURNING id';
    const values = [sessionId, userId];
    const result = await executeQuery(query, values);
    
    return result.rowCount > 0;
  } catch (err) {
    throw err;
  }
};

export {
  createSession,
  findSessionById,
  extendSession,
  deleteSession,
  cleanupExpiredSessions,
  deleteAllUserSessions,
  findUserSessions,
  deleteSessionById
};