// Script to verify audit log table structure
import { executeQuery } from './config/db-utils.js';

const verifyAuditLogTable = async () => {
  try {
    console.log('Checking app_audit_log table structure...');
    
    // Check if table exists
    const tableCheck = await executeQuery(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'app_audit_log'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('❌ app_audit_log table does not exist');
      return false;
    }
    
    console.log('✓ app_audit_log table exists');
    
    // Check table structure
    const columnCheck = await executeQuery(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'app_audit_log'
      ORDER BY ordinal_position
    `);
    
    console.log('\nCurrent table structure:');
    console.log('Column Name\t\tData Type\t\tNullable');
    console.log('--------------------------------------------------------');
    columnCheck.rows.forEach(row => {
      console.log(`${row.column_name}\t\t\t${row.data_type}\t\t${row.is_nullable}`);
    });
    
    // Check if required columns exist
    const requiredColumns = ['id', 'user_id', 'action', 'target_type', 'target_id', 'details', 'created_at', 'ip_address', 'user_agent'];
    const existingColumns = columnCheck.rows.map(row => row.column_name);
    
    console.log('\nRequired columns check:');
    let allColumnsPresent = true;
    requiredColumns.forEach(column => {
      if (existingColumns.includes(column)) {
        console.log(`✓ ${column}`);
      } else {
        console.log(`❌ ${column} (MISSING)`);
        allColumnsPresent = false;
      }
    });
    
    if (allColumnsPresent) {
      console.log('\n✅ All required columns are present');
    } else {
      console.log('\n❌ Some required columns are missing');
    }
    
    return allColumnsPresent;
  } catch (err) {
    console.error('Error verifying audit log table:', err.message);
    return false;
  }
};

// Run the verification
verifyAuditLogTable().then(result => {
  process.exit(result ? 0 : 1);
});