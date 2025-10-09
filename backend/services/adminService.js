// Admin service with ACID compliance
import { 
  getUserList,
  getDetailedUser,
  updateUserRole,
  setUserActiveStatus,
  getArticleList,
  getCategoryList,
  getTagList,
  getSystemStats,
  getRecentActivity
} from '../repositories/adminRepository.js';

import { findUserById } from '../repositories/userRepository.js';
import { getArticleById } from '../repositories/articleRepository.js';
import { executeQuery } from '../config/db-utils.js';
import { logAdminUserAction, logAdminContentAction } from './auditService.js';

// Get user list with filtering and pagination
const getAdminUserList = async (limit = 10, offset = 0, filters = {}) => {
  try {
    // Validate limit and offset
    if (limit < 1 || limit > 100) {
      limit = 10;
    }
    
    if (offset < 0) {
      offset = 0;
    }
    
    // Validate filters
    const validFilters = {};
    if (filters.role) {
      const validRoles = ['user', 'author', 'admin'];
      if (validRoles.includes(filters.role)) {
        validFilters.role = filters.role;
      }
    }
    
    if (filters.isActive !== undefined) {
      validFilters.isActive = Boolean(filters.isActive);
    }
    
    if (filters.search && typeof filters.search === 'string') {
      validFilters.search = filters.search.trim();
    }
    
    const result = await getUserList(limit, offset, validFilters);
    
    return {
      success: true,
      ...result,
      message: 'Users retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get user by ID with detailed information
const getAdminUserDetails = async (userId) => {
  try {
    // Validate user ID
    if (!userId || !Number.isInteger(userId)) {
      throw new Error('Invalid user ID');
    }
    
    const user = await getDetailedUser(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      success: true,
      user,
      message: 'User details retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Update user role
const updateAdminUserRole = async (userId, newRole, adminUserId, req = null) => {
  try {
    // Validate user ID
    if (!userId || !Number.isInteger(userId)) {
      throw new Error('Invalid user ID');
    }
    
    // Validate new role
    const validRoles = ['user', 'author', 'admin'];
    if (!validRoles.includes(newRole)) {
      throw new Error('Invalid role');
    }
    
    // Check if user exists
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Prevent removing the last admin
    if (user.role === 'admin' && newRole !== 'admin') {
      // Check if this is the last admin user
      const adminCountResult = await executeQuery("SELECT COUNT(*) as admin_count FROM users WHERE role = 'admin' AND is_active = true", [], 'admin');
      const adminCount = parseInt(adminCountResult.rows[0].admin_count);
      
      if (adminCount <= 1) {
        throw new Error('Cannot remove the last admin user. At least one admin user must exist.');
      }
    }
    
    // Prevent promoting a user to admin if they're not active
    if (newRole === 'admin' && !user.is_active) {
      throw new Error('Cannot promote an inactive user to admin. Activate the user first.');
    }
    
    const updatedUser = await updateUserRole(userId, newRole);
    
    // Log the action with request information
    await logAdminUserAction(adminUserId, 'update_role', userId, { 
      oldRole: user.role, 
      newRole: newRole 
    }, req);
    
    return {
      success: true,
      user: updatedUser,
      message: 'User role updated successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Activate/deactivate user
const setAdminUserActiveStatus = async (userId, isActive, adminUserId, req = null) => {
  try {
    // Validate user ID
    if (!userId || !Number.isInteger(userId)) {
      throw new Error('Invalid user ID');
    }
    
    // Validate isActive
    const activeStatus = Boolean(isActive);
    
    // Check if user exists
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Prevent deactivating the last admin user
    if (user.role === 'admin' && user.is_active && !activeStatus) {
      // Check if this is the last active admin user
      const adminCountResult = await executeQuery("SELECT COUNT(*) as admin_count FROM users WHERE role = 'admin' AND is_active = true", [], 'admin');
      const adminCount = parseInt(adminCountResult.rows[0].admin_count);
      
      if (adminCount <= 1) {
        throw new Error('Cannot deactivate the last admin user. At least one active admin user must exist.');
      }
    }
    
    // Prevent activating a user who was previously deactivated for security reasons
    if (!user.is_active && activeStatus) {
      // Log this as a special event since reactivating a deactivated user is a security-sensitive operation
      await logAdminUserAction(adminUserId, 'reactivate_user', userId, { 
        previousStatus: user.is_active,
        newStatus: activeStatus 
      }, req);
    }
    
    const updatedUser = await setUserActiveStatus(userId, activeStatus);
    
    const statusMessage = activeStatus ? 'activated' : 'deactivated';
    
    // Log the action with request information
    await logAdminUserAction(adminUserId, 'set_active_status', userId, { 
      isActive: activeStatus 
    }, req);
    
    return {
      success: true,
      user: updatedUser,
      message: `User ${statusMessage} successfully`
    };
  } catch (err) {
    throw err;
  }
};

// Get article list with filtering and pagination
const getAdminArticleList = async (limit = 10, offset = 0, filters = {}) => {
  try {
    // Validate limit and offset
    if (limit < 1 || limit > 100) {
      limit = 10;
    }
    
    if (offset < 0) {
      offset = 0;
    }
    
    // Validate filters
    const validFilters = {};
    if (filters.status) {
      const validStatuses = ['draft', 'published', 'archived', 'deleted'];
      if (validStatuses.includes(filters.status)) {
        validFilters.status = filters.status;
      }
    }
    
    if (filters.authorId) {
      // Validate that authorId is a number and user exists
      const authorId = parseInt(filters.authorId);
      if (!isNaN(authorId)) {
        const author = await findUserById(authorId);
        if (author) {
          validFilters.authorId = authorId;
        }
      }
    }
    
    if (filters.categoryId) {
      const categoryId = parseInt(filters.categoryId);
      if (!isNaN(categoryId)) {
        validFilters.categoryId = categoryId;
      }
    }
    
    if (filters.isFeatured !== undefined) {
      validFilters.isFeatured = Boolean(filters.isFeatured);
    }
    
    if (filters.search && typeof filters.search === 'string') {
      validFilters.search = filters.search.trim();
    }
    
    const result = await getArticleList(limit, offset, validFilters);
    
    return {
      success: true,
      ...result,
      message: 'Articles retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get category list
const getAdminCategoryList = async () => {
  try {
    const categories = await getCategoryList();
    
    return {
      success: true,
      categories,
      message: 'Categories retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get tag list
const getAdminTagList = async () => {
  try {
    const tags = await getTagList();
    
    return {
      success: true,
      tags,
      message: 'Tags retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get system statistics
const getAdminSystemStats = async () => {
  try {
    const stats = await getSystemStats();
    
    return {
      success: true,
      stats,
      message: 'System statistics retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get recent activity
const getAdminRecentActivity = async (limit = 10) => {
  try {
    // Validate limit
    if (limit < 1 || limit > 50) {
      limit = 10;
    }
    
    const activity = await getRecentActivity(limit);
    
    return {
      success: true,
      activity,
      message: 'Recent activity retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

export {
  getAdminUserList,
  getAdminUserDetails,
  updateAdminUserRole,
  setAdminUserActiveStatus,
  getAdminArticleList,
  getAdminCategoryList,
  getAdminTagList,
  getAdminSystemStats,
  getAdminRecentActivity
};