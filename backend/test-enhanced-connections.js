import { testConnection } from './enhanced-database.js';
import { executeQuery, executeTransaction, connectionMonitor } from './enhanced-db-utils.js';

const testEnhancedConnections = async () => {
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
    
    // Test transaction execution
    console.log('Testing transaction execution...');
    const transactionQueries = [
      { query: 'SELECT COUNT(*) as count FROM articles', values: [] }
    ];
    const transactionResult = await executeTransaction(transactionQueries);
    console.log(`Article count: ${transactionResult[0].rows[0].count}`);
    
    // Start monitoring
    console.log('Starting connection monitoring...');
    connectionMonitor.startMonitoring(5000); // Monitor every 5 seconds
    
    // Wait a bit to see monitoring in action
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Stop monitoring
    connectionMonitor.stopMonitoring();
    
    console.log('Enhanced connection management test completed successfully');
    process.exit(0);
    
    console.log('Enhanced connection management test completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error testing enhanced connection management:', err.stack);
    process.exit(1);
  }
};

testEnhancedConnections();