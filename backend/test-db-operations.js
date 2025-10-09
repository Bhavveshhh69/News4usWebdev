// Test database operations
import { executeQuery, executeTransaction } from './config/db-utils.js';

const testDatabaseOperations = async () => {
  try {
    console.log('Testing database operations...');
    
    // Test simple query
    const result = await executeQuery('SELECT NOW() as current_time');
    console.log('Simple query test passed:', result.rows[0]);
    
    // Test transaction
    const transactionQueries = [
      { query: 'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id', 
        values: ['test@example.com', 'hashed_password', 'Test User', 'user'] },
      { query: 'SELECT * FROM users WHERE email = $1', 
        values: ['test@example.com'] }
    ];
    
    const transactionResults = await executeTransaction(transactionQueries);
    console.log('Transaction test passed, user ID:', transactionResults[0].rows[0].id);
    
    // Clean up test user
    await executeQuery('DELETE FROM users WHERE email = $1', ['test@example.com']);
    console.log('Test user cleaned up');
    
    console.log('All database operation tests passed');
    return true;
  } catch (err) {
    console.error('Database operation test failed:', err.message);
    return false;
  }
};

testDatabaseOperations().then(success => {
  if (success) {
    console.log('Database operations test completed successfully');
    process.exit(0);
  } else {
    console.log('Database operations test failed');
    process.exit(1);
  }
});