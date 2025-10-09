// Analytics routes
import express from 'express';
import {
  getArticleStatsHandler,
  getUserStatsHandler,
  getPlatformStatsHandler,
  getTopArticlesHandler,
  getTopAuthorsHandler,
  getArticleTrendHandler,
  trackViewHandler,
  getCategoryStatsHandler,
  getTagStatsHandler
} from '../controllers/analyticsController.js';

import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get article view statistics
// GET /api/analytics/article/:articleId
router.get('/article/:articleId', getArticleStatsHandler);

// Get user activity statistics
// GET /api/analytics/user/:userId
router.get('/user/:userId', getUserStatsHandler);

// Get overall platform statistics (admin only)
// GET /api/analytics/platform
router.get('/platform', authenticate, authorize('admin'), getPlatformStatsHandler);

// Get top articles by views
// GET /api/analytics/top-articles
router.get('/top-articles', getTopArticlesHandler);

// Get top authors by article count
// GET /api/analytics/top-authors
router.get('/top-authors', getTopAuthorsHandler);

// Get article view trend data
// GET /api/analytics/article/:articleId/trend
router.get('/article/:articleId/trend', getArticleTrendHandler);

// Track article view
// POST /api/analytics/track-view
router.post('/track-view', trackViewHandler);

// Get category statistics
// GET /api/analytics/categories
router.get('/categories', getCategoryStatsHandler);

// Get tag statistics
// GET /api/analytics/tags
router.get('/tags', getTagStatsHandler);

export default router;