// Script to grant audit log table privileges to audit_user
import { executeQuery } from './config/db-utils.js';

const grantAuditPrivileges = async () => {
  try {
    console.log('Granting INSERT privilege on app_audit_log table to audit_user...');
    
    // Grant INSERT privilege to audit_user
    await executeQuery(`
      GRANT INSERT ON app_audit_log TO audit_user
    `);
    
    console.log('✅ INSERT privilege granted to audit_user');
    
    // Also grant USAGE on the sequence for the id column
    await executeQuery(`
      GRANT USAGE ON SEQUENCE app_audit_log_id_seq TO audit_user
    `);
    
    console.log('✅ USAGE privilege on sequence granted to audit_user');
    
    return true;
  } catch (err) {
    console.error('Error granting audit privileges:', err.message);
    return false;
  }
};

// Run the privilege granting
grantAuditPrivileges().then(result => {
  process.exit(result ? 0 : 1);
});