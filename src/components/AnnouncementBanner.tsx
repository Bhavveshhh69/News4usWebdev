import React, { useState } from 'react';
import { Button } from "./ui/button";
import { X, AlertTriangle, Info, CheckCircle, Megaphone, ExternalLink } from 'lucide-react';

type BannerType = 'urgent' | 'info' | 'success' | 'warning' | 'announcement';

interface AnnouncementBannerProps {
  type?: BannerType;
  title?: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  dismissible?: boolean;
  isVisible?: boolean;
  className?: string;
}

export function AnnouncementBanner({
  type = 'info',
  title,
  message,
  actionText,
  actionUrl,
  onAction,
  onDismiss,
  dismissible = true,
  isVisible = true,
  className = ''
}: AnnouncementBannerProps) {
  const [isOpen, setIsOpen] = useState(isVisible);

  if (!isOpen) return null;

  const handleDismiss = () => {
    setIsOpen(false);
    onDismiss?.();
  };

  const handleAction = () => {
    if (actionUrl) {
      window.open(actionUrl, '_blank');
    }
    onAction?.();
  };

  const getIcon = () => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'announcement':
        return <Megaphone className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'urgent':
        return {
          container: 'bg-red-600 text-white border-red-700',
          icon: 'text-white',
          button: 'bg-red-700 hover:bg-red-800 text-white',
          closeButton: 'text-white hover:bg-red-700'
        };
      case 'warning':
        return {
          container: 'bg-yellow-500 text-yellow-900 border-yellow-600',
          icon: 'text-yellow-900',
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          closeButton: 'text-yellow-900 hover:bg-yellow-600 hover:text-white'
        };
      case 'success':
        return {
          container: 'bg-green-600 text-white border-green-700',
          icon: 'text-white',
          button: 'bg-green-700 hover:bg-green-800 text-white',
          closeButton: 'text-white hover:bg-green-700'
        };
      case 'announcement':
        return {
          container: 'bg-blue-600 text-white border-blue-700',
          icon: 'text-white',
          button: 'bg-blue-700 hover:bg-blue-800 text-white',
          closeButton: 'text-white hover:bg-blue-700'
        };
      default:
        return {
          container: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800',
          icon: 'text-blue-600 dark:text-blue-400',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          closeButton: 'text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-800'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`relative border ${styles.container} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className={styles.icon}>
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              {title && (
                <p className="font-semibold mb-1 pr-4">
                  {title}
                </p>
              )}
              <p className={`${title ? 'text-sm' : ''} pr-4`}>
                {message}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            {(actionText || actionUrl) && (
              <Button
                onClick={handleAction}
                size="sm"
                className={`${styles.button} flex items-center space-x-1`}
              >
                <span>{actionText || 'Learn More'}</span>
                {actionUrl && <ExternalLink className="w-3 h-3" />}
              </Button>
            )}

            {dismissible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className={`p-1 ${styles.closeButton}`}
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Dismiss</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Preset banner configurations for common use cases
export const BannerPresets = {
  breaking: (message: string, actionText?: string, onAction?: () => void) => (
    <AnnouncementBanner
      type="urgent"
      title="BREAKING NEWS"
      message={message}
      actionText={actionText}
      onAction={onAction}
    />
  ),

  maintenance: (message: string, actionUrl?: string) => (
    <AnnouncementBanner
      type="warning"
      title="Scheduled Maintenance"
      message={message}
      actionText="More Details"
      actionUrl={actionUrl}
    />
  ),

  election: (message: string) => (
    <AnnouncementBanner
      type="announcement"
      title="ELECTION COVERAGE"
      message={message}
      actionText="Follow Live Updates"
    />
  ),

  newsletter: (message: string, onAction?: () => void) => (
    <AnnouncementBanner
      type="info"
      title="Stay Informed"
      message={message}
      actionText="Subscribe Now"
      onAction={onAction}
    />
  ),

  alert: (message: string, onAction?: () => void) => (
    <AnnouncementBanner
      type="urgent"
      message={message}
      actionText="Read More"
      onAction={onAction}
    />
  )
};