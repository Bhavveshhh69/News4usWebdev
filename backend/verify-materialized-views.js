import { executeQuery } from './config/db-utils.js';

const verifyMaterializedViews = async () => {
  try {
    console.log('Verifying materialized views...');
    
    // Check if materialized views exist
    const mvResult = await executeQuery(`
      SELECT matviewname, matviewowner
      FROM pg_matviews 
      WHERE matviewname IN ('article_analytics', 'user_engagement')
      ORDER BY matviewname
    `);
    
    if (mvResult.rows.length === 2) {
      console.log('✓ Both materialized views exist:');
      mvResult.rows.forEach(mv => {
        console.log(`  - ${mv.matviewname} (owner: ${mv.matviewowner})`);
      });
    } else {
      console.log('✗ Materialized views missing or incomplete');
      console.log('Found materialized views:');
      mvResult.rows.forEach(mv => {
        console.log(`  - ${mv.matviewname}`);
      });
    }
    
    // Check if refresh functions exist
    const funcResult = await executeQuery(`
      SELECT proname
      FROM pg_proc 
      WHERE proname IN ('refresh_article_analytics', 'refresh_user_engagement')
      ORDER BY proname
    `);
    
    if (funcResult.rows.length === 2) {
      console.log('✓ Both refresh functions exist:');
      funcResult.rows.forEach(func => {
        console.log(`  - ${func.proname}`);
      });
    } else {
      console.log('✗ Refresh functions missing or incomplete');
      console.log('Found functions:');
      funcResult.rows.forEach(func => {
        console.log(`  - ${func.proname}`);
      });
    }
    
    // Test refreshing the materialized views
    console.log('\nTesting materialized view refresh...');
    await executeQuery('SELECT refresh_article_analytics()');
    console.log('✓ Article analytics refresh function executed');
    
    await executeQuery('SELECT refresh_user_engagement()');
    console.log('✓ User engagement refresh function executed');
    
    console.log('\nMaterialized views verification completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error verifying materialized views:', err.stack);
    process.exit(1);
  }
};

verifyMaterializedViews();