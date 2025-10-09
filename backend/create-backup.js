import { pool } from './config/database.js';
import fs from 'fs';

const createBackup = async () => {
  try {
    console.log('Creating database backup...');
    
    const client = await pool.connect();
    
    // Get all table names
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    
    let backupSql = `-- Database backup created on ${new Date().toISOString()}\n\n`;
    
    // Backup each table structure and data
    for (const table of tables) {
      console.log(`Backing up table: ${table}`);
      
      // Get table structure
      const structureResult = await client.query(`
        SELECT 'CREATE TABLE ' || table_name || ' (' || 
               string_agg(column_name || ' ' || data_type || 
               CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
               CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END, 
               ', ') || 
               ');' as create_statement
        FROM information_schema.columns 
        WHERE table_name = $1 
        GROUP BY table_name
      `, [table]);
      
      if (structureResult.rows.length > 0) {
        backupSql += structureResult.rows[0].create_statement + '\n';
      }
      
      // Get table data
      const dataResult = await client.query(`SELECT * FROM ${table}`);
      
      if (dataResult.rows.length > 0) {
        // Generate INSERT statements
        const columns = Object.keys(dataResult.rows[0]);
        backupSql += `\n-- Data for table ${table}\n`;
        
        for (const row of dataResult.rows) {
          const values = columns.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
            return value;
          });
          
          backupSql += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
      }
      
      backupSql += '\n';
    }
    
    client.release();
    
    // Write backup to file
    fs.writeFileSync('../backup_before_security_enhancements.sql', backupSql);
    console.log('Database backup created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error creating backup:', err.stack);
    process.exit(1);
  }
};

createBackup();