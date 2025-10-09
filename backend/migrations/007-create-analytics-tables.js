// Migration to create analytics tables
import { pool } from '../config/database.js';

const createAnalyticsTables = async () => {
  const query = `
    -- Create article_views table for detailed view tracking
    CREATE TABLE IF NOT EXISTS article_views (
      id SERIAL PRIMARY KEY,
      article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_article_views_article_id ON article_views(article_id);
    CREATE INDEX IF NOT EXISTS idx_article_views_user_id ON article_views(user_id);
    CREATE INDEX IF NOT EXISTS idx_article_views_created_at ON article_views(created_at);
    
    -- Add indexes to existing tables for analytics
    CREATE INDEX IF NOT EXISTS idx_articles_views ON articles(views);
    CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);
    CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
    CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
  `;

  try {
    await pool.query(query);
    console.log('Analytics tables created successfully');
  } catch (err) {
    console.error('Error creating analytics tables:', err.stack);
    throw err;
  }
};

export default createAnalyticsTables;