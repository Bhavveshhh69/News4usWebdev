// Notification repository with ACID compliance
import { executeQuery, executeTransaction } from '../config/db-utils.js';

// Create a new notification
const createNotification = async (notificationData) => {
  try {
    const { 
      userId, 
      type, 
      title, 
      message, 
      relatedId = null,
      relatedType = null
    } = notificationData;
    
    const query = `
      INSERT INTO notifications (
        user_id, 
        type, 
        title, 
        message, 
        related_id, 
        related_type
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, type, title, message, related_id, related_type, is_read, created_at
    `;
    
    const values = [userId, type, title, message, relatedId, relatedType];
    const result = await executeQuery(query, values);
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Get notifications for a user
const getUserNotifications = async (userId, limit = 10, offset = 0, includeRead = false) => {
  try {
    let query = `
      SELECT 
        id, user_id, type, title, message, related_id, related_type, is_read, created_at
      FROM notifications 
      WHERE user_id = $1
    `;
    
    const values = [userId];
    
    // Filter by read status if needed
    if (!includeRead) {
      query += ' AND is_read = false';
    }
    
    query += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
    values.push(limit, offset);
    
    const result = await executeQuery(query, values);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM notifications WHERE user_id = $1';
    if (!includeRead) {
      countQuery += ' AND is_read = false';
    }
    
    const countResult = await executeQuery(countQuery, [userId]);
    const total = parseInt(countResult.rows[0].total, 10);
    
    return {
      notifications: result.rows,
      total,
      limit,
      offset
    };
  } catch (err) {
    throw err;
  }
};

// Mark notification as read
const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const query = `
      UPDATE notifications 
      SET is_read = true, updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING id, user_id, type, title, message, related_id, related_type, is_read, created_at
    `;
    
    const values = [notificationId, userId];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Notification not found or unauthorized');
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Mark all notifications as read for a user
const markAllNotificationsAsRead = async (userId) => {
  try {
    const query = `
      UPDATE notifications 
      SET is_read = true, updated_at = NOW()
      WHERE user_id = $1 AND is_read = false
      RETURNING id, user_id, type, title, message, related_id, related_type, is_read, created_at
    `;
    
    const values = [userId];
    const result = await executeQuery(query, values);
    
    return {
      updated_count: result.rowCount,
      notifications: result.rows
    };
  } catch (err) {
    throw err;
  }
};

// Delete a notification
const deleteNotification = async (notificationId, userId) => {
  try {
    const query = `
      DELETE FROM notifications 
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;
    
    const values = [notificationId, userId];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Notification not found or unauthorized');
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Delete all read notifications for a user
const deleteReadNotifications = async (userId) => {
  try {
    const query = `
      DELETE FROM notifications 
      WHERE user_id = $1 AND is_read = true
      RETURNING id
    `;
    
    const values = [userId];
    const result = await executeQuery(query, values);
    
    return {
      deleted_count: result.rowCount
    };
  } catch (err) {
    throw err;
  }
};

// Get unread notification count for a user
const getUnreadNotificationCount = async (userId) => {
  try {
    const query = `
      SELECT COUNT(*) as unread_count
      FROM notifications 
      WHERE user_id = $1 AND is_read = false
    `;
    
    const values = [userId];
    const result = await executeQuery(query, values);
    
    return parseInt(result.rows[0].unread_count, 10);
  } catch (err) {
    throw err;
  }
};

// Create multiple notifications (bulk)
const createBulkNotifications = async (notificationsData) => {
  try {
    // Use a transaction to ensure ACID compliance
    const queries = [];
    
    for (const notificationData of notificationsData) {
      const { 
        userId, 
        type, 
        title, 
        message, 
        relatedId = null,
        relatedType = null
      } = notificationData;
      
      const query = `
        INSERT INTO notifications (
          user_id, 
          type, 
          title, 
          message, 
          related_id, 
          related_type
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      
      const values = [userId, type, title, message, relatedId, relatedType];
      queries.push({ query, values });
    }
    
    // Execute the transaction
    await executeTransaction(queries);
    
    return { success: true, count: notificationsData.length };
  } catch (err) {
    throw err;
  }
};

export {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteReadNotifications,
  getUnreadNotificationCount,
  createBulkNotifications
};