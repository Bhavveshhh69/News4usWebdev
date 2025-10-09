// Admin routes
import express from 'express';
import {
  getUserListHandler,
  getUserDetailsHandler,
  updateUserRoleHandler,
  setUserActiveStatusHandler,
  getArticleListHandler,
  getCategoryListHandler,
  getTagListHandler,
  getSystemStatsHandler,
  getRecentActivityHandler
} from '../controllers/adminController.js';

import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateAdminSession } from '../middleware/adminSessionMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin authorization
router.use(authenticate, authorize('admin'));

// Admin routes that require additional session validation
router.use(['/users/:userId/role', '/users/:userId/status'], validateAdminSession);

// Get user list with filtering and pagination
// GET /api/admin/users
router.get('/users', getUserListHandler);

// Get user details by ID
// GET /api/admin/users/:userId
router.get('/users/:userId', getUserDetailsHandler);

// Update user role (requires additional session validation)
// PUT /api/admin/users/:userId/role
router.put('/users/:userId/role', updateUserRoleHandler);

// Set user active status (requires additional session validation)
// PUT /api/admin/users/:userId/status
router.put('/users/:userId/status', setUserActiveStatusHandler);

// Get article list with filtering and pagination
// GET /api/admin/articles
router.get('/articles', getArticleListHandler);

// Get category list
// GET /api/admin/categories
router.get('/categories', getCategoryListHandler);

// Get tag list
// GET /api/admin/tags
router.get('/tags', getTagListHandler);

// Get system statistics
// GET /api/admin/stats
router.get('/stats', getSystemStatsHandler);

// Get recent activity
// GET /api/admin/activity
router.get('/activity', getRecentActivityHandler);

export default router;