// Analytics repository with ACID compliance
import { executeQuery, executeTransaction } from '../config/db-utils.js';

// Get article view statistics
const getArticleViewStats = async (articleId) => {
  try {
    const query = `
      SELECT 
        id, title, views, created_at, updated_at
      FROM articles 
      WHERE id = $1
    `;
    
    const values = [articleId];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Get user activity statistics
const getUserActivityStats = async (userId) => {
  try {
    // Get user's article count
    const articleCountQuery = `
      SELECT COUNT(*) as article_count
      FROM articles 
      WHERE author_id = $1 AND status != 'deleted'
    `;
    
    const articleCountResult = await executeQuery(articleCountQuery, [userId]);
    const articleCount = parseInt(articleCountResult.rows[0].article_count, 10);
    
    // Get user's comment count
    const commentCountQuery = `
      SELECT COUNT(*) as comment_count
      FROM comments 
      WHERE author_id = $1 AND is_deleted = false
    `;
    
    const commentCountResult = await executeQuery(commentCountQuery, [userId]);
    const commentCount = parseInt(commentCountResult.rows[0].comment_count, 10);
    
    // Get user's favorite count
    const favoriteCountQuery = `
      SELECT COUNT(*) as favorite_count
      FROM user_favorites 
      WHERE user_id = $1
    `;
    
    const favoriteCountResult = await executeQuery(favoriteCountQuery, [userId]);
    const favoriteCount = parseInt(favoriteCountResult.rows[0].favorite_count, 10);
    
    return {
      article_count: articleCount,
      comment_count: commentCount,
      favorite_count: favoriteCount
    };
  } catch (err) {
    throw err;
  }
};

// Get overall platform statistics
const getPlatformStats = async () => {
  try {
    // Get total users
    const userCountQuery = 'SELECT COUNT(*) as total_users FROM users';
    const userCountResult = await executeQuery(userCountQuery, []);
    const totalUsers = parseInt(userCountResult.rows[0].total_users, 10);
    
    // Get total articles
    const articleCountQuery = "SELECT COUNT(*) as total_articles FROM articles WHERE status != 'deleted'";
    const articleCountResult = await executeQuery(articleCountQuery, []);
    const totalArticles = parseInt(articleCountResult.rows[0].total_articles, 10);
    
    // Get total comments
    const commentCountQuery = 'SELECT COUNT(*) as total_comments FROM comments WHERE is_deleted = false';
    const commentCountResult = await executeQuery(commentCountQuery, []);
    const totalComments = parseInt(commentCountResult.rows[0].total_comments, 10);
    
    // Get total views
    const viewCountQuery = 'SELECT SUM(views) as total_views FROM articles';
    const viewCountResult = await executeQuery(viewCountQuery, []);
    const totalViews = parseInt(viewCountResult.rows[0].total_views || 0, 10);
    
    // Get total categories
    const categoryCountQuery = 'SELECT COUNT(*) as total_categories FROM categories';
    const categoryCountResult = await executeQuery(categoryCountQuery, []);
    const totalCategories = parseInt(categoryCountResult.rows[0].total_categories, 10);
    
    // Get total tags
    const tagCountQuery = 'SELECT COUNT(*) as total_tags FROM tags';
    const tagCountResult = await executeQuery(tagCountQuery, []);
    const totalTags = parseInt(tagCountResult.rows[0].total_tags, 10);
    
    return {
      total_users: totalUsers,
      total_articles: totalArticles,
      total_comments: totalComments,
      total_views: totalViews,
      total_categories: totalCategories,
      total_tags: totalTags
    };
  } catch (err) {
    throw err;
  }
};

// Get top articles by views
const getTopArticlesByViews = async (limit = 10) => {
  try {
    const query = `
      SELECT 
        id, title, views, created_at, updated_at
      FROM articles 
      WHERE status = 'published'
      ORDER BY views DESC
      LIMIT $1
    `;
    
    const values = [limit];
    const result = await executeQuery(query, values);
    
    return result.rows;
  } catch (err) {
    throw err;
  }
};

// Get top authors by article count
const getTopAuthorsByArticleCount = async (limit = 10) => {
  try {
    const query = `
      SELECT 
        u.id, u.name, u.email, COUNT(a.id) as article_count
      FROM users u
      JOIN articles a ON u.id = a.author_id
      WHERE a.status = 'published'
      GROUP BY u.id, u.name, u.email
      ORDER BY article_count DESC
      LIMIT $1
    `;
    
    const values = [limit];
    const result = await executeQuery(query, values);
    
    return result.rows;
  } catch (err) {
    throw err;
  }
};

// Get article view trend data
const getArticleViewTrend = async (articleId, days = 30) => {
  try {
    const query = `
      SELECT 
        date_trunc('day', created_at) as day,
        COUNT(*) as view_count
      FROM article_views 
      WHERE article_id = $1 
      AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY date_trunc('day', created_at)
      ORDER BY day ASC
    `;
    
    const values = [articleId];
    const result = await executeQuery(query, values);
    
    return result.rows;
  } catch (err) {
    // If article_views table doesn't exist, return empty array
    if (err.code === '42P01') { // Undefined table error
      return [];
    }
    throw err;
  }
};

// Track article view
const trackArticleView = async (articleId, userId = null) => {
  try {
    // Use a transaction to ensure ACID compliance
    const queries = [];
    
    // Increment article view count
    const updateArticleQuery = `
      UPDATE articles 
      SET views = views + 1, updated_at = NOW()
      WHERE id = $1
    `;
    
    const updateArticleValues = [articleId];
    queries.push({ query: updateArticleQuery, values: updateArticleValues });
    
    // Record view in article_views table if it exists
    const insertViewQuery = `
      INSERT INTO article_views (article_id, user_id, created_at)
      VALUES ($1, $2, NOW())
    `;
    
    const insertViewValues = [articleId, userId];
    queries.push({ query: insertViewQuery, values: insertViewValues });
    
    // Execute the transaction
    await executeTransaction(queries);
    
    return { success: true };
  } catch (err) {
    // If article_views table doesn't exist, just update the article
    if (err.code === '42P01') { // Undefined table error
      const updateArticleQuery = `
        UPDATE articles 
        SET views = views + 1, updated_at = NOW()
        WHERE id = $1
      `;
      
      const updateArticleValues = [articleId];
      await executeQuery(updateArticleQuery, updateArticleValues);
      return { success: true };
    }
    throw err;
  }
};

// Get category statistics
const getCategoryStats = async () => {
  try {
    const query = `
      SELECT 
        c.id, c.name, c.description, COUNT(a.id) as article_count
      FROM categories c
      LEFT JOIN articles a ON c.id = a.category_id AND a.status = 'published'
      GROUP BY c.id, c.name, c.description
      ORDER BY article_count DESC
    `;
    
    const result = await executeQuery(query, []);
    
    return result.rows;
  } catch (err) {
    throw err;
  }
};

// Get tag statistics
const getTagStats = async () => {
  try {
    const query = `
      SELECT 
        t.id, t.name, COUNT(at.article_id) as article_count
      FROM tags t
      LEFT JOIN article_tags at ON t.id = at.tag_id
      LEFT JOIN articles a ON at.article_id = a.id AND a.status = 'published'
      GROUP BY t.id, t.name
      ORDER BY article_count DESC
    `;
    
    const result = await executeQuery(query, []);
    
    return result.rows;
  } catch (err) {
    throw err;
  }
};

export {
  getArticleViewStats,
  getUserActivityStats,
  getPlatformStats,
  getTopArticlesByViews,
  getTopAuthorsByArticleCount,
  getArticleViewTrend,
  trackArticleView,
  getCategoryStats,
  getTagStats
};