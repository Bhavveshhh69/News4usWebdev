// Tag routes
import express from 'express';
import {
  createTagHandler,
  getTagHandler,
  getTagByNameHandler,
  getAllTagsHandler,
  getArticlesByTagHandler,
  updateTagHandler,
  deleteTagHandler
} from '../controllers/tagController.js';

import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new tag (admin only)
// POST /api/tags
router.post('/', authenticate, authorize('admin'), createTagHandler);

// Get tag by ID
// GET /api/tags/:id
router.get('/:id', getTagHandler);

// Get tag by name
// GET /api/tags/name/:name
router.get('/name/:name', getTagByNameHandler);

// Get all tags
// GET /api/tags
router.get('/', getAllTagsHandler);

// Get articles by tag with pagination
// GET /api/tags/:id/articles
router.get('/:id/articles', getArticlesByTagHandler);

// Update a tag (admin only)
// PUT /api/tags/:id
router.put('/:id', authenticate, authorize('admin'), updateTagHandler);

// Delete a tag (admin only)
// DELETE /api/tags/:id
router.delete('/:id', authenticate, authorize('admin'), deleteTagHandler);

export default router;