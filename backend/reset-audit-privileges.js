// Script to reset audit log table privileges using superuser connection
import pkg from 'pg';
const { Client } = pkg;

const resetAuditPrivileges = async () => {
  try {
    console.log('Resetting audit log table privileges using superuser connection...');
    
    // Create a direct client connection with superuser privileges
    const client = new Client({
      host: 'localhost',
      port: 5432,
      database: 'news_db',
      user: 'postgres',
      password: 'Bhavv@1127',
      ssl: false
    });
    
    await client.connect();
    console.log('✅ Superuser connected successfully');
    
    // Revoke any existing privileges
    try {
      await client.query('REVOKE ALL PRIVILEGES ON TABLE app_audit_log FROM audit_user');
      console.log('✅ Revoked existing privileges from audit_user');
    } catch (err) {
      console.log('Note: No existing privileges to revoke or error revoking:', err.message);
    }
    
    // Grant the necessary privileges
    await client.query('GRANT INSERT ON app_audit_log TO audit_user');
    console.log('✅ Granted INSERT privilege to audit_user');
    
    await client.query('GRANT USAGE ON SEQUENCE app_audit_log_id_seq TO audit_user');
    console.log('✅ Granted USAGE privilege on sequence to audit_user');
    
    // Verify the privileges
    const verifyResult = await client.query(`
      SELECT has_table_privilege('audit_user', 'app_audit_log', 'INSERT') as has_insert
    `);
    
    if (verifyResult.rows[0].has_insert) {
      console.log('✅ Verified: audit_user has INSERT privilege on app_audit_log');
    } else {
      console.log('❌ Verification failed: audit_user does not have INSERT privilege on app_audit_log');
    }
    
    await client.end();
    console.log('✅ Superuser connection closed');
    
    return true;
  } catch (err) {
    console.error('Error resetting audit privileges:', err.message);
    return false;
  }
};

resetAuditPrivileges().then(result => {
  process.exit(result ? 0 : 1);
});