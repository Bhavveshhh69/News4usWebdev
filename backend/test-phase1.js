// Comprehensive test for Phase 1 implementation
import dotenv from 'dotenv';
dotenv.config();

import { testConnection } from './config/database.js';
import databaseHealthCheck from './config/health-check.js';
import validateEnvironment from './config/validate-env.js';

const runPhase1Tests = async () => {
  console.log('=== Phase 1 Implementation Tests ===\n');
  
  try {
    // Test 1: Environment validation
    console.log('1. Testing environment validation...');
    const envResult = validateEnvironment();
    if (!envResult.isValid) {
      throw new Error(`Environment validation failed. Missing: ${envResult.missingVars.join(', ')}`);
    }
    console.log('   ✓ Environment validation passed\n');
    
    // Test 2: Database connection
    console.log('2. Testing database connection...');
    const connectionSuccess = await testConnection();
    if (!connectionSuccess) {
      throw new Error('Database connection failed');
    }
    console.log('   ✓ Database connection successful\n');
    
    // Test 3: Database operations
    console.log('3. Testing database operations...');
    const { executeQuery } = await import('./config/db-utils.js');
    
    // Test simple query
    const result = await executeQuery('SELECT NOW() as current_time');
    console.log('   ✓ Simple query test passed:', result.rows[0].current_time);
    
    // Test 4: Health check
    console.log('4. Testing database health check...');
    const healthResult = await databaseHealthCheck();
    if (healthResult.status !== 'healthy') {
      throw new Error(`Health check failed: ${healthResult.error}`);
    }
    console.log('   ✓ Database health check passed');
    console.log('   ✓ Missing tables:', healthResult.missingTables.length === 0 ? 'None' : healthResult.missingTables.join(', '));
    console.log('   ✓ Pool status - Total:', healthResult.poolStatus.total, 'Idle:', healthResult.poolStatus.idle, 'Waiting:', healthResult.poolStatus.waiting);
    console.log('   ✓', healthResult.message, '\n');
    
    // Test 5: Table existence
    console.log('5. Testing required tables existence...');
    const tablesResult = await executeQuery(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'articles', 'categories', 'tags', 'article_tags', 'media_assets', 'sessions')
    `);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    const requiredTables = ['users', 'articles', 'categories', 'tags', 'article_tags', 'media_assets', 'sessions'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      throw new Error(`Missing required tables: ${missingTables.join(', ')}`);
    }
    console.log('   ✓ All required tables exist:', existingTables.join(', '), '\n');
    
    console.log('=== All Phase 1 tests passed successfully! ===');
    return true;
    
  } catch (err) {
    console.error('Phase 1 tests failed:', err.message);
    return false;
  }
};

runPhase1Tests().then(success => {
  if (success) {
    console.log('\n🎉 Phase 1 implementation is complete and verified!');
    process.exit(0);
  } else {
    console.log('\n❌ Phase 1 implementation has issues that need to be addressed.');
    process.exit(1);
  }
});