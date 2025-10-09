// Migration to create media assets table
import { pool } from '../config/database.js';

const createMediaTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS media_assets (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      size INTEGER NOT NULL,
      path VARCHAR(500) NOT NULL,
      url VARCHAR(500),
      alt_text TEXT,
      caption TEXT,
      uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_media_filename ON media_assets(filename);
    CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media_assets(uploaded_by);
  `;

  try {
    await pool.query(query);
    console.log('Media assets table created successfully');
  } catch (err) {
    console.error('Error creating media assets table:', err.stack);
    throw err;
  }
};

export default createMediaTable;