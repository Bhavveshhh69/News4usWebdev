// Notification controller to handle HTTP requests
import {
  createNewNotification,
  getUserNotificationList,
  markNotificationRead,
  markAllNotificationsRead,
  deleteExistingNotification,
  deleteReadUserNotifications,
  getUnreadCount,
  createBulkNotificationList
} from '../services/notificationService.js';

import { authenticate } from '../middleware/authMiddleware.js';

// Create a new notification
const createNotificationHandler = async (req, res) => {
  try {
    const notificationData = req.body;
    
    // For system notifications, admin might create them
    // For user notifications, we might want to validate the user
    const result = await createNewNotification(notificationData);
    
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to create notification'
    });
  }
};

// Get notifications for a user
const getUserNotificationsHandler = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated user
    const { limit, offset, includeRead } = req.query;
    
    const result = await getUserNotificationList(
      userId,
      parseInt(limit) || 10,
      parseInt(offset) || 0,
      includeRead === 'true'
    );
    
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
        message: err.message || 'Failed to retrieve notifications'
      });
    }
  }
};

// Mark notification as read
const markNotificationReadHandler = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated user
    const { notificationId } = req.params;
    
    const result = await markNotificationRead(notificationId, userId);
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Invalid user ID') {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    } else if (err.message === 'Notification not found or unauthorized') {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    } else {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to mark notification as read'
      });
    }
  }
};

// Mark all notifications as read for a user
const markAllNotificationsReadHandler = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated user
    
    const result = await markAllNotificationsRead(userId);
    
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
        message: err.message || 'Failed to mark all notifications as read'
      });
    }
  }
};

// Delete a notification
const deleteNotificationHandler = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated user
    const { notificationId } = req.params;
    
    const result = await deleteExistingNotification(notificationId, userId);
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Invalid user ID') {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    } else if (err.message === 'Notification not found or unauthorized') {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    } else {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to delete notification'
      });
    }
  }
};

// Delete all read notifications for a user
const deleteReadNotificationsHandler = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated user
    
    const result = await deleteReadUserNotifications(userId);
    
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
        message: err.message || 'Failed to delete read notifications'
      });
    }
  }
};

// Get unread notification count for a user
const getUnreadCountHandler = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated user
    
    const result = await getUnreadCount(userId);
    
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
        message: err.message || 'Failed to get unread notification count'
      });
    }
  }
};

// Create multiple notifications (bulk)
const createBulkNotificationsHandler = async (req, res) => {
  try {
    const notificationsData = req.body.notifications;
    
    const result = await createBulkNotificationList(notificationsData);
    
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to create bulk notifications'
    });
  }
};

export {
  createNotificationHandler,
  getUserNotificationsHandler,
  markNotificationReadHandler,
  markAllNotificationsReadHandler,
  deleteNotificationHandler,
  deleteReadNotificationsHandler,
  getUnreadCountHandler,
  createBulkNotificationsHandler
};