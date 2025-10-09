// Category routes
import express from 'express';
import {
  createCategoryHandler,
  getCategoryHandler,
  getCategoryByNameHandler,
  getAllCategoriesHandler,
  updateCategoryHandler,
  deleteCategoryHandler
} from '../controllers/categoryController.js';

import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new category (admin only)
// POST /api/categories
router.post('/', authenticate, authorize('admin'), createCategoryHandler);

// Get category by ID
// GET /api/categories/:id
router.get('/:id', getCategoryHandler);

// Get category by name
// GET /api/categories/name/:name
router.get('/name/:name', getCategoryByNameHandler);

// Get all categories
// GET /api/categories
router.get('/', getAllCategoriesHandler);

// Update a category (admin only)
// PUT /api/categories/:id
router.put('/:id', authenticate, authorize('admin'), updateCategoryHandler);

// Delete a category (admin only)
// DELETE /api/categories/:id
router.delete('/:id', authenticate, authorize('admin'), deleteCategoryHandler);

export default router;