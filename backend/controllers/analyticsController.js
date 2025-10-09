// Analytics controller to handle HTTP requests
import {
  getArticleStats,
  getUserStats,
  getPlatformStatistics,
  getTopArticles,
  getTopAuthors,
  getArticleTrend,
  trackView,
  getCategoryStatistics,
  getTagStatistics
} from '../services/analyticsService.js';

import { authenticate, authorize } from '../middleware/authMiddleware.js';

// Get article view statistics
const getArticleStatsHandler = async (req, res) => {
  try {
    const { articleId } = req.params;
    
    const result = await getArticleStats(articleId);
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Invalid article ID') {
      res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    } else {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve article statistics'
      });
    }
  }
};

// Get user activity statistics
const getUserStatsHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await getUserStats(userId);
    
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
        message: err.message || 'Failed to retrieve user statistics'
      });
    }
  }
};

// Get overall platform statistics
const getPlatformStatsHandler = async (req, res) => {
  try {
    const result = await getPlatformStatistics();
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to retrieve platform statistics'
    });
  }
};

// Get top articles by views
const getTopArticlesHandler = async (req, res) => {
  try {
    const { limit } = req.query;
    
    const result = await getTopArticles(parseInt(limit) || 10);
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to retrieve top articles'
    });
  }
};

// Get top authors by article count
const getTopAuthorsHandler = async (req, res) => {
  try {
    const { limit } = req.query;
    
    const result = await getTopAuthors(parseInt(limit) || 10);
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to retrieve top authors'
    });
  }
};

// Get article view trend data
const getArticleTrendHandler = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { days } = req.query;
    
    const result = await getArticleTrend(articleId, parseInt(days) || 30);
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Invalid article ID') {
      res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    } else {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve article view trend'
      });
    }
  }
};

// Track article view
const trackViewHandler = async (req, res) => {
  try {
    const { articleId } = req.body;
    const userId = req.user ? req.user.id : null; // Optional user tracking
    
    const result = await trackView(articleId, userId);
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Invalid article ID' || err.message === 'Invalid user ID') {
      res.status(404).json({
        success: false,
        message: err.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to track article view'
      });
    }
  }
};

// Get category statistics
const getCategoryStatsHandler = async (req, res) => {
  try {
    const result = await getCategoryStatistics();
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to retrieve category statistics'
    });
  }
};

// Get tag statistics
const getTagStatsHandler = async (req, res) => {
  try {
    const result = await getTagStatistics();
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to retrieve tag statistics'
    });
  }
};

export {
  getArticleStatsHandler,
  getUserStatsHandler,
  getPlatformStatsHandler,
  getTopArticlesHandler,
  getTopAuthorsHandler,
  getArticleTrendHandler,
  trackViewHandler,
  getCategoryStatsHandler,
  getTagStatsHandler
};