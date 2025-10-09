import { pool } from './config/database.js';

const performanceBaseline = async () => {
  try {
    console.log('Starting performance baseline tests...\n');
    
    // Test 1: Simple connection test
    console.log('Test 1: Connection latency');
    const start = Date.now();
    const client = await pool.connect();
    const connectTime = Date.now() - start;
    console.log(`Connection established in ${connectTime}ms\n`);
    
    // Test 2: Simple query performance
    console.log('Test 2: Simple query performance');
    const queryStart = Date.now();
    const result = await client.query('SELECT COUNT(*) as count FROM users');
    const queryTime = Date.now() - queryStart;
    console.log(`Simple query executed in ${queryTime}ms - Count: ${result.rows[0].count}\n`);
    
    // Test 3: Complex join query performance
    console.log('Test 3: Complex query performance');
    const complexQueryStart = Date.now();
    const complexResult = await client.query(`
      SELECT 
        u.name as author_name,
        COUNT(a.id) as article_count,
        COUNT(c.id) as comment_count
      FROM users u
      LEFT JOIN articles a ON u.id = a.author_id
      LEFT JOIN comments c ON u.id = c.author_id
      GROUP BY u.id, u.name
      ORDER BY article_count DESC
      LIMIT 10
    `);
    const complexQueryTime = Date.now() - complexQueryStart;
    console.log(`Complex query executed in ${complexQueryTime}ms`);
    console.log(`Top ${complexResult.rows.length} authors by activity:`);
    complexResult.rows.forEach(row => {
      console.log(`- ${row.author_name}: ${row.article_count} articles, ${row.comment_count} comments`);
    });
    console.log('');
    
    // Test 4: Insert performance
    console.log('Test 4: Insert performance');
    const insertStart = Date.now();
    const insertResult = await client.query(`
      INSERT INTO categories (name, description) 
      VALUES ($1, $2) 
      ON CONFLICT (name) DO NOTHING
      RETURNING id
    `, [`Test Category ${Date.now()}`, 'Temporary category for performance testing']);
    const insertTime = Date.now() - insertStart;
    console.log(`Insert query executed in ${insertTime}ms`);
    
    // Clean up test data
    if (insertResult.rows.length > 0) {
      await client.query('DELETE FROM categories WHERE id = $1', [insertResult.rows[0].id]);
      console.log('Test data cleaned up\n');
    }
    
    client.release();
    
    // Test 5: Connection pool status
    console.log('Test 5: Connection pool status');
    console.log(`Pool total: ${pool.totalCount}`);
    console.log(`Pool idle: ${pool.idleCount}`);
    console.log(`Pool waiting: ${pool.waitingCount}\n`);
    
    console.log('Performance baseline tests completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error during performance baseline tests:', err.stack);
    process.exit(1);
  }
};

performanceBaseline();