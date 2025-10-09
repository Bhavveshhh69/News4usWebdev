// User Profile service with ACID compliance
import { 
  upsertUserProfile,
  getUserProfileByUserId,
  getUserProfileById,
  updateUserPreferences,
  getUserPreferencesByUserId,
  getUserArticles,
  getUserFavoriteArticles,
  addArticleToUserFavorites,
  removeArticleFromUserFavorites
} from '../repositories/userProfileRepository.js';

import { findUserById } from '../repositories/userRepository.js';
import { getArticleById } from '../repositories/articleRepository.js';

// Create or update user profile
const createOrUpdateUserProfile = async (userId, profileData) => {
  try {
    // Validate user exists
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('Invalid user ID');
    }
    
    // Validate profile data
    if (profileData.bio && profileData.bio.length > 500) {
      throw new Error('Bio must be less than 500 characters');
    }
    
    if (profileData.website && profileData.website.length > 200) {
      throw new Error('Website must be less than 200 characters');
    }
    
    if (profileData.location && profileData.location.length > 100) {
      throw new Error('Location must be less than 100 characters');
    }
    
    if (profileData.avatarUrl && profileData.avatarUrl.length > 500) {
      throw new Error('Avatar URL must be less than 500 characters');
    }
    
    // Validate social links if provided
    if (profileData.socialLinks) {
      const socialPlatforms = ['twitter', 'facebook', 'linkedin', 'github', 'instagram'];
      for (const [platform, url] of Object.entries(profileData.socialLinks)) {
        if (!socialPlatforms.includes(platform)) {
          throw new Error(`Invalid social platform: ${platform}`);
        }
        
        if (url && url.length > 200) {
          throw new Error(`${platform} URL must be less than 200 characters`);
        }
      }
    }
    
    // Create or update the profile
    const profile = await upsertUserProfile(userId, profileData);
    
    return {
      success: true,
      profile,
      message: 'User profile updated successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get user profile by user ID
const getUserProfile = async (userId) => {
  try {
    // Validate user exists
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('Invalid user ID');
    }
    
    const profile = await getUserProfileByUserId(userId);
    
    if (!profile) {
      throw new Error('User profile not found');
    }
    
    return {
      success: true,
      profile,
      message: 'User profile retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Update user preferences
const updatePreferences = async (userId, preferences) => {
  try {
    // Validate user exists
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('Invalid user ID');
    }
    
    // Validate preferences
    if (typeof preferences !== 'object' || preferences === null) {
      throw new Error('Preferences must be an object');
    }
    
    // Define allowed preference keys
    const allowedPreferences = [
      'emailNotifications',
      'newsletterSubscription',
      'theme',
      'language',
      'privacySettings'
    ];
    
    // Validate preference keys
    for (const key of Object.keys(preferences)) {
      if (!allowedPreferences.includes(key)) {
        throw new Error(`Invalid preference key: ${key}`);
      }
    }
    
    // Update the preferences
    const updatedPreferences = await updateUserPreferences(userId, preferences);
    
    return {
      success: true,
      preferences: updatedPreferences,
      message: 'User preferences updated successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get user preferences by user ID
const getUserPreferences = async (userId) => {
  try {
    // Validate user exists
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('Invalid user ID');
    }
    
    const preferences = await getUserPreferencesByUserId(userId);
    
    return {
      success: true,
      preferences: preferences || { preferences: {} },
      message: 'User preferences retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get user's authored articles with pagination
const getUserAuthoredArticles = async (userId, limit = 10, offset = 0) => {
  try {
    // Validate user exists
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('Invalid user ID');
    }
    
    // Validate limit and offset
    if (limit < 1 || limit > 100) {
      limit = 10;
    }
    
    if (offset < 0) {
      offset = 0;
    }
    
    const result = await getUserArticles(userId, limit, offset);
    
    return {
      success: true,
      ...result,
      message: 'User articles retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get user's favorite articles with pagination
const getUserFavoriteArticlesList = async (userId, limit = 10, offset = 0) => {
  try {
    // Validate user exists
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('Invalid user ID');
    }
    
    // Validate limit and offset
    if (limit < 1 || limit > 100) {
      limit = 10;
    }
    
    if (offset < 0) {
      offset = 0;
    }
    
    const result = await getUserFavoriteArticles(userId, limit, offset);
    
    return {
      success: true,
      ...result,
      message: 'User favorite articles retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Add article to user's favorites
const addArticleToFavorites = async (userId, articleId) => {
  try {
    // Validate user exists
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('Invalid user ID');
    }
    
    // Validate article exists
    const article = await getArticleById(articleId);
    if (!article) {
      throw new Error('Invalid article ID');
    }
    
    // Article must be published to be added to favorites
    if (article.status !== 'published') {
      throw new Error('Only published articles can be added to favorites');
    }
    
    const result = await addArticleToUserFavorites(userId, articleId);
    
    return {
      success: true,
      result,
      message: 'Article added to favorites successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Remove article from user's favorites
const removeArticleFromFavorites = async (userId, articleId) => {
  try {
    // Validate user exists
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('Invalid user ID');
    }
    
    // Validate article exists
    const article = await getArticleById(articleId);
    if (!article) {
      throw new Error('Invalid article ID');
    }
    
    const result = await removeArticleFromUserFavorites(userId, articleId);
    
    return {
      success: true,
      result,
      message: 'Article removed from favorites successfully'
    };
  } catch (err) {
    throw err;
  }
};

export {
  createOrUpdateUserProfile,
  getUserProfile,
  updatePreferences,
  getUserPreferences,
  getUserAuthoredArticles,
  getUserFavoriteArticlesList,
  addArticleToFavorites,
  removeArticleFromFavorites
};