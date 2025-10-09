// Test file for User Profile Service functionality
import dotenv from 'dotenv';
dotenv.config();

import { 
  createOrUpdateUserProfile,
  getUserProfile,
  updatePreferences,
  getUserPreferences,
  getUserAuthoredArticles,
  getUserFavoriteArticlesList,
  addArticleToFavorites,
  removeArticleFromFavorites
} from './services/userProfileService.js';

import { 
  createNewArticle
} from './services/articleService.js';

import { 
  createCategory
} from './repositories/categoryRepository.js';

console.log('Testing User Profile Service functionality...');

// Test user profile operations
console.log('\n--- Testing User Profile Operations ---');

try {
  // Use the existing user ID from our previous tests
  const userId = 6;
  
  // Create or update user profile
  const profileData = {
    bio: 'This is a test user bio for testing purposes',
    website: 'https://example.com',
    location: 'Test City, Test Country',
    avatarUrl: 'https://example.com/avatar.jpg',
    socialLinks: {
      twitter: 'https://twitter.com/testuser',
      github: 'https://github.com/testuser'
    }
  };
  
  const updatedProfile = await createOrUpdateUserProfile(userId, profileData);
  console.log('Updated user profile:', updatedProfile.profile.bio);
  
  // Get user profile
  const retrievedProfile = await getUserProfile(userId);
  console.log('Retrieved user profile:', retrievedProfile.profile.location);
  
  // Update user preferences
  const preferences = {
    emailNotifications: true,
    newsletterSubscription: false,
    theme: 'dark',
    language: 'en'
  };
  
  const updatedPreferences = await updatePreferences(userId, preferences);
  console.log('Updated user preferences:', updatedPreferences.preferences.preferences.theme);
  
  // Get user preferences
  const retrievedPreferences = await getUserPreferences(userId);
  console.log('Retrieved user preferences:', retrievedPreferences.preferences.preferences.language);
  
  // Create a category for our article
  const categoryData = {
    name: 'Test_Category_' + Date.now(),
    description: 'Test category for articles'
  };
  
  const newCategory = await createCategory(categoryData);
  console.log('Created category:', newCategory.name);
  
  // Create an article
  const articleData = {
    title: 'Test Article for Favorites ' + Date.now(),
    summary: 'This is a test article for favorites testing',
    content: 'This is the full content of the test article for favorites testing.',
    categoryId: newCategory.id,
    status: 'published',
    isFeatured: false
  };
  
  const newArticle = await createNewArticle(articleData, userId);
  console.log('Created article:', newArticle.article.title);
  
  // Add article to user's favorites
  const addedFavorite = await addArticleToFavorites(userId, newArticle.article.id);
  console.log('Added article to favorites:', addedFavorite.message);
  
  // Get user's favorite articles
  const favoriteArticles = await getUserFavoriteArticlesList(userId, 10, 0);
  console.log('User favorite articles count:', favoriteArticles.articles.length);
  
  // Remove article from user's favorites
  const removedFavorite = await removeArticleFromFavorites(userId, newArticle.article.id);
  console.log('Removed article from favorites:', removedFavorite.message);
  
  // Get user's authored articles
  const userArticles = await getUserAuthoredArticles(userId, 10, 0);
  console.log('User authored articles count:', userArticles.articles.length);
  
  console.log('\n--- User Profile Service Test Completed Successfully ---');
} catch (err) {
  console.error('Error in user profile operations:', err.message);
  console.error('Stack trace:', err.stack);
}