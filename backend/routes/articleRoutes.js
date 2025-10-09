// Article routes
import express from 'express';
import {
  createArticleHandler,
  getArticleHandler,
  getArticlesHandler,
  updateArticleHandler,
  deleteArticleHandler,
  publishArticleHandler,
  searchArticlesHandler,
  getArticlesByTagHandler
} from '../controllers/articleController.js';

import { validateArticleInput } from '../middleware/articleValidationMiddleware.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new article
// POST /api/articles
router.post('/', authenticate, validateArticleInput, createArticleHandler);

// Get article by ID
// GET /api/articles/:id
router.get('/:id', getArticleHandler);

// Get all articles with pagination and filters
// GET /api/articles
router.get('/', getArticlesHandler);

// Update an article
// PUT /api/articles/:id
router.put('/:id', authenticate, updateArticleHandler);

// Delete an article
// DELETE /api/articles/:id
router.delete('/:id', authenticate, deleteArticleHandler);

// Publish an article
// POST /api/articles/:id/publish
router.post('/:id/publish', authenticate, publishArticleHandler);

// Search articles
// GET /api/articles/search
router.get('/search', searchArticlesHandler);

// Get articles by tag
// GET /api/articles/tag/:tagName
router.get('/tag/:tagName', getArticlesByTagHandler);

export default router;