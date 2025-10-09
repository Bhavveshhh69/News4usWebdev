// Migration to create additional indexes for admin dashboard performance
import { pool } from '../config/database.js';

const createAdminIndexes = async () => {
  const query = `
    -- Add indexes to improve admin dashboard query performance
    
    -- Index on users table for active status filtering
    CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
    
    -- Composite index for users filtering by role and active status
    CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, is_active);
    
    -- Index on articles table for created_at for recent activity
    CREATE INDEX IF NOT EXISTS idx_articles_created_at_desc ON articles(created_at DESC);
    
    -- Index on comments table for created_at for recent activity
    CREATE INDEX IF NOT EXISTS idx_comments_created_at_desc ON comments(created_at DESC);
    
    -- Index on users table for name search
    CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
    
    -- Index on articles table for title search
    CREATE INDEX IF NOT EXISTS idx_articles_title ON articles(title);
  `;

  try {
    await pool.query(query);
    console.log('Admin indexes created successfully');
  } catch (err) {
    console.error('Error creating admin indexes:', err.stack);
    throw err;
  }
};

export default createAdminIndexes;