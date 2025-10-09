// Test database health check
import databaseHealthCheck from './config/health-check.js';

const testHealthCheck = async () => {
  try {
    console.log('Running database health check...');
    const result = await databaseHealthCheck();
    
    console.log('Health check result:', JSON.stringify(result, null, 2));
    
    if (result.status === 'healthy') {
      console.log('Database health check passed');
      return true;
    } else {
      console.log('Database health check failed:', result.error);
      return false;
    }
  } catch (err) {
    console.error('Health check test failed:', err.message);
    return false;
  }
};

testHealthCheck().then(success => {
  if (success) {
    console.log('Health check test completed successfully');
    process.exit(0);
  } else {
    console.log('Health check test failed');
    process.exit(1);
  }
});