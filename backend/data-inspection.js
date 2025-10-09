import { pool } from './config/database.js';

const inspectData = async () => {
  try {
    const client = await pool.connect();
    
    console.log('# Current Data Inspection\n');
    
    // Check row counts for all tables
    const tables = [
      'users', 'categories', 'tags', 'articles', 'article_tags', 
      'media_assets', 'sessions', 'comments', 'user_profiles', 
      'user_preferences', 'user_favorites', 'article_views', 'notifications'
    ];
    
    console.log('## Row Counts\n');
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`${table}: ${result.rows[0].count} rows`);
      } catch (err) {
        console.log(`${table}: Error - ${err.message}`);
      }
    }
    
    console.log('\n## Sample Data\n');
    
    // Show sample users
    console.log('### Sample Users');
    const usersResult = await client.query('SELECT id, email, name, role, created_at FROM users LIMIT 3');
    usersResult.rows.forEach(user => {
      console.log(`- ${user.id}: ${user.name} (${user.email}) - ${user.role}`);
    });
    
    // Show sample articles
    console.log('\n### Sample Articles');
    const articlesResult = await client.query('SELECT id, title, status, created_at FROM articles LIMIT 3');
    articlesResult.rows.forEach(article => {
      console.log(`- ${article.id}: ${article.title} (${article.status})`);
    });
    
    // Show sample categories
    console.log('\n### Sample Categories');
    const categoriesResult = await client.query('SELECT id, name FROM categories LIMIT 5');
    categoriesResult.rows.forEach(category => {
      console.log(`- ${category.id}: ${category.name}`);
    });
    
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('Error inspecting data:', err.stack);
    process.exit(1);
  }
};

inspectData();