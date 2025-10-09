import { testConnections } from './config/database.js';

// Test the database connection
testConnections().then(success => {
  if (success) {
    console.log('Database connection test passed');
    process.exit(0);
  } else {
    console.log('Database connection test failed');
    process.exit(1);
  }
});