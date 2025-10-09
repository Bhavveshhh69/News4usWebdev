// Migration to create YouTube-related tables
import { appUserPool as pool } from '../config/database.js';

const createYouTubeTables = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS youtube_channels (
      id SERIAL PRIMARY KEY,
      external_id VARCHAR(64) UNIQUE,
      name VARCHAR(255) NOT NULL,
      url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS youtube_videos (
      id SERIAL PRIMARY KEY,
      video_id VARCHAR(32) UNIQUE NOT NULL,
      channel_id INTEGER REFERENCES youtube_channels(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      thumbnail_url TEXT,
      published_at TIMESTAMPTZ,
      is_mini_player BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_youtube_videos_published_at ON youtube_videos(published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_youtube_videos_channel_id ON youtube_videos(channel_id);
    CREATE INDEX IF NOT EXISTS idx_youtube_videos_is_mini_true ON youtube_videos(is_mini_player) WHERE is_mini_player = true;

    -- Ensure application role owns the tables for DML privileges and sequence usage
    DO $$ BEGIN
      PERFORM 1 FROM pg_roles WHERE rolname = 'app_user';
      IF FOUND THEN
        ALTER TABLE youtube_channels OWNER TO app_user;
        ALTER TABLE youtube_videos OWNER TO app_user;
      END IF;
    END $$;
  `;

  try {
    await pool.query(query);
    console.log('YouTube tables created successfully');
  } catch (err) {
    console.error('Error creating YouTube tables:', err.stack || err);
    throw err;
  }
};

export default createYouTubeTables;


