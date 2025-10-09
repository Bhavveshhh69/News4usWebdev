// Script to recreate the audit user with proper privileges
import pkg from 'pg';
const { Client } = pkg;

const recreateAuditUser = async () => {
  try {
    console.log('Recreating audit user with proper privileges...');
    
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
    
    // Drop the existing audit user (if it exists)
    try {
      await client.query('DROP ROLE IF EXISTS audit_user');
      console.log('✅ Dropped existing audit_user role');
    } catch (err) {
      console.log('Note: Error dropping audit_user role:', err.message);
    }
    
    // Create the audit user
    await client.query("CREATE ROLE audit_user WITH LOGIN PASSWORD 'strong_audit_password_123'");
    console.log('✅ Created audit_user role');
    
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
    console.error('Error recreating audit user:', err.message);
    return false;
  }
};

recreateAuditUser().then(result => {
  process.exit(result ? 0 : 1);
});