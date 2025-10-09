// Migration to create comments table
import { pool } from '../config/database.js';

const createCommentsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
      parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
      is_deleted BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Add comment_count column to articles table
    ALTER TABLE articles 
    ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;
    
    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id);
    CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
    CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
    CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
  `;

  try {
    await pool.query(query);
    console.log('Comments table created successfully');
  } catch (err) {
    console.error('Error creating comments table:', err.stack);
    throw err;
  }
};

export default createCommentsTable;