import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Share2, Facebook, Twitter, Linkedin, MessageCircle, Copy, Check } from 'lucide-react';
import { toast } from "sonner@2.0.3";

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  className?: string;
  variant?: 'floating' | 'inline' | 'compact';
  showLabels?: boolean;
}

export function SocialShare({
  url = typeof window !== 'undefined' ? window.location.href : '',
  title = typeof document !== 'undefined' ? document.title : 'NEWS4US',
  description = '',
  className = '',
  variant = 'floating',
  showLabels = false
}: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const shareButtons = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => handleShare('facebook')
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-black hover:bg-gray-800',
      action: () => handleShare('twitter')
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      action: () => handleShare('linkedin')
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => handleShare('whatsapp')
    },
    {
      name: 'Copy Link',
      icon: copied ? Check : Copy,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: copyToClipboard
    }
  ];

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-10"
        >
          <Share2 className="w-4 h-4" />
          {showLabels && <span className="ml-2">Share</span>}
        </Button>
        
        {isOpen && (
          <>
            {/* Overlay to close dropdown */}
            <div 
              className="fixed inset-0 z-[5]" 
              onClick={() => setIsOpen(false)} 
            />
            
            {/* Dropdown content */}
            <div className="absolute top-full mt-2 right-0 w-64 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[10]">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm mb-3">Share this article</h4>
                <div className="grid grid-cols-5 gap-2">
                  {shareButtons.map((button) => (
                    <Button
                      key={button.name}
                      variant="ghost"
                      size="sm"
                      onClick={button.action}
                      className={`p-2 ${button.color} text-white hover:text-white flex flex-col items-center space-y-1`}
                      title={button.name}
                    >
                      <button.icon className="w-4 h-4" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Share:</span>
        {shareButtons.map((button) => (
          <Button
            key={button.name}
            variant="ghost"
            size="sm"
            onClick={button.action}
            className={`p-2 ${button.color} text-white hover:text-white`}
            title={button.name}
          >
            <button.icon className="w-4 h-4" />
            {showLabels && <span className="ml-2 hidden sm:inline">{button.name}</span>}
          </Button>
        ))}
      </div>
    );
  }

  // Floating variant (default)
  return (
    <div className={`fixed left-4 top-1/2 transform -translate-y-1/2 z-40 ${className}`}>
      <div className="flex flex-col space-y-2">
        {shareButtons.map((button) => (
          <Button
            key={button.name}
            onClick={button.action}
            className={`p-3 rounded-full shadow-lg ${button.color} text-white hover:text-white hover:scale-110 transition-all duration-200`}
            title={button.name}
          >
            <button.icon className="w-5 h-5" />
          </Button>
        ))}
      </div>
    </div>
  );
}

// Article-specific share component that can be embedded in articles
interface ArticleShareProps {
  articleTitle: string;
  articleUrl?: string;
  className?: string;
}

export function ArticleShare({ articleTitle, articleUrl, className = '' }: ArticleShareProps) {
  return (
    <div className={`flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Share this article:</span>
        <SocialShare
          url={articleUrl}
          title={articleTitle}
          variant="inline"
          className="flex-1"
        />
      </div>
    </div>
  );
}

// Video share component for video thumbnails
interface VideoShareProps {
  videoTitle: string;
  videoUrl?: string;
  className?: string;
}

export function VideoShare({ videoTitle, videoUrl, className = '' }: VideoShareProps) {
  return (
    <div className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${className}`}>
      <SocialShare
        url={videoUrl}
        title={videoTitle}
        variant="compact"
        className="bg-black bg-opacity-50 hover:bg-opacity-70 border-none text-white"
      />
    </div>
  );
}