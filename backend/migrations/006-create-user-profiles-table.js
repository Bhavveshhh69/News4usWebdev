// Migration to create user profiles, preferences, and favorites tables
import { pool } from '../config/database.js';

const createUserProfilesTable = async () => {
  const query = `
    -- Create user_profiles table
    CREATE TABLE IF NOT EXISTS user_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      bio TEXT,
      website VARCHAR(200),
      location VARCHAR(100),
      avatar_url VARCHAR(500),
      social_links JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id)
    );
    
    -- Create user_preferences table
    CREATE TABLE IF NOT EXISTS user_preferences (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      preferences JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id)
    );
    
    -- Create user_favorites table
    CREATE TABLE IF NOT EXISTS user_favorites (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, article_id)
    );
    
    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_favorites_article_id ON user_favorites(article_id);
  `;

  try {
    await pool.query(query);
    console.log('User profiles, preferences, and favorites tables created successfully');
  } catch (err) {
    console.error('Error creating user profiles tables:', err.stack);
    throw err;
  }
};

export default createUserProfilesTable;