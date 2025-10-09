import createUsersTable from './001-create-users-table.js';
import createArticlesTable from './002-create-articles-table.js';
import createMediaTable from './003-create-media-table.js';
import createSessionsTable from './004-create-sessions-table.js';
import createCommentsTable from './005-create-comments-table.js';
import createUserProfilesTable from './006-create-user-profiles-table.js';
import createAnalyticsTables from './007-create-analytics-tables.js';
import createNotificationsTable from './008-create-notifications-table.js';
import createAdminIndexes from './009-create-admin-indexes.js';
import createYouTubeTables from './011-create-youtube-tables.js';

const runMigrations = async () => {
  try {
    console.log('Running migrations...');
    
    // Run users table migration
    await createUsersTable();
    console.log('Migration 001 completed successfully');
    
    // Run articles table migration
    await createArticlesTable();
    console.log('Migration 002 completed successfully');
    
    // Run media table migration
    await createMediaTable();
    console.log('Migration 003 completed successfully');
    
    // Run sessions table migration
    await createSessionsTable();
    console.log('Migration 004 completed successfully');
    
    // Run comments table migration
    await createCommentsTable();
    console.log('Migration 005 completed successfully');
    
    // Run user profiles tables migration
    await createUserProfilesTable();
    console.log('Migration 006 completed successfully');
    
    // Run analytics tables migration
    await createAnalyticsTables();
    console.log('Migration 007 completed successfully');
    
    // Run notifications table migration
    await createNotificationsTable();
    console.log('Migration 008 completed successfully');
    
    // Run admin indexes migration
    await createAdminIndexes();
    console.log('Migration 009 completed successfully');
    
    // Run YouTube tables migration
    await createYouTubeTables();
    console.log('Migration 011 completed successfully');

    console.log('All migrations completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
};

runMigrations();