import { testConnection } from './enhanced-database.js';
import { executeQuery } from './enhanced-db-utils.js';

const simpleConnectionTest = async () => {
  try {
    console.log('Testing enhanced connection management...');
    
    // Test database connections
    console.log('Testing database connections...');
    const connectionSuccess = await testConnection();
    
    if (!connectionSuccess) {
      console.error('Database connection test failed');
      process.exit(1);
    }
    
    console.log('Database connections successful');
    
    // Test query execution
    console.log('Testing query execution...');
    const queryResult = await executeQuery('SELECT COUNT(*) as count FROM users', [], 'read');
    console.log(`User count: ${queryResult.rows[0].count}`);
    
    console.log('Enhanced connection management test completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error testing enhanced connection management:', err.stack);
    process.exit(1);
  }
};

simpleConnectionTest();