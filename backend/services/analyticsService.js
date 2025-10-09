// Analytics service with ACID compliance
import { 
  getArticleViewStats,
  getUserActivityStats,
  getPlatformStats,
  getTopArticlesByViews,
  getTopAuthorsByArticleCount,
  getArticleViewTrend,
  trackArticleView,
  getCategoryStats,
  getTagStats
} from '../repositories/analyticsRepository.js';

import { getArticleById } from '../repositories/articleRepository.js';
import { findUserById } from '../repositories/userRepository.js';

// Get article view statistics
const getArticleStats = async (articleId) => {
  try {
    // Validate article exists
    const article = await getArticleById(articleId);
    if (!article) {
      throw new Error('Invalid article ID');
    }
    
    const stats = await getArticleViewStats(articleId);
    
    return {
      success: true,
      stats,
      message: 'Article statistics retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get user activity statistics
const getUserStats = async (userId) => {
  try {
    // Validate user exists
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('Invalid user ID');
    }
    
    const stats = await getUserActivityStats(userId);
    
    return {
      success: true,
      stats,
      message: 'User statistics retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get overall platform statistics
const getPlatformStatistics = async () => {
  try {
    const stats = await getPlatformStats();
    
    return {
      success: true,
      stats,
      message: 'Platform statistics retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get top articles by views
const getTopArticles = async (limit = 10) => {
  try {
    // Validate limit
    if (limit < 1 || limit > 100) {
      limit = 10;
    }
    
    const articles = await getTopArticlesByViews(limit);
    
    return {
      success: true,
      articles,
      message: 'Top articles retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get top authors by article count
const getTopAuthors = async (limit = 10) => {
  try {
    // Validate limit
    if (limit < 1 || limit > 100) {
      limit = 10;
    }
    
    const authors = await getTopAuthorsByArticleCount(limit);
    
    return {
      success: true,
      authors,
      message: 'Top authors retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get article view trend data
const getArticleTrend = async (articleId, days = 30) => {
  try {
    // Validate article exists
    const article = await getArticleById(articleId);
    if (!article) {
      throw new Error('Invalid article ID');
    }
    
    // Validate days
    if (days < 1 || days > 365) {
      days = 30;
    }
    
    const trend = await getArticleViewTrend(articleId, days);
    
    return {
      success: true,
      trend,
      message: 'Article view trend retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Track article view
const trackView = async (articleId, userId = null) => {
  try {
    // Validate article exists
    const article = await getArticleById(articleId);
    if (!article) {
      throw new Error('Invalid article ID');
    }
    
    // Validate user if provided
    if (userId) {
      const user = await findUserById(userId);
      if (!user) {
        throw new Error('Invalid user ID');
      }
    }
    
    await trackArticleView(articleId, userId);
    
    return {
      success: true,
      message: 'Article view tracked successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get category statistics
const getCategoryStatistics = async () => {
  try {
    const categories = await getCategoryStats();
    
    return {
      success: true,
      categories,
      message: 'Category statistics retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get tag statistics
const getTagStatistics = async () => {
  try {
    const tags = await getTagStats();
    
    return {
      success: true,
      tags,
      message: 'Tag statistics retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

export {
  getArticleStats,
  getUserStats,
  getPlatformStatistics,
  getTopArticles,
  getTopAuthors,
  getArticleTrend,
  trackView,
  getCategoryStatistics,
  getTagStatistics
};