// User Profile routes
import express from 'express';
import {
  upsertUserProfileHandler,
  getUserProfileHandler,
  updatePreferencesHandler,
  getUserPreferencesHandler,
  getUserArticlesHandler,
  getUserFavoriteArticlesHandler,
  addArticleToFavoritesHandler,
  removeArticleFromFavoritesHandler
} from '../controllers/userProfileController.js';

import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create or update user profile
// PUT /api/user/profile
router.put('/profile', authenticate, upsertUserProfileHandler);

// Get user profile by user ID
// GET /api/user/profile/:userId
router.get('/profile/:userId', getUserProfileHandler);

// Update user preferences
// PUT /api/user/preferences
router.put('/preferences', authenticate, updatePreferencesHandler);

// Get user preferences
// GET /api/user/preferences
router.get('/preferences', authenticate, getUserPreferencesHandler);

// Get user's authored articles with pagination
// GET /api/user/articles/:userId
router.get('/articles/:userId', getUserArticlesHandler);

// Get user's favorite articles with pagination
// GET /api/user/favorites
router.get('/favorites', authenticate, getUserFavoriteArticlesHandler);

// Add article to user's favorites
// POST /api/user/favorites
router.post('/favorites', authenticate, addArticleToFavoritesHandler);

// Remove article from user's favorites
// DELETE /api/user/favorites
router.delete('/favorites', authenticate, removeArticleFromFavoritesHandler);

export default router;