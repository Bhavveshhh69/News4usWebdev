import { executeQuery } from './config/db-utils.js';
import fs from 'fs';
import path from 'path';

const createMaterializedViews = async () => {
  try {
    console.log('Creating materialized views...');
    
    // Read and execute the SQL file
    const sql = fs.readFileSync(path.join(process.cwd(), 'create-materialized-views.sql'), 'utf8');
    
    // Execute the entire file as one statement
    await executeQuery(sql);
    
    console.log('Materialized views created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error creating materialized views:', err.stack);
    process.exit(1);
  }
};

createMaterializedViews();