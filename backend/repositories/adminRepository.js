// Admin repository with ACID compliance
import { executeQuery, executeTransaction } from '../config/db-utils.js';

// Get user list with filtering and pagination
const getUserList = async (limit = 10, offset = 0, filters = {}) => {
  try {
    let query = `
      SELECT 
        id, email, name, role, created_at, updated_at, last_login, is_active
      FROM users
    `;
    
    const values = [];
    let whereClause = '';
    let valueIndex = 1;
    
    // Apply filters
    if (filters.role) {
      whereClause += ` AND role = $${valueIndex}`;
      values.push(filters.role);
      valueIndex++;
    }
    
    if (filters.isActive !== undefined) {
      whereClause += ` AND is_active = $${valueIndex}`;
      values.push(filters.isActive);
      valueIndex++;
    }
    
    if (filters.search) {
      whereClause += ` AND (name ILIKE $${valueIndex} OR email ILIKE $${valueIndex})`;
      values.push(`%${filters.search}%`);
      valueIndex++;
    }
    
    if (whereClause) {
      query += ' WHERE ' + whereClause.substring(5); // Remove the first ' AND'
    }
    
    query += ' ORDER BY created_at DESC LIMIT $' + valueIndex + ' OFFSET $' + (valueIndex + 1);
    values.push(limit, offset);
    
    const result = await executeQuery(query, values);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    if (whereClause) {
      countQuery += ' WHERE ' + whereClause.substring(5);
    }
    
    const countValues = values.slice(0, valueIndex - 1);
    const countResult = await executeQuery(countQuery, countValues);
    const total = parseInt(countResult.rows[0].total, 10);
    
    return {
      users: result.rows,
      total,
      limit,
      offset
    };
  } catch (err) {
    throw err;
  }
};

// Get user by ID with detailed information
const getDetailedUser = async (userId) => {
  try {
    const query = `
      SELECT 
        u.id, u.email, u.name, u.role, u.created_at, u.updated_at, u.last_login, u.is_active,
        COUNT(a.id) as article_count,
        COUNT(c.id) as comment_count
      FROM users u
      LEFT JOIN articles a ON u.id = a.author_id AND a.status != 'deleted'
      LEFT JOIN comments c ON u.id = c.author_id AND c.is_deleted = false
      WHERE u.id = $1
      GROUP BY u.id, u.email, u.name, u.role, u.created_at, u.updated_at, u.last_login, u.is_active
    `;
    
    const values = [userId];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Update user role
const updateUserRole = async (userId, newRole) => {
  try {
    const query = `
      UPDATE users 
      SET role = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, name, role, created_at, updated_at, last_login, is_active
    `;
    
    const values = [newRole, userId];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Activate/deactivate user
const setUserActiveStatus = async (userId, isActive) => {
  try {
    const query = `
      UPDATE users 
      SET is_active = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, name, role, created_at, updated_at, last_login, is_active
    `;
    
    const values = [isActive, userId];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Get article list with filtering and pagination
const getArticleList = async (limit = 10, offset = 0, filters = {}) => {
  try {
    let query = `
      SELECT 
        a.id, a.title, a.summary, a.author_id, a.category_id, a.status, 
        a.published_at, a.created_at, a.updated_at, a.views, a.is_featured,
        u.name as author_name,
        c.name as category_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
    `;
    
    const values = [];
    let whereClause = '';
    let valueIndex = 1;
    
    // Apply filters
    if (filters.status) {
      whereClause += ` AND a.status = $${valueIndex}`;
      values.push(filters.status);
      valueIndex++;
    }
    
    if (filters.authorId) {
      whereClause += ` AND a.author_id = $${valueIndex}`;
      values.push(filters.authorId);
      valueIndex++;
    }
    
    if (filters.categoryId) {
      whereClause += ` AND a.category_id = $${valueIndex}`;
      values.push(filters.categoryId);
      valueIndex++;
    }
    
    if (filters.isFeatured !== undefined) {
      whereClause += ` AND a.is_featured = $${valueIndex}`;
      values.push(filters.isFeatured);
      valueIndex++;
    }
    
    if (filters.search) {
      whereClause += ` AND (a.title ILIKE $${valueIndex} OR a.summary ILIKE $${valueIndex})`;
      values.push(`%${filters.search}%`);
      valueIndex++;
    }
    
    if (whereClause) {
      query += ' WHERE ' + whereClause.substring(5); // Remove the first ' AND'
    }
    
    query += ' ORDER BY a.created_at DESC LIMIT $' + valueIndex + ' OFFSET $' + (valueIndex + 1);
    values.push(limit, offset);
    
    const result = await executeQuery(query, values);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
    `;
    if (whereClause) {
      countQuery += ' WHERE ' + whereClause.substring(5);
    }
    
    const countValues = values.slice(0, valueIndex - 1);
    const countResult = await executeQuery(countQuery, countValues);
    const total = parseInt(countResult.rows[0].total, 10);
    
    return {
      articles: result.rows,
      total,
      limit,
      offset
    };
  } catch (err) {
    throw err;
  }
};

// Get category list
const getCategoryList = async () => {
  try {
    const query = `
      SELECT 
        c.id, c.name, c.description, c.created_at, c.updated_at,
        COUNT(a.id) as article_count
      FROM categories c
      LEFT JOIN articles a ON c.id = a.category_id AND a.status = 'published'
      GROUP BY c.id, c.name, c.description, c.created_at, c.updated_at
      ORDER BY c.name
    `;
    
    const result = await executeQuery(query, []);
    
    return result.rows;
  } catch (err) {
    throw err;
  }
};

// Get tag list
const getTagList = async () => {
  try {
    const query = `
      SELECT 
        t.id, t.name, t.created_at, t.updated_at,
        COUNT(at.article_id) as article_count
      FROM tags t
      LEFT JOIN article_tags at ON t.id = at.tag_id
      LEFT JOIN articles a ON at.article_id = a.id AND a.status = 'published'
      GROUP BY t.id, t.name, t.created_at, t.updated_at
      ORDER BY t.name
    `;
    
    const result = await executeQuery(query, []);
    
    return result.rows;
  } catch (err) {
    throw err;
  }
};

// Get system statistics
const getSystemStats = async () => {
  try {
    // Get user statistics
    const userStatsQuery = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users
      FROM users
    `;
    
    const userStatsResult = await executeQuery(userStatsQuery, []);
    const userStats = userStatsResult.rows[0];
    
    // Get article statistics
    const articleStatsQuery = `
      SELECT 
        COUNT(*) as total_articles,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_articles,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_articles,
        COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_articles
      FROM articles
    `;
    
    const articleStatsResult = await executeQuery(articleStatsQuery, []);
    const articleStats = articleStatsResult.rows[0];
    
    // Get comment statistics
    const commentStatsQuery = `
      SELECT 
        COUNT(*) as total_comments,
        COUNT(CASE WHEN is_deleted = false THEN 1 END) as active_comments
      FROM comments
    `;
    
    const commentStatsResult = await executeQuery(commentStatsQuery, []);
    const commentStats = commentStatsResult.rows[0];
    
    // Get media statistics
    const mediaStatsQuery = `
      SELECT 
        COUNT(*) as total_media,
        COALESCE(SUM(size), 0) as total_size
      FROM media_assets
    `;
    
    const mediaStatsResult = await executeQuery(mediaStatsQuery, []);
    const mediaStats = mediaStatsResult.rows[0];
    
    return {
      users: userStats,
      articles: articleStats,
      comments: commentStats,
      media: mediaStats
    };
  } catch (err) {
    throw err;
  }
};

// Get recent activity
const getRecentActivity = async (limit = 10) => {
  try {
    const query = `
      SELECT 
        'user' as type,
        id,
        name as title,
        email as description,
        created_at as activity_time
      FROM users
      WHERE created_at >= NOW() - INTERVAL '30 days'
      
      UNION ALL
      
      SELECT 
        'article' as type,
        id,
        title,
        summary as description,
        created_at as activity_time
      FROM articles
      WHERE created_at >= NOW() - INTERVAL '30 days'
      
      UNION ALL
      
      SELECT 
        'comment' as type,
        id,
        'New comment' as title,
        SUBSTRING(content, 1, 100) as description,
        created_at as activity_time
      FROM comments
      WHERE created_at >= NOW() - INTERVAL '30 days' AND is_deleted = false
      
      ORDER BY activity_time DESC
      LIMIT $1
    `;
    
    const values = [limit];
    const result = await executeQuery(query, values);
    
    return result.rows;
  } catch (err) {
    throw err;
  }
};

export {
  getUserList,
  getDetailedUser,
  updateUserRole,
  setUserActiveStatus,
  getArticleList,
  getCategoryList,
  getTagList,
  getSystemStats,
  getRecentActivity
};