// User Profile controller to handle HTTP requests
import {
  createOrUpdateUserProfile,
  getUserProfile,
  updatePreferences,
  getUserPreferences,
  getUserAuthoredArticles,
  getUserFavoriteArticlesList,
  addArticleToFavorites,
  removeArticleFromFavorites
} from '../services/userProfileService.js';

import { authenticate } from '../middleware/authMiddleware.js';

// Create or update user profile
const upsertUserProfileHandler = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is attached to request by auth middleware
    const profileData = req.body;
    
    const result = await createOrUpdateUserProfile(userId, profileData);
    
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to update user profile'
    });
  }
};

// Get user profile by user ID
const getUserProfileHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await getUserProfile(userId);
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'User profile not found') {
      res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    } else if (err.message === 'Invalid user ID') {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    } else {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve user profile'
      });
    }
  }
};

// Update user preferences
const updatePreferencesHandler = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is attached to request by auth middleware
    const preferences = req.body;
    
    const result = await updatePreferences(userId, preferences);
    
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to update user preferences'
    });
  }
};

// Get user preferences by user ID
const getUserPreferencesHandler = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is attached to request by auth middleware
    
    const result = await getUserPreferences(userId);
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Invalid user ID') {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    } else {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve user preferences'
      });
    }
  }
};

// Get user's authored articles with pagination
const getUserArticlesHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit, offset } = req.query;
    
    const result = await getUserAuthoredArticles(
      userId,
      parseInt(limit) || 10,
      parseInt(offset) || 0
    );
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Invalid user ID') {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    } else {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve user articles'
      });
    }
  }
};

// Get user's favorite articles with pagination
const getUserFavoriteArticlesHandler = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is attached to request by auth middleware
    const { limit, offset } = req.query;
    
    const result = await getUserFavoriteArticlesList(
      userId,
      parseInt(limit) || 10,
      parseInt(offset) || 0
    );
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Invalid user ID') {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    } else {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve user favorite articles'
      });
    }
  }
};

// Add article to user's favorites
const addArticleToFavoritesHandler = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is attached to request by auth middleware
    const { articleId } = req.body;
    
    const result = await addArticleToFavorites(userId, articleId);
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Invalid user ID' || err.message === 'Invalid article ID') {
      res.status(404).json({
        success: false,
        message: err.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to add article to favorites'
      });
    }
  }
};

// Remove article from user's favorites
const removeArticleFromFavoritesHandler = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is attached to request by auth middleware
    const { articleId } = req.body;
    
    const result = await removeArticleFromFavorites(userId, articleId);
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Invalid user ID' || err.message === 'Invalid article ID') {
      res.status(404).json({
        success: false,
        message: err.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to remove article from favorites'
      });
    }
  }
};

export {
  upsertUserProfileHandler,
  getUserProfileHandler,
  updatePreferencesHandler,
  getUserPreferencesHandler,
  getUserArticlesHandler,
  getUserFavoriteArticlesHandler,
  addArticleToFavoritesHandler,
  removeArticleFromFavoritesHandler
};