import React from 'react';
import { NewsCard } from './NewsCard';

interface CategorySectionProps {
  title: string;
  highlightColor: string;
  articles: Array<{
    title: string;
    summary: string;
    imageUrl: string;
    category: string;
    timeAgo: string;
  }>;
  isQuickRead: boolean;
}

export function CategorySection({ title, highlightColor, articles, isQuickRead }: CategorySectionProps) {
  const colorClasses = {
    red: 'border-red-500 text-red-600 dark:text-red-400',
    teal: 'border-teal-500 text-teal-600 dark:text-teal-400',
    green: 'border-green-500 text-green-600 dark:text-green-400',
    purple: 'border-purple-500 text-purple-600 dark:text-purple-400'
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className={`border-l-4 ${colorClasses[highlightColor as keyof typeof colorClasses]} pl-4 mb-6`}>
        <h2 className={`text-2xl font-bold ${colorClasses[highlightColor as keyof typeof colorClasses]}`}>
          {title}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <NewsCard
            key={index}
            title={article.title}
            summary={article.summary}
            imageUrl={article.imageUrl}
            category={article.category}
            timeAgo={article.timeAgo}
            isQuickRead={isQuickRead}
          />
        ))}
      </div>
    </section>
  );
}