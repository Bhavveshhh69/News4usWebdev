import React from 'react';
import { toast } from "sonner@2.0.3";

// Toast Notification Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastNotification {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Toast Notification Manager
export class ToastManager {
  static show(notification: Omit<ToastNotification, 'id'>) {
    const { type, title, message, action } = notification;
    
    switch (type) {
      case 'success':
        toast.success(title || message, {
          description: title ? message : undefined,
          action: action ? {
            label: action.label,
            onClick: action.onClick
          } : undefined
        });
        break;
      case 'error':
        toast.error(title || message, {
          description: title ? message : undefined,
          action: action ? {
            label: action.label,
            onClick: action.onClick
          } : undefined
        });
        break;
      case 'warning':
        toast.warning(title || message, {
          description: title ? message : undefined,
          action: action ? {
            label: action.label,
            onClick: action.onClick
          } : undefined
        });
        break;
      default:
        toast(title || message, {
          description: title ? message : undefined,
          action: action ? {
            label: action.label,
            onClick: action.onClick
          } : undefined
        });
    }
  }

  static success(message: string, title?: string, action?: { label: string; onClick: () => void }) {
    this.show({ type: 'success', title, message, action });
  }

  static error(message: string, title?: string, action?: { label: string; onClick: () => void }) {
    this.show({ type: 'error', title, message, action });
  }

  static warning(message: string, title?: string, action?: { label: string; onClick: () => void }) {
    this.show({ type: 'warning', title, message, action });
  }

  static info(message: string, title?: string, action?: { label: string; onClick: () => void }) {
    this.show({ type: 'info', title, message, action });
  }
}

// Push Notification Modal Component
interface PushNotificationModalProps {
  notification: PushNotification | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

export function PushNotificationModal({ 
  notification, 
  isOpen, 
  onClose, 
  onMarkAsRead 
}: PushNotificationModalProps) {
  if (!notification) return null;

  const handleAction = () => {
    onMarkAsRead(notification.id);
    if (notification.url) {
      window.open(notification.url, '_blank');
    }
    onClose();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'breaking': return 'bg-red-600';
      case 'sports': return 'bg-green-600';
      case 'politics': return 'bg-blue-600';
      case 'health': return 'bg-teal-600';
      case 'entertainment': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'breaking': return <AlertTriangle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-full ${getCategoryColor(notification.category)}`}>
                {getCategoryIcon(notification.category)}
                <span className="text-white text-xs font-medium ml-1">
                  {notification.category.toUpperCase()}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogTitle className="text-left">{notification.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {notification.imageUrl && (
            <img 
              src={notification.imageUrl} 
              alt={notification.title}
              className="w-full h-32 object-cover rounded-lg"
            />
          )}
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{notification.timestamp.toLocaleTimeString()}</span>
            <Badge variant="outline" className="text-xs">
              NEWS4US
            </Badge>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={handleAction}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {notification.url ? 'Read Full Story' : 'Mark as Read'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Notification Center Component
interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export function NotificationCenter({ 
  isOpen, 
  onClose, 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onClearAll 
}: NotificationCenterProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: PushNotification) => {
    onMarkAsRead(notification.id);
    if (notification.url) {
      window.open(notification.url, '_blank');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'breaking': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'sports': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'politics': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'health': return 'text-teal-600 bg-teal-50 dark:bg-teal-900/20';
      case 'entertainment': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge className="bg-red-600 text-white">
                  {unreadCount}
                </Badge>
              )}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
                <Check className="w-4 h-4 mr-1" />
                Mark All Read
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  notification.read 
                    ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50' 
                    : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                } hover:shadow-md`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-1 rounded text-xs font-medium ${getCategoryColor(notification.category)}`}>
                    {notification.category.toUpperCase()}
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  )}
                </div>
                
                <div className="mt-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {notification.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={onClearAll} size="sm">
              Clear All
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4 mr-1" />
              Notification Settings
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Notification Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<PushNotification | null>(null);

  const addNotification = (notification: Omit<PushNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: PushNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setSelectedNotification(newNotification);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    unreadCount,
    isNotificationCenterOpen,
    setIsNotificationCenterOpen,
    selectedNotification,
    setSelectedNotification
  };
}