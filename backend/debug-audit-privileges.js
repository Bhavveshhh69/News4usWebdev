// Script to debug audit log table privileges
import { executeQuery } from './config/db-utils.js';

const debugAuditPrivileges = async () => {
  try {
    console.log('Debugging audit log table privileges...\n');
    
    // Check all privileges for audit_user on app_audit_log table
    const privilegesCheck = await executeQuery(`
      SELECT grantee, privilege_type, is_grantable
      FROM information_schema.table_privileges
      WHERE table_name = 'app_audit_log'
      ORDER BY grantee, privilege_type
    `);
    
    console.log('All privileges on app_audit_log table:');
    if (privilegesCheck.rows.length === 0) {
      console.log('No privileges found');
    } else {
      privilegesCheck.rows.forEach(row => {
        console.log(`- ${row.grantee}: ${row.privilege_type} (grantable: ${row.is_grantable})`);
      });
    }
    
    // Check specifically for audit_user
    console.log('\nPrivileges for audit_user only:');
    const auditUserPrivileges = await executeQuery(`
      SELECT grantee, privilege_type, is_grantable
      FROM information_schema.table_privileges
      WHERE table_name = 'app_audit_log' AND grantee = 'audit_user'
    `);
    
    if (auditUserPrivileges.rows.length === 0) {
      console.log('No privileges found for audit_user');
    } else {
      auditUserPrivileges.rows.forEach(row => {
        console.log(`- ${row.privilege_type} (grantable: ${row.is_grantable})`);
      });
    }
    
    // Try to directly check if audit_user can insert
    console.log('\nTesting INSERT privilege for audit_user...');
    try {
      // This is just a test query, it won't actually insert data
      const testQuery = await executeQuery(`
        SELECT has_table_privilege('audit_user', 'app_audit_log', 'INSERT') as has_insert
      `);
      
      console.log(`Audit user has INSERT privilege: ${testQuery.rows[0].has_insert}`);
    } catch (err) {
      console.log('Error testing INSERT privilege:', err.message);
    }
    
  } catch (err) {
    console.error('Error debugging audit privileges:', err.message);
  }
};

// Run the debug
debugAuditPrivileges();