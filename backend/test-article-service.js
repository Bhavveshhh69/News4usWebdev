// Test file for Article Service functionality
import dotenv from 'dotenv';
dotenv.config();

import { 
  createNewArticle, 
  getArticle, 
  getArticles, 
  updateExistingArticle, 
  deleteExistingArticle,
  publishExistingArticle,
  searchExistingArticles,
  getArticlesByTagName
} from './services/articleService.js';

import { 
  createCategory, 
  getCategoryById, 
  getCategoryByName 
} from './repositories/categoryRepository.js';

import { 
  createTag, 
  getTagByName 
} from './repositories/tagRepository.js';

console.log('Testing Article Service functionality...');

// Test article operations
console.log('\n--- Testing Article Operations ---');

try {
  // First, create a category for our article
  const categoryData = {
    name: 'Test_Category_' + Date.now(),
    description: 'Test category for articles'
  };
  
  const newCategory = await createCategory(categoryData);
  console.log('Created category:', newCategory);
  
  // Create a tag for our article
  const tagData = {
    name: 'Test_Tag_' + Date.now()
  };
  
  const newTag = await createTag(tagData);
  console.log('Created tag:', newTag);
  
  // Use the actual user ID from our test user
  const authorId = 6;
  
  // Create an article
  const articleData = {
    title: 'Test Article ' + Date.now(),
    summary: 'This is a test article summary',
    content: 'This is the full content of the test article. It contains important information for testing purposes.',
    categoryId: newCategory.id,
    tags: [newTag.name],
    status: 'draft',
    isFeatured: false
  };
  
  const newArticle = await createNewArticle(articleData, authorId);
  console.log('Created article:', newArticle);
  
  // Get the article
  const retrievedArticle = await getArticle(newArticle.article.id);
  console.log('Retrieved article:', retrievedArticle);
  
  // Get all articles
  const allArticles = await getArticles(10, 0, { categoryId: newCategory.id });
  console.log('All articles in category:', allArticles);
  
  // Update the article (without publishing it)
  const updatedArticle = await updateExistingArticle(newArticle.article.id, {
    title: 'Updated Test Article ' + Date.now(),
    summary: 'This is an updated test article summary',
    content: 'This is the updated full content of the test article.',
    categoryId: newCategory.id,
    isFeatured: true
    // Note: Not setting status to 'published' here so we can test the publish function separately
  }, authorId);
  console.log('Updated article:', updatedArticle);
  
  // Publish the article
  const publishedArticle = await publishExistingArticle(newArticle.article.id, authorId);
  console.log('Published article:', publishedArticle);
  
  // Search for the article
  const searchResults = await searchExistingArticles('test article', 10, 0);
  console.log('Search results:', searchResults);
  
  // Get articles by tag
  const articlesByTag = await getArticlesByTagName(newTag.name, 10, 0);
  console.log('Articles by tag:', articlesByTag);
  
  // Delete the article
  const deletedArticle = await deleteExistingArticle(newArticle.article.id, authorId);
  console.log('Deleted article:', deletedArticle);
  
  console.log('\n--- Article Service Test Completed Successfully ---');
} catch (err) {
  console.error('Error in article operations:', err.message);
  console.error('Stack trace:', err.stack);
}