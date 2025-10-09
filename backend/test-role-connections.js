// Script to test role-based database connections
import { testConnections } from './config/database.js';

// Test the role-based connections
testConnections().then(success => {
  if (success) {
    console.log('✅ All role-based database connections successful');
    process.exit(0);
  } else {
    console.log('❌ Some role-based database connections failed');
    process.exit(1);
  }
});