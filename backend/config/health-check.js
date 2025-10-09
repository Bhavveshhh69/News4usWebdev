// Database health check
import { pool } from './database.js';
import { executeQuery } from './db-utils.js';

const databaseHealthCheck = async () => {
  try {
    // Test basic connectivity
    const connectionResult = await executeQuery('SELECT NOW() as current_time');
    const currentTime = connectionResult.rows[0].current_time;
    
    // Test table existence
    const tablesResult = await executeQuery(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'articles', 'categories', 'tags', 'article_tags', 'media_assets', 'sessions')
    `);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    const requiredTables = ['users', 'articles', 'categories', 'tags', 'article_tags', 'media_assets', 'sessions'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    // Test connection pool status
    const poolStatus = {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount
    };
    
    return {
      status: 'healthy',
      timestamp: currentTime,
      missingTables,
      poolStatus,
      message: missingTables.length === 0 
        ? 'All database components are healthy' 
        : `Missing tables: ${missingTables.join(', ')}`
    };
  } catch (err) {
    return {
      status: 'unhealthy',
      error: err.message,
      timestamp: new Date().toISOString()
    };
  }
};

export default databaseHealthCheck;