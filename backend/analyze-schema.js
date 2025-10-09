import { pool } from './config/database.js';

const analyzeSchema = async () => {
  try {
    const client = await pool.connect();
    
    // Get all table names
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('# Current Database Schema\n');
    
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      console.log(`## ${tableName}\n`);
      
      // Get column information
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
      
      console.log('| Column | Type | Nullable | Default |');
      console.log('|--------|------|----------|---------|');
      columnsResult.rows.forEach(column => {
        console.log(`| ${column.column_name} | ${column.data_type} | ${column.is_nullable} | ${column.column_default || ''} |`);
      });
      
      // Get index information
      const indexesResult = await client.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = $1
      `, [tableName]);
      
      if (indexesResult.rows.length > 0) {
        console.log('\n**Indexes:**');
        indexesResult.rows.forEach(index => {
          console.log(`- ${index.indexname}: ${index.indexdef}`);
        });
      }
      
      console.log('\n---\n');
    }
    
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('Error analyzing schema:', err.stack);
    process.exit(1);
  }
};

analyzeSchema();