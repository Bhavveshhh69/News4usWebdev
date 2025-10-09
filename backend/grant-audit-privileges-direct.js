// Script to grant audit log table privileges to audit_user directly
import { executeQuery } from './config/db-utils.js';

const grantAuditPrivilegesDirect = async () => {
  try {
    console.log('Granting INSERT privilege on app_audit_log table to audit_user directly...');
    
    // Grant INSERT privilege to audit_user using the default connection (which should have admin privileges)
    await executeQuery(`
      GRANT INSERT ON app_audit_log TO audit_user
    `);
    
    console.log('✅ INSERT privilege granted to audit_user');
    
    // Also grant USAGE on the sequence for the id column
    await executeQuery(`
      GRANT USAGE ON SEQUENCE app_audit_log_id_seq TO audit_user
    `);
    
    console.log('✅ USAGE privilege on sequence granted to audit_user');
    
    // Verify the privileges
    const verifyResult = await executeQuery(`
      SELECT has_table_privilege('audit_user', 'app_audit_log', 'INSERT') as has_insert
    `);
    
    if (verifyResult.rows[0].has_insert) {
      console.log('✅ Verified: audit_user has INSERT privilege on app_audit_log');
    } else {
      console.log('❌ Verification failed: audit_user does not have INSERT privilege on app_audit_log');
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error granting audit privileges:', err.message);
    return false;
  }
};

// Run the privilege granting
grantAuditPrivilegesDirect().then(result => {
  process.exit(result ? 0 : 1);
});