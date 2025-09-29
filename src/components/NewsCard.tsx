import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArticleShare } from './SocialShare';
import { Clock } from 'lucide-react';

interface NewsCardProps {
  title: string;
  summary: string;
  imageUrl: string;
  category: string;
  timeAgo: string;
  size?: 'small' | 'medium' | 'large';
  isQuickRead?: boolean;
}

export function NewsCard({ title, summary, imageUrl, category, timeAgo, size = 'medium', isQuickRead }: NewsCardProps) {
  const sizeClasses = {
    small: 'h-32',
    medium: 'h-48',
    large: 'h-64'
  };

  const quickReadBullets = [
    "Key development in ongoing situation",
    "Important stakeholders respond to changes", 
    "Expected timeline and next steps announced"
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      <div className={`relative ${sizeClasses[size]} overflow-hidden`}>
        <ImageWithFallback
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
            {category}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
          {title}
        </h3>
        
        {isQuickRead ? (
          <div className="space-y-1 mb-3">
            {quickReadBullets.map((bullet, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{bullet}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
            {summary}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {timeAgo}
          </div>
        </div>

        {/* Social Share Section */}
        <ArticleShare 
          articleTitle={title}
          className="mt-3"
        />
      </div>
    </div>
  );
}