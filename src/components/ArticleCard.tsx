import React from 'react';
import { Clock, User } from 'lucide-react';
import { SocialShare } from './SocialShare';
import { Link } from './Router';

interface Article {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  category: string;
  timeAgo: string;
  author?: string;
  readTime?: string;
}

interface ArticleCardProps {
  article: Article;
  isQuickRead?: boolean;
  variant?: 'card' | 'list';
  className?: string;
}

export function ArticleCard({ article, isQuickRead = false, variant = 'card', className = '' }: ArticleCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'politics': return 'border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400';
      case 'health': return 'border-teal-500 bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400';
      case 'sports': return 'border-green-500 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      case 'entertainment': return 'border-purple-500 bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400';
    }
  };

  const quickReadPoints = isQuickRead ? [
    "Key development in " + article.category.toLowerCase(),
    "Expert analysis and commentary",
    "Impact on stakeholders discussed",
    "Future implications outlined"
  ] : [];

  if (variant === 'list') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${className}`}>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3">
            <div className="aspect-video md:aspect-square md:h-48">
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold border-2 ${getCategoryColor(article.category)}`}>
                {article.category}
              </div>
              <SocialShare 
                url={`/article/${article.id}`}
                title={article.title}
                variant="compact"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
            
            <Link to="/article" params={{ id: article.id }}>
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors line-clamp-2">
                {article.title}
              </h3>
            </Link>
            
            {isQuickRead ? (
              <ul className="space-y-1 mb-4">
                {quickReadPoints.map((point, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{article.summary}</p>
            )}
            
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                {article.author && (
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{article.author}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{article.timeAgo}</span>
                </div>
              </div>
              {article.readTime && (
                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                  {article.readTime}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`group bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}>
      <div className="relative">
        <div className="aspect-video">
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="absolute top-3 left-3">
          <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold border-2 ${getCategoryColor(article.category)}`}>
            {article.category}
          </div>
        </div>
        <div className="absolute top-3 right-3">
          <SocialShare 
            url={`/article/${article.id}`}
            title={article.title}
            variant="compact"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
      
      <div className="p-4">
        <Link to="/article" params={{ id: article.id }}>
          <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors line-clamp-2">
            {article.title}
          </h3>
        </Link>
        
        {isQuickRead ? (
          <ul className="space-y-1 mb-4">
            {quickReadPoints.map((point, index) => (
              <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                <span className="text-red-600 mr-2">•</span>
                {point}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{article.summary}</p>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            {article.author && (
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{article.author}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{article.timeAgo}</span>
            </div>
          </div>
          {article.readTime && (
            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
              {article.readTime}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}