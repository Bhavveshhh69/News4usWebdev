// Test script for articles API
import { appUserPool } from './config/database.js';

async function testArticlesAPI() {
  try {
    // Test getting articles from database directly
    const result = await appUserPool.query('SELECT * FROM articles LIMIT 5');
    console.log('Articles in database:');
    console.log(result.rows);
    
    // Test categories
    const categories = await appUserPool.query('SELECT * FROM categories');
    console.log('\nCategories:');
    console.log(categories.rows);
    
    // Test tags
    const tags = await appUserPool.query('SELECT * FROM tags');
    console.log('\nTags:');
    console.log(tags.rows);
    
    appUserPool.end();
  } catch (error) {
    console.error('Error testing articles API:', error.message);
  }
}

testArticlesAPI();