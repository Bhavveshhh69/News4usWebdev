// Script to alter the existing audit user with proper privileges
import pkg from 'pg';
const { Client } = pkg;

const alterAuditUser = async () => {
  try {
    console.log('Altering existing audit user with proper privileges...');
    
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
    
    // Alter the audit user password
    await client.query("ALTER ROLE audit_user WITH LOGIN PASSWORD 'strong_audit_password_123'");
    console.log('✅ Altered audit_user password');
    
    // Revoke any existing privileges
    try {
      await client.query('REVOKE ALL PRIVILEGES ON TABLE app_audit_log FROM audit_user');
      console.log('✅ Revoked existing privileges from audit_user');
    } catch (err) {
      console.log('Note: No existing privileges to revoke or error revoking:', err.message);
    }
    
    // Revoke sequence privileges
    try {
      await client.query('REVOKE ALL PRIVILEGES ON SEQUENCE app_audit_log_id_seq FROM audit_user');
      console.log('✅ Revoked existing sequence privileges from audit_user');
    } catch (err) {
      console.log('Note: No existing sequence privileges to revoke or error revoking:', err.message);
    }
    
    // Grant basic privileges
    await client.query('GRANT USAGE ON SCHEMA public TO audit_user');
    console.log('✅ Granted USAGE on schema to audit_user');
    
    // Grant INSERT privilege on app_audit_log
    await client.query('GRANT INSERT ON app_audit_log TO audit_user');
    console.log('✅ Granted INSERT privilege on app_audit_log to audit_user');
    
    // Grant USAGE on sequence
    await client.query('GRANT USAGE ON SEQUENCE app_audit_log_id_seq TO audit_user');
    console.log('✅ Granted USAGE privilege on sequence to audit_user');
    
    await client.end();
    console.log('✅ Superuser connection closed');
    
    return true;
  } catch (err) {
    console.error('Error altering audit user:', err.message);
    return false;
  }
};

alterAuditUser().then(result => {
  process.exit(result ? 0 : 1);
});