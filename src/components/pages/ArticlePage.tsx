import React, { useMemo, useState } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb';
import { Button } from '../ui/button';
import { SocialShare } from '../SocialShare';
import { VideoPlayer } from '../VideoPlayer';
import { ArticleCard } from '../ArticleCard';
import { Sidebar } from '../Sidebar';
import { Link, useRouter } from '../Router';
import { Calendar, Clock, User, Bookmark, Type, Sun, Moon } from 'lucide-react';
import { useContent, timeAgoFrom } from '../../store/contentStore';

interface ArticlePageProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export function ArticlePage({ isDarkMode, toggleDarkMode }: ArticlePageProps) {
  const { params } = useRouter();
  const { articles } = useContent();
  const [fontSize, setFontSize] = useState('base');
  const [isBookmarked, setIsBookmarked] = useState(false);

  const article = useMemo(() => {
    const byId = articles.find(a => a.id === params.id);
    if (byId) return byId;
    const bySlug = articles.find(a => a.slug === params.id);
    return bySlug || articles[0];
  }, [articles, params.id]);

  const relatedArticles = useMemo(() => {
    return articles
      .filter(a => a.category === article.category && a.id !== article.id)
      .slice(0, 4)
      .map(a => ({
        id: a.id,
        title: a.title,
        summary: a.summary,
        imageUrl: a.imageUrl,
        category: a.category.toUpperCase(),
        timeAgo: timeAgoFrom(a.publishDate),
        author: a.author,
        readTime: a.readTime,
      }));
  }, [articles, article]);

  const fontSizeClasses = {
    small: 'text-sm',
    base: 'text-base',
    large: 'text-lg',
    xl: 'text-xl'
  };

  const RLink: any = Link;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <RLink to="/">Home</RLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <RLink to="/category" params={{ category: article.category.toLowerCase() }}>
                {article.category}
              </RLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold line-clamp-1">
              {article.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Article Content */}
        <div className="lg:col-span-3">
          <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Article Header */}
            <div className="p-6 pb-0">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300">
                  {article.category}
                </span>
                {(article.tags || []).map((tag) => (
                  <span key={tag} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                {article.title}
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                {article.summary}
              </p>

              {/* Article Meta */}
              <div className="flex flex-wrap items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 mb-6">
                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(article.publishDate).toDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{article.readTime}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFontSize(fontSize === 'xl' ? 'small' : fontSize === 'small' ? 'base' : fontSize === 'base' ? 'large' : 'xl')}
                  >
                    <Type className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleDarkMode}
                  >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </Button>

                  <Button
                    variant={isBookmarked ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={isBookmarked ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    <Bookmark className="w-4 h-4" />
                  </Button>

                  <SocialShare 
                    url={`/article/${article.id}`}
                    title={article.title}
                    variant="inline"
                  />
                </div>
              </div>
            </div>

            {/* Featured Media */}
            <div className="px-6">
              <div className="aspect-video mb-6 rounded-lg overflow-hidden">
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Article Content */}
            <div className={`px-6 pb-6 prose prose-lg max-w-none dark:prose-invert ${fontSizeClasses[fontSize as keyof typeof fontSizeClasses]}`}>
              <div 
                dangerouslySetInnerHTML={{ __html: article.content || '' }}
                className="leading-relaxed"
              />
            </div>

            {/* Article Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Share this article:</span>
                  <SocialShare 
                    url={`/article/${article.id}`}
                    title={article.title}
                    variant="inline"
                  />
                </div>
                <Button
                  variant={isBookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={isBookmarked ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
              </div>
            </div>
          </article>

          {/* Related Articles */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <div key={relatedArticle.id}>
                  <ArticleCard
                    article={relatedArticle}
                    variant="card"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}