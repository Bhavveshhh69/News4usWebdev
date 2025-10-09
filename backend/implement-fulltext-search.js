import { executeQuery } from './config/db-utils.js';
import fs from 'fs';
import path from 'path';

const implementFullTextSearch = async () => {
  try {
    console.log('Implementing full-text search and advanced indexing...');
    
    // Read and execute the SQL file
    const sql = fs.readFileSync(path.join(process.cwd(), 'implement-fulltext-search.sql'), 'utf8');
    
    // Execute the entire file as one statement
    await executeQuery(sql);
    
    console.log('Full-text search and advanced indexing implemented successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error implementing full-text search and advanced indexing:', err.stack);
    process.exit(1);
  }
};

implementFullTextSearch();