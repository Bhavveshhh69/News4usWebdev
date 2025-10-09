// Article controller to handle HTTP requests
import {
  createNewArticle,
  getArticle,
  getArticles,
  updateExistingArticle,
  deleteExistingArticle,
  publishExistingArticle,
  searchExistingArticles,
  getArticlesByTagName
} from '../services/articleService.js';

import { validateArticleInput } from '../middleware/articleValidationMiddleware.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

// Create a new article
const createArticleHandler = async (req, res) => {
  try {
    const { title, summary, content, categoryId, tags, status, isFeatured } = req.body;
    const authorId = req.user.id; // Assuming user ID is attached to request by auth middleware
    
    const articleData = {
      title,
      summary,
      content,
      categoryId,
      tags,
      status,
      isFeatured
    };
    
    const result = await createNewArticle(articleData, authorId);
    
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to create article'
    });
  }
};

// Get article by ID
const getArticleHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await getArticle(id);
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Article not found') {
      res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    } else {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve article'
      });
    }
  }
};

// Get all articles with pagination
const getArticlesHandler = async (req, res) => {
  try {
    const { limit, offset, categoryId, authorId, status, isFeatured } = req.query;
    
    const filters = {};
    if (categoryId) filters.categoryId = categoryId;
    if (authorId) filters.authorId = authorId;
    if (status) filters.status = status;
    if (isFeatured !== undefined) filters.isFeatured = isFeatured === 'true';
    
    const result = await getArticles(
      parseInt(limit) || 10,
      parseInt(offset) || 0,
      filters
    );
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to retrieve articles'
    });
  }
};

// Update an article
const updateArticleHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const authorId = req.user.id; // Assuming user ID is attached to request by auth middleware
    
    const result = await updateExistingArticle(id, updateData, authorId);
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Article not found') {
      res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    } else {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to update article'
      });
    }
  }
};

// Delete an article
const deleteArticleHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const authorId = req.user.id; // Assuming user ID is attached to request by auth middleware
    
    const result = await deleteExistingArticle(id, authorId);
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Article not found') {
      res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    } else {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to delete article'
      });
    }
  }
};

// Publish an article
const publishArticleHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const authorId = req.user.id; // Assuming user ID is attached to request by auth middleware
    
    const result = await publishExistingArticle(id, authorId);
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Article not found') {
      res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    } else if (err.message.includes('Unauthorized')) {
      res.status(403).json({
        success: false,
        message: err.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to publish article'
      });
    }
  }
};

// Search articles
const searchArticlesHandler = async (req, res) => {
  try {
    const { q, limit, offset } = req.query;
    
    const result = await searchExistingArticles(
      q,
      parseInt(limit) || 10,
      parseInt(offset) || 0
    );
    
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to search articles'
    });
  }
};

// Get articles by tag
const getArticlesByTagHandler = async (req, res) => {
  try {
    const { tagName } = req.params;
    const { limit, offset } = req.query;
    
    const result = await getArticlesByTagName(
      tagName,
      parseInt(limit) || 10,
      parseInt(offset) || 0
    );
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to retrieve articles by tag'
    });
  }
};

export {
  createArticleHandler,
  getArticleHandler,
  getArticlesHandler,
  updateArticleHandler,
  deleteArticleHandler,
  publishArticleHandler,
  searchArticlesHandler,
  getArticlesByTagHandler
};