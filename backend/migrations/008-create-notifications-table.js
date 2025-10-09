// Migration to create notifications table
import { pool } from '../config/database.js';

const createNotificationsTable = async () => {
  const query = `
    -- Create notifications table
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      related_id INTEGER,
      related_type VARCHAR(50),
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
    CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
    
    -- Create a function to update the updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';
    
    -- Create a trigger to automatically update updated_at
    DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
    CREATE TRIGGER update_notifications_updated_at 
        BEFORE UPDATE ON notifications 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
  `;

  try {
    await pool.query(query);
    console.log('Notifications table created successfully');
  } catch (err) {
    console.error('Error creating notifications table:', err.stack);
    throw err;
  }
};

export default createNotificationsTable;