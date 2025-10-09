// Test file for Notifications Service functionality
import dotenv from 'dotenv';
dotenv.config();

import { 
  createNewNotification,
  getUserNotificationList,
  markNotificationRead,
  markAllNotificationsRead,
  deleteExistingNotification,
  deleteReadUserNotifications,
  getUnreadCount,
  createBulkNotificationList
} from './services/notificationService.js';

console.log('Testing Notifications Service functionality...');

// Test notifications operations
console.log('\n--- Testing Notifications Operations ---');

try {
  // Use the existing user ID from our previous tests
  const userId = 6;
  
  // Create a notification
  const notificationData = {
    userId: userId,
    type: 'article_published',
    title: 'New Article Published',
    message: 'A new article has been published on the platform.',
    relatedId: 1,
    relatedType: 'article'
  };
  
  const newNotification = await createNewNotification(notificationData);
  console.log('Created notification:', newNotification.notification.title);
  
  // Create a bulk notification
  const bulkNotifications = [
    {
      userId: userId,
      type: 'comment_added',
      title: 'New Comment',
      message: 'Someone commented on your article.',
      relatedId: 1,
      relatedType: 'comment'
    },
    {
      userId: userId,
      type: 'system_alert',
      title: 'System Update',
      message: 'The system will be updated tomorrow.',
      relatedId: null,
      relatedType: null
    }
  ];
  
  const bulkResult = await createBulkNotificationList(bulkNotifications);
  console.log('Created bulk notifications:', bulkResult.count);
  
  // Get user notifications
  const userNotifications = await getUserNotificationList(userId, 10, 0, false);
  console.log('User notifications count:', userNotifications.notifications.length);
  
  // Get unread count
  const unreadCount = await getUnreadCount(userId);
  console.log('Unread notifications count:', unreadCount.count);
  
  // Mark a notification as read
  const readNotification = await markNotificationRead(newNotification.notification.id, userId);
  console.log('Marked notification as read:', readNotification.notification.title);
  
  // Get unread count again
  const unreadCountAfter = await getUnreadCount(userId);
  console.log('Unread notifications count after marking one as read:', unreadCountAfter.count);
  
  // Mark all notifications as read
  const markAllResult = await markAllNotificationsRead(userId);
  console.log('Marked all notifications as read:', markAllResult.updated_count);
  
  // Get unread count again
  const unreadCountFinal = await getUnreadCount(userId);
  console.log('Final unread notifications count:', unreadCountFinal.count);
  
  // Delete a notification
  const deleteResult = await deleteExistingNotification(newNotification.notification.id, userId);
  console.log('Deleted notification:', deleteResult.result.id);
  
  // Delete read notifications
  const deleteReadResult = await deleteReadUserNotifications(userId);
  console.log('Deleted read notifications count:', deleteReadResult.deleted_count);
  
  console.log('\n--- Notifications Service Test Completed Successfully ---');
} catch (err) {
  console.error('Error in notifications operations:', err.message);
  console.error('Stack trace:', err.stack);
}