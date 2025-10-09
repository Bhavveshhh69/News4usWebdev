import { pool } from './config/database.js';

const checkTables = async () => {
  try {
    const client = await pool.connect();
    
    // Get all table names
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('Database tables:');
    result.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('Error checking tables:', err.stack);
    process.exit(1);
  }
};

checkTables();