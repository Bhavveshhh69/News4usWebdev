// Notification service with ACID compliance
import { 
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteReadNotifications,
  getUnreadNotificationCount,
  createBulkNotifications
} from '../repositories/notificationRepository.js';

import { findUserById } from '../repositories/userRepository.js';

// Create a new notification
const createNewNotification = async (notificationData) => {
  try {
    // Validate required fields
    if (!notificationData.userId || !notificationData.type || !notificationData.title || !notificationData.message) {
      throw new Error('User ID, type, title, and message are required');
    }
    
    // Validate user exists
    const user = await findUserById(notificationData.userId);
    if (!user) {
      throw new Error('Invalid user ID');
    }
    
    // Validate notification type
    const validTypes = [
      'article_published',
      'comment_added',
      'comment_reply',
      'article_liked',
      'user_followed',
      'system_alert',
      'newsletter'
    ];
    
    if (!validTypes.includes(notificationData.type)) {
      throw new Error('Invalid notification type');
    }
    
    // Validate title and message length
    if (notificationData.title.length > 200) {
      throw new Error('Notification title must be less than 200 characters');
    }
    
    if (notificationData.message.length > 1000) {
      throw new Error('Notification message must be less than 1000 characters');
    }
    
    // Validate related type if provided
    if (notificationData.relatedType) {
      const validRelatedTypes = ['article', 'comment', 'user'];
      if (!validRelatedTypes.includes(notificationData.relatedType)) {
        throw new Error('Invalid related type');
      }
    }
    
    // Create the notification
    const notification = await createNotification(notificationData);
    
    return {
      success: true,
      notification,
      message: 'Notification created successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get notifications for a user
const getUserNotificationList = async (userId, limit = 10, offset = 0, includeRead = false) => {
  try {
    // Validate user exists
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('Invalid user ID');
    }
    
    // Validate limit and offset
    if (limit < 1 || limit > 100) {
      limit = 10;
    }
    
    if (offset < 0) {
      offset = 0;
    }
    
    const result = await getUserNotifications(userId, limit, offset, includeRead);
    
    return {
      success: true,
      ...result,
      message: 'Notifications retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Mark notification as read
const markNotificationRead = async (notificationId, userId) => {
  try {
    // Validate user exists
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('Invalid user ID');
    }
    
    const notification = await markNotificationAsRead(notificationId, userId);
    
    return {
      success: true,
      notification,
      message: 'Notification marked as read'
    };
  } catch (err) {
    throw err;
  }
};

// Mark all notifications as read for a user
const markAllNotificationsRead = async (userId) => {
  try {
    // Validate user exists
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('Invalid user ID');
    }
    
    const result = await markAllNotificationsAsRead(userId);
    
    return {
      success: true,
      updated_count: result.updated_count,
      message: `${result.updated_count} notifications marked as read`
    };
  } catch (err) {
    throw err;
  }
};

// Delete a notification
const deleteExistingNotification = async (notificationId, userId) => {
  try {
    // Validate user exists
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('Invalid user ID');
    }
    
    const result = await deleteNotification(notificationId, userId);
    
    return {
      success: true,
      result,
      message: 'Notification deleted successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Delete all read notifications for a user
const deleteReadUserNotifications = async (userId) => {
  try {
    // Validate user exists
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('Invalid user ID');
    }
    
    const result = await deleteReadNotifications(userId);
    
    return {
      success: true,
      deleted_count: result.deleted_count,
      message: `${result.deleted_count} read notifications deleted`
    };
  } catch (err) {
    throw err;
  }
};

// Get unread notification count for a user
const getUnreadCount = async (userId) => {
  try {
    // Validate user exists
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('Invalid user ID');
    }
    
    const count = await getUnreadNotificationCount(userId);
    
    return {
      success: true,
      count,
      message: 'Unread notification count retrieved'
    };
  } catch (err) {
    throw err;
  }
};

// Create multiple notifications (bulk)
const createBulkNotificationList = async (notificationsData) => {
  try {
    // Validate input
    if (!Array.isArray(notificationsData) || notificationsData.length === 0) {
      throw new Error('Notifications data must be a non-empty array');
    }
    
    // Validate each notification
    for (const notificationData of notificationsData) {
      if (!notificationData.userId || !notificationData.type || !notificationData.title || !notificationData.message) {
        throw new Error('Each notification must have user ID, type, title, and message');
      }
      
      // Validate user exists
      const user = await findUserById(notificationData.userId);
      if (!user) {
        throw new Error(`Invalid user ID: ${notificationData.userId}`);
      }
      
      // Validate notification type
      const validTypes = [
        'article_published',
        'comment_added',
        'comment_reply',
        'article_liked',
        'user_followed',
        'system_alert',
        'newsletter'
      ];
      
      if (!validTypes.includes(notificationData.type)) {
        throw new Error(`Invalid notification type: ${notificationData.type}`);
      }
      
      // Validate title and message length
      if (notificationData.title.length > 200) {
        throw new Error('Notification title must be less than 200 characters');
      }
      
      if (notificationData.message.length > 1000) {
        throw new Error('Notification message must be less than 1000 characters');
      }
      
      // Validate related type if provided
      if (notificationData.relatedType) {
        const validRelatedTypes = ['article', 'comment', 'user'];
        if (!validRelatedTypes.includes(notificationData.relatedType)) {
          throw new Error(`Invalid related type: ${notificationData.relatedType}`);
        }
      }
    }
    
    // Create the notifications
    const result = await createBulkNotifications(notificationsData);
    
    return {
      success: true,
      count: result.count,
      message: `${result.count} notifications created successfully`
    };
  } catch (err) {
    throw err;
  }
};

export {
  createNewNotification,
  getUserNotificationList,
  markNotificationRead,
  markAllNotificationsRead,
  deleteExistingNotification,
  deleteReadUserNotifications,
  getUnreadCount,
  createBulkNotificationList
};