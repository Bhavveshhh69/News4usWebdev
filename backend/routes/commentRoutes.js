// Comment routes
import express from 'express';
import {
  createCommentHandler,
  getCommentHandler,
  getArticleCommentsHandler,
  updateCommentHandler,
  deleteCommentHandler,
  getRepliesHandler
} from '../controllers/commentController.js';

import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new comment
// POST /api/comments
router.post('/', authenticate, createCommentHandler);

// Get comment by ID
// GET /api/comments/:id
router.get('/:id', getCommentHandler);

// Get all comments for an article with pagination
// GET /api/comments/article/:articleId
router.get('/article/:articleId', getArticleCommentsHandler);

// Update a comment
// PUT /api/comments/:id
router.put('/:id', authenticate, updateCommentHandler);

// Delete a comment
// DELETE /api/comments/:id
router.delete('/:id', authenticate, deleteCommentHandler);

// Get replies to a comment
// GET /api/comments/:commentId/replies
router.get('/:commentId/replies', getRepliesHandler);

export default router;