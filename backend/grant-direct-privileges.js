// Script to directly grant privileges on the specific table
import pkg from 'pg';
const { Client } = pkg;

const grantDirectPrivileges = async () => {
  try {
    console.log('Directly granting privileges on specific tables...');
    
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
    
    // Grant INSERT privilege on app_audit_log directly
    await client.query('GRANT INSERT ON app_audit_log TO audit_user');
    console.log('✅ Granted INSERT privilege on app_audit_log directly to audit_user');
    
    // Grant USAGE on sequence directly
    await client.query('GRANT USAGE ON SEQUENCE app_audit_log_id_seq TO audit_user');
    console.log('✅ Granted USAGE privilege on sequence directly to audit_user');
    
    // Grant INSERT privilege on audit_fix_test_table directly
    await client.query('GRANT INSERT ON audit_fix_test_table TO audit_user');
    console.log('✅ Granted INSERT privilege on audit_fix_test_table directly to audit_user');
    
    // Grant USAGE on sequence directly
    await client.query('GRANT USAGE ON SEQUENCE audit_fix_test_table_id_seq TO audit_user');
    console.log('✅ Granted USAGE privilege on sequence directly to audit_user');
    
    await client.end();
    console.log('✅ Superuser connection closed');
    
    return true;
  } catch (err) {
    console.error('Error granting direct privileges:', err.message);
    return false;
  }
};

grantDirectPrivileges().then(result => {
  process.exit(result ? 0 : 1);
});