import React, { useMemo, useState } from 'react';
import { ArticleCard } from '../ArticleCard';
import { Sidebar } from '../Sidebar';
import { Button } from '../ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb';
import { Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '../Router';
import { useContent, timeAgoFrom } from '../../store/contentStore';
import { getCategoryColor, colorClasses } from '../../lib/utils';
import { stockData, youtubeVideos, trendingArticles } from '../../data/mock';

interface ArticleCardModel {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  category: string;
  timeAgo: string;
  author?: string;
  readTime?: string;
}

interface CategoryPageProps {
  category: string;
  isQuickRead: boolean;
}

export function CategoryPage({ category, isQuickRead }: CategoryPageProps) {
  const { articles } = useContent();
  const [viewMode, setViewMode] = useState('grid' as 'grid' | 'list');
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 12;

  const { featuredArticle, list } = useMemo(() => {
    const published = articles.filter(a => (a.status === 'published') || (a.status === 'scheduled' && new Date(a.publishDate).getTime() <= Date.now()));
    const ofCategory = published.filter(a => a.category.toLowerCase() === category.toLowerCase());
    const sorted = [...ofCategory].sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

    const featured = sorted.find(a => a.placements?.categorySpot === 'featured') || sorted[0];
    const toCard = (a: any): ArticleCardModel => ({
      id: a.id,
      title: a.title,
      summary: a.summary,
      imageUrl: a.imageUrl,
      category: a.category.toUpperCase(),
      timeAgo: timeAgoFrom(a.publishDate),
      author: a.author,
      readTime: a.readTime,
    });

    const listAll = sorted.map(toCard);
    return { featuredArticle: featured ? toCard(featured) : undefined, list: listAll };
  }, [articles, category]);

  const totalPages = Math.ceil(list.length / articlesPerPage) || 1;
  const startIndex = (currentPage - 1) * articlesPerPage;
  const currentArticles = list.slice(startIndex, startIndex + articlesPerPage);
  const gridArticles = featuredArticle ? currentArticles.filter(a => a.id !== featuredArticle.id) : currentArticles;

  const color = getCategoryColor(category);
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
            <BreadcrumbPage className="font-semibold">{category}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-red-600 dark:text-red-400">{category}</span>
          <span className="text-gray-900 dark:text-white"> News</span>
        </h1>
        <div className={`inline-flex items-center px-3 py-1 rounded-full border-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
          <span className="text-sm font-semibold">{list.length} Articles</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Featured Article */}
          {featuredArticle && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Featured Story</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="aspect-video">
                  <img 
                    src={featuredArticle.imageUrl} 
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold mb-3 ${colorClasses[color as keyof typeof colorClasses]}`}>
                    {featuredArticle.category}
                  </div>
                  <RLink to="/article" params={{ id: featuredArticle.id }}>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors">
                      {featuredArticle.title}
                    </h3>
                  </RLink>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{featuredArticle.summary}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{featuredArticle.author}</span>
                    <div className="flex items-center space-x-4">
                      <span>{featuredArticle.timeAgo}</span>
                      <span>{featuredArticle.readTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">More {category} News</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Articles Grid/List */}
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8" 
            : "space-y-6 mb-8"
          }>
            {gridArticles.map((article) => (
              <div key={article.id}>
                <ArticleCard
                  article={article}
                  isQuickRead={isQuickRead}
                  variant={viewMode === 'list' ? 'list' : 'card'}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? 'bg-red-600 hover:bg-red-700' : ''}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <Sidebar 
              stockData={stockData}
              youtubeVideos={youtubeVideos}
              trendingArticles={trendingArticles}
            />
          </div>
        </div>
      </div>
    </div>
  );
}