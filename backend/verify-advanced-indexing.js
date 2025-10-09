import { executeQuery } from './config/db-utils.js';

const verifyAdvancedIndexing = async () => {
  try {
    console.log('Verifying advanced indexing...');
    
    // Check if searchable column exists
    const columnResult = await executeQuery(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'articles' AND column_name = 'searchable'
    `);
    
    if (columnResult.rows.length > 0) {
      console.log('✓ Searchable column exists:', columnResult.rows[0]);
    } else {
      console.log('✗ Searchable column does not exist');
    }
    
    // Check if full-text search index exists
    const indexResult = await executeQuery(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'articles' AND indexname = 'idx_articles_searchable'
    `);
    
    if (indexResult.rows.length > 0) {
      console.log('✓ Full-text search index exists');
    } else {
      console.log('✗ Full-text search index does not exist');
    }
    
    // Check if update function exists
    const funcResult = await executeQuery(`
      SELECT proname
      FROM pg_proc
      WHERE proname = 'update_article_searchable'
    `);
    
    if (funcResult.rows.length > 0) {
      console.log('✓ Update function exists');
    } else {
      console.log('✗ Update function does not exist');
    }
    
    // Check if trigger exists
    const triggerResult = await executeQuery(`
      SELECT tgname
      FROM pg_trigger
      WHERE tgname = 'update_article_searchable_trigger'
    `);
    
    if (triggerResult.rows.length > 0) {
      console.log('✓ Update trigger exists');
    } else {
      console.log('✗ Update trigger does not exist');
    }
    
    // Test full-text search
    console.log('\nTesting full-text search...');
    const searchResult = await executeQuery(`
      SELECT id, title
      FROM articles
      WHERE searchable @@ to_tsquery('english', 'test')
      LIMIT 5
    `);
    
    console.log(`Found ${searchResult.rows.length} articles matching 'test'`);
    searchResult.rows.forEach(row => {
      console.log(`- ${row.id}: ${row.title}`);
    });
    
    // Check other indexes
    console.log('\nChecking other advanced indexes...');
    const otherIndexes = [
      'idx_users_active_email',
      'idx_articles_published',
      'idx_articles_author_status_covering',
      'idx_users_auth_covering',
      'idx_user_profiles_social_links',
      'idx_user_preferences_data'
    ];
    
    for (const indexName of otherIndexes) {
      const result = await executeQuery(`
        SELECT indexname
        FROM pg_indexes
        WHERE indexname = $1
      `, [indexName]);
      
      if (result.rows.length > 0) {
        console.log(`✓ ${indexName} exists`);
      } else {
        console.log(`✗ ${indexName} does not exist`);
      }
    }
    
    console.log('\nAdvanced indexing verification completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error verifying advanced indexing:', err.stack);
    process.exit(1);
  }
};

verifyAdvancedIndexing();