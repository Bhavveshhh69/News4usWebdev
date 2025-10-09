// Authentication controller to handle HTTP requests
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshSession
} from '../services/authService.js';

import { 
  getUserSessions, 
  deleteSessionById, 
  deleteAllUserSessions 
} from '../services/sessionService.js';

// Register endpoint
const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    if (err.message.includes('already exists')) {
      return res.status(409).json({ error: err.message });
    }
    res.status(400).json({ error: err.message });
  }
};

// Login endpoint
const login = async (req, res) => {
  try {
    const result = await loginUser(req.body.email, req.body.password);
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Invalid credentials') {
      return res.status(401).json({ error: err.message });
    }
    res.status(400).json({ error: err.message });
  }
};

// Logout endpoint
const logout = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const result = await logoutUser(sessionId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get user sessions
const getSessions = async (req, res) => {
  try {
    const sessions = await getUserSessions(req.user.id);
    res.status(200).json({
      success: true,
      sessions,
      message: 'Sessions retrieved successfully'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a specific session
const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await deleteSessionById(sessionId, req.user.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete all sessions (logout from all devices)
const deleteAllSessions = async (req, res) => {
  try {
    const result = await deleteAllUserSessions(req.user.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export {
  register,
  login,
  logout,
  getSessions,
  deleteSession,
  deleteAllSessions
};