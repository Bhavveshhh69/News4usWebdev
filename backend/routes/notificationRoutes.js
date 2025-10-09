// Notification routes
import express from 'express';
import {
  createNotificationHandler,
  getUserNotificationsHandler,
  markNotificationReadHandler,
  markAllNotificationsReadHandler,
  deleteNotificationHandler,
  deleteReadNotificationsHandler,
  getUnreadCountHandler,
  createBulkNotificationsHandler
} from '../controllers/notificationController.js';

import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new notification (admin only)
// POST /api/notifications
router.post('/', authenticate, authorize('admin'), createNotificationHandler);

// Create multiple notifications (bulk) (admin only)
// POST /api/notifications/bulk
router.post('/bulk', authenticate, authorize('admin'), createBulkNotificationsHandler);

// Get notifications for a user
// GET /api/notifications
router.get('/', authenticate, getUserNotificationsHandler);

// Mark notification as read
// PUT /api/notifications/:notificationId/read
router.put('/:notificationId/read', authenticate, markNotificationReadHandler);

// Mark all notifications as read for a user
// PUT /api/notifications/read-all
router.put('/read-all', authenticate, markAllNotificationsReadHandler);

// Delete a notification
// DELETE /api/notifications/:notificationId
router.delete('/:notificationId', authenticate, deleteNotificationHandler);

// Delete all read notifications for a user
// DELETE /api/notifications/read
router.delete('/read', authenticate, deleteReadNotificationsHandler);

// Get unread notification count for a user
// GET /api/notifications/unread-count
router.get('/unread-count', authenticate, getUnreadCountHandler);

export default router;