// Script to grant audit log table privileges to audit_user using superuser connection
import pkg from 'pg';
const { Pool } = pkg;

// Create a connection pool with superuser privileges
const superUserPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'news_db',
  user: 'postgres',
  password: 'Bhavv@1127',
  ssl: false,
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const grantAuditPrivilegesSuperuser = async () => {
  try {
    console.log('Granting INSERT privilege on app_audit_log table to audit_user using superuser connection...');
    
    const client = await superUserPool.connect();
    try {
      // Grant INSERT privilege to audit_user
      await client.query(`
        GRANT INSERT ON app_audit_log TO audit_user
      `);
      
      console.log('✅ INSERT privilege granted to audit_user');
      
      // Also grant USAGE on the sequence for the id column
      await client.query(`
        GRANT USAGE ON SEQUENCE app_audit_log_id_seq TO audit_user
      `);
      
      console.log('✅ USAGE privilege on sequence granted to audit_user');
      
      // Verify the privileges
      const verifyResult = await client.query(`
        SELECT has_table_privilege('audit_user', 'app_audit_log', 'INSERT') as has_insert
      `);
      
      if (verifyResult.rows[0].has_insert) {
        console.log('✅ Verified: audit_user has INSERT privilege on app_audit_log');
      } else {
        console.log('❌ Verification failed: audit_user does not have INSERT privilege on app_audit_log');
        return false;
      }
      
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error granting audit privileges:', err.message);
    return false;
  } finally {
    await superUserPool.end();
  }
};

// Run the privilege granting
grantAuditPrivilegesSuperuser().then(result => {
  process.exit(result ? 0 : 1);
});