// Script to verify audit log table privileges
import { executeQuery } from './config/db-utils.js';

const verifyAuditPrivileges = async () => {
  try {
    console.log('Checking audit log table privileges...');
    
    // Check privileges for audit_user on app_audit_log table
    const privilegesCheck = await executeQuery(`
      SELECT grantee, privilege_type
      FROM information_schema.table_privileges
      WHERE table_name = 'app_audit_log' AND grantee = 'audit_user'
    `);
    
    console.log('\nPrivileges for audit_user on app_audit_log table:');
    if (privilegesCheck.rows.length === 0) {
      console.log('❌ No privileges found for audit_user');
      return false;
    }
    
    privilegesCheck.rows.forEach(row => {
      console.log(`✓ ${row.privilege_type}`);
    });
    
    // Check if INSERT privilege exists
    const insertPrivilege = privilegesCheck.rows.find(row => row.privilege_type === 'INSERT');
    if (insertPrivilege) {
      console.log('\n✅ INSERT privilege is granted to audit_user');
      return true;
    } else {
      console.log('\n❌ INSERT privilege is NOT granted to audit_user');
      return false;
    }
  } catch (err) {
    console.error('Error verifying audit privileges:', err.message);
    return false;
  }
};

// Run the verification
verifyAuditPrivileges().then(result => {
  process.exit(result ? 0 : 1);
});