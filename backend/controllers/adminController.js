// Admin controller to handle HTTP requests for admin dashboard
import {
  getAdminUserList,
  getAdminUserDetails,
  updateAdminUserRole,
  setAdminUserActiveStatus,
  getAdminArticleList,
  getAdminCategoryList,
  getAdminTagList,
  getAdminSystemStats,
  getAdminRecentActivity
} from '../services/adminService.js';

import { authenticate, authorize } from '../middleware/authMiddleware.js';

// Get user list with filtering and pagination
const getUserListHandler = async (req, res) => {
  try {
    const { limit = 10, offset = 0, role, isActive, search } = req.query;
    
    const filters = {};
    if (role) filters.role = role;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (search) filters.search = search;
    
    const result = await getAdminUserList(
      parseInt(limit, 10),
      parseInt(offset, 10),
      filters
    );
    
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to retrieve users'
    });
  }
};

// Get user details by ID
const getUserDetailsHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const userIdInt = parseInt(userId, 10);
    
    if (isNaN(userIdInt)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    const result = await getAdminUserDetails(userIdInt);
    
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to retrieve user details'
    });
  }
};

// Update user role
const updateUserRoleHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    const userIdInt = parseInt(userId, 10);
    
    if (isNaN(userIdInt)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    const result = await updateAdminUserRole(userIdInt, role, req.user.id, req);
    
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to update user role'
    });
  }
};

// Set user active status
const setUserActiveStatusHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    
    const userIdInt = parseInt(userId, 10);
    
    if (isNaN(userIdInt)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    const result = await setAdminUserActiveStatus(userIdInt, isActive, req.user.id, req);
    
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to update user status'
    });
  }
};

// Get article list with filtering and pagination
const getArticleListHandler = async (req, res) => {
  try {
    const { limit = 10, offset = 0, status, authorId, categoryId, isFeatured, search } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (authorId) filters.authorId = parseInt(authorId, 10);
    if (categoryId) filters.categoryId = parseInt(categoryId, 10);
    if (isFeatured !== undefined) filters.isFeatured = isFeatured === 'true';
    if (search) filters.search = search;
    
    const result = await getAdminArticleList(
      parseInt(limit, 10),
      parseInt(offset, 10),
      filters
    );
    
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to retrieve articles'
    });
  }
};

// Get category list
const getCategoryListHandler = async (req, res) => {
  try {
    const result = await getAdminCategoryList();
    
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to retrieve categories'
    });
  }
};

// Get tag list
const getTagListHandler = async (req, res) => {
  try {
    const result = await getAdminTagList();
    
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to retrieve tags'
    });
  }
};

// Get system statistics
const getSystemStatsHandler = async (req, res) => {
  try {
    const result = await getAdminSystemStats();
    
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to retrieve system statistics'
    });
  }
};

// Get recent activity
const getRecentActivityHandler = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const result = await getAdminRecentActivity(parseInt(limit, 10));
    
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to retrieve recent activity'
    });
  }
};

export {
  getUserListHandler,
  getUserDetailsHandler,
  updateUserRoleHandler,
  setUserActiveStatusHandler,
  getArticleListHandler,
  getCategoryListHandler,
  getTagListHandler,
  getSystemStatsHandler,
  getRecentActivityHandler
};