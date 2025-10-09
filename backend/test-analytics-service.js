// Test file for Analytics Service functionality
import dotenv from 'dotenv';
dotenv.config();

import { 
  getArticleStats,
  getUserStats,
  getPlatformStatistics,
  getTopArticles,
  getTopAuthors,
  getArticleTrend,
  trackView,
  getCategoryStatistics,
  getTagStatistics
} from './services/analyticsService.js';

import { 
  createNewArticle
} from './services/articleService.js';

import { 
  createCategory
} from './repositories/categoryRepository.js';

console.log('Testing Analytics Service functionality...');

// Test analytics operations
console.log('\n--- Testing Analytics Operations ---');

try {
  // Use the existing user ID from our previous tests
  const userId = 6;
  
  // Create a category for our article
  const categoryData = {
    name: 'Test_Category_' + Date.now(),
    description: 'Test category for articles'
  };
  
  const newCategory = await createCategory(categoryData);
  console.log('Created category:', newCategory.name);
  
  // Create an article
  const articleData = {
    title: 'Test Article for Analytics ' + Date.now(),
    summary: 'This is a test article for analytics testing',
    content: 'This is the full content of the test article for analytics testing.',
    categoryId: newCategory.id,
    status: 'published',
    isFeatured: false
  };
  
  const newArticle = await createNewArticle(articleData, userId);
  console.log('Created article:', newArticle.article.title);
  
  // Track some views for the article
  await trackView(newArticle.article.id, userId);
  await trackView(newArticle.article.id, userId);
  await trackView(newArticle.article.id);
  console.log('Tracked article views');
  
  // Get article statistics
  const articleStats = await getArticleStats(newArticle.article.id);
  console.log('Article views:', articleStats.stats.views);
  
  // Get user statistics
  const userStats = await getUserStats(userId);
  console.log('User article count:', userStats.stats.article_count);
  
  // Get platform statistics
  const platformStats = await getPlatformStatistics();
  console.log('Total articles:', platformStats.stats.total_articles);
  
  // Get top articles
  const topArticles = await getTopArticles(5);
  console.log('Top articles count:', topArticles.articles.length);
  
  // Get top authors
  const topAuthors = await getTopAuthors(5);
  console.log('Top authors count:', topAuthors.authors.length);
  
  // Get article trend
  const articleTrend = await getArticleTrend(newArticle.article.id, 7);
  console.log('Article trend data points:', articleTrend.trend.length);
  
  // Get category statistics
  const categoryStats = await getCategoryStatistics();
  console.log('Categories with stats:', categoryStats.categories.length);
  
  // Get tag statistics
  const tagStats = await getTagStatistics();
  console.log('Tags with stats:', tagStats.tags.length);
  
  console.log('\n--- Analytics Service Test Completed Successfully ---');
} catch (err) {
  console.error('Error in analytics operations:', err.message);
  console.error('Stack trace:', err.stack);
}