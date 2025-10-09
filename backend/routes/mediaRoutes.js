// Media routes
import express from 'express';
import {
  uploadMediaHandler,
  getMediaHandler,
  getMediaAssetsHandler,
  updateMediaHandler,
  deleteMediaHandler,
  getUserMediaHandler
} from '../controllers/mediaController.js';

import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Upload a new media asset
// POST /api/media
router.post('/', authenticate, uploadMediaHandler);

// Get media asset by ID
// GET /api/media/:id
router.get('/:id', getMediaHandler);

// Get all media assets with pagination and filters
// GET /api/media
router.get('/', getMediaAssetsHandler);

// Update a media asset
// PUT /api/media/:id
router.put('/:id', authenticate, updateMediaHandler);

// Delete a media asset
// DELETE /api/media/:id
router.delete('/:id', authenticate, deleteMediaHandler);

// Get media assets by user
// GET /api/media/user/:userId
router.get('/user/:userId', getUserMediaHandler);

export default router;