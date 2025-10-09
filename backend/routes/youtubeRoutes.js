// YouTube routes
import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import {
  listYouTubeVideosHandler,
  createYouTubeVideoHandler,
  getYouTubeVideoHandler,
  updateYouTubeVideoHandler,
  deleteYouTubeVideoHandler
} from '../controllers/youtubeController.js';

const router = express.Router();

router.get('/videos', listYouTubeVideosHandler);
router.get('/videos/:id', getYouTubeVideoHandler);
router.post('/videos', authenticate, authorize('admin'), createYouTubeVideoHandler);
router.put('/videos/:id', authenticate, authorize('admin'), updateYouTubeVideoHandler);
router.delete('/videos/:id', authenticate, authorize('admin'), deleteYouTubeVideoHandler);

export default router;


