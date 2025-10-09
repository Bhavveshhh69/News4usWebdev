// User Profile repository with ACID compliance
import { executeQuery, executeTransaction } from '../config/db-utils.js';

// Create or update user profile
const upsertUserProfile = async (userId, profileData) => {
  try {
    const { 
      bio, 
      website, 
      location, 
      avatarUrl,
      socialLinks = {}
    } = profileData;
    
    const query = `
      INSERT INTO user_profiles (
        user_id, 
        bio, 
        website, 
        location, 
        avatar_url, 
        social_links
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id) 
      DO UPDATE SET
        bio = EXCLUDED.bio,
        website = EXCLUDED.website,
        location = EXCLUDED.location,
        avatar_url = EXCLUDED.avatar_url,
        social_links = EXCLUDED.social_links,
        updated_at = NOW()
      RETURNING id, user_id, bio, website, location, avatar_url, social_links, created_at, updated_at
    `;
    
    const values = [
      userId, 
      bio, 
      website, 
      location, 
      avatarUrl,
      JSON.stringify(socialLinks)
    ];
    
    const result = await executeQuery(query, values);
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Get user profile by user ID
const getUserProfileByUserId = async (userId) => {
  try {
    const query = `
      SELECT 
        id, user_id, bio, website, location, avatar_url, social_links, created_at, updated_at
      FROM user_profiles 
      WHERE user_id = $1
    `;
    
    const values = [userId];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    // Parse social_links JSON
    const profile = result.rows[0];
    if (profile.social_links && typeof profile.social_links === 'string') {
      profile.social_links = JSON.parse(profile.social_links);
    }
    
    return profile;
  } catch (err) {
    throw err;
  }
};

// Get user profile by ID
const getUserProfileById = async (id) => {
  try {
    const query = `
      SELECT 
        id, user_id, bio, website, location, avatar_url, social_links, created_at, updated_at
      FROM user_profiles 
      WHERE id = $1
    `;
    
    const values = [id];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    // Parse social_links JSON
    const profile = result.rows[0];
    if (profile.social_links && typeof profile.social_links === 'string') {
      profile.social_links = JSON.parse(profile.social_links);
    }
    
    return profile;
  } catch (err) {
    throw err;
  }
};

// Update user preferences
const updateUserPreferences = async (userId, preferences) => {
  try {
    const query = `
      INSERT INTO user_preferences (user_id, preferences)
      VALUES ($1, $2)
      ON CONFLICT (user_id) 
      DO UPDATE SET
        preferences = EXCLUDED.preferences,
        updated_at = NOW()
      RETURNING id, user_id, preferences, created_at, updated_at
    `;
    
    const values = [userId, JSON.stringify(preferences)];
    const result = await executeQuery(query, values);
    
    // Parse preferences JSON
    const preference = result.rows[0];
    if (preference.preferences && typeof preference.preferences === 'string') {
      preference.preferences = JSON.parse(preference.preferences);
    }
    
    return preference;
  } catch (err) {
    throw err;
  }
};

// Get user preferences by user ID
const getUserPreferencesByUserId = async (userId) => {
  try {
    const query = `
      SELECT 
        id, user_id, preferences, created_at, updated_at
      FROM user_preferences 
      WHERE user_id = $1
    `;
    
    const values = [userId];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    // Parse preferences JSON
    const preference = result.rows[0];
    if (preference.preferences && typeof preference.preferences === 'string') {
      preference.preferences = JSON.parse(preference.preferences);
    }
    
    return preference;
  } catch (err) {
    throw err;
  }
};

// Get user's authored articles with pagination
const getUserArticles = async (userId, limit = 10, offset = 0) => {
  try {
    const query = `
      SELECT 
        id, title, summary, content, author_id, category_id, 
        status, published_at, created_at, updated_at, views, is_featured
      FROM articles 
      WHERE author_id = $1 AND status != 'deleted'
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const values = [userId, limit, offset];
    const result = await executeQuery(query, values);
    
    // Get total count for pagination
    const countQuery = 'SELECT COUNT(*) as total FROM articles WHERE author_id = $1 AND status != \'deleted\'';
    const countResult = await executeQuery(countQuery, [userId]);
    const total = parseInt(countResult.rows[0].total, 10);
    
    return {
      articles: result.rows,
      total,
      limit,
      offset
    };
  } catch (err) {
    throw err;
  }
};

// Get user's favorite articles with pagination
const getUserFavoriteArticles = async (userId, limit = 10, offset = 0) => {
  try {
    const query = `
      SELECT 
        a.id, a.title, a.summary, a.content, a.author_id, a.category_id, 
        a.status, a.published_at, a.created_at, a.updated_at, a.views, a.is_featured
      FROM articles a
      JOIN user_favorites uf ON a.id = uf.article_id
      WHERE uf.user_id = $1 AND a.status = 'published'
      ORDER BY uf.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const values = [userId, limit, offset];
    const result = await executeQuery(query, values);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM user_favorites uf
      JOIN articles a ON uf.article_id = a.id
      WHERE uf.user_id = $1 AND a.status = 'published'
    `;
    const countResult = await executeQuery(countQuery, [userId]);
    const total = parseInt(countResult.rows[0].total, 10);
    
    return {
      articles: result.rows,
      total,
      limit,
      offset
    };
  } catch (err) {
    throw err;
  }
};

// Add article to user's favorites
const addArticleToUserFavorites = async (userId, articleId) => {
  try {
    const query = `
      INSERT INTO user_favorites (user_id, article_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, article_id) 
      DO NOTHING
      RETURNING id, user_id, article_id, created_at
    `;
    
    const values = [userId, articleId];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      // Article was already in favorites
      return { message: 'Article already in favorites' };
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Remove article from user's favorites
const removeArticleFromUserFavorites = async (userId, articleId) => {
  try {
    const query = `
      DELETE FROM user_favorites 
      WHERE user_id = $1 AND article_id = $2
      RETURNING id, user_id, article_id
    `;
    
    const values = [userId, articleId];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      // Article was not in favorites
      return { message: 'Article not in favorites' };
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

export {
  upsertUserProfile,
  getUserProfileByUserId,
  getUserProfileById,
  updateUserPreferences,
  getUserPreferencesByUserId,
  getUserArticles,
  getUserFavoriteArticles,
  addArticleToUserFavorites,
  removeArticleFromUserFavorites
};