// Script to test audit user connection and privileges
import pkg from 'pg';
const { Pool } = pkg;

// Create a direct connection pool for audit user
const auditUserPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'news_db',
  user: 'audit_user',
  password: 'strong_audit_password_123',
  ssl: false,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const testAuditUser = async () => {
  try {
    console.log('Testing audit user connection...');
    
    // Test connection
    const client = await auditUserPool.connect();
    console.log('✅ Audit user connection successful');
    
    // Test INSERT privilege
    try {
      const result = await client.query(
        'INSERT INTO app_audit_log (user_id, action, details) VALUES ($1, $2, $3) RETURNING id',
        [1, 'test', JSON.stringify({test: 'data'})]
      );
      console.log(`✅ Audit user INSERT successful: audit log entry ${result.rows[0].id}`);
    } catch (err) {
      console.log('❌ Audit user INSERT failed:', err.message);
      return false;
    } finally {
      client.release();
    }
    
    // Clean up
    await auditUserPool.end();
    
    return true;
  } catch (err) {
    console.error('Error testing audit user:', err.message);
    return false;
  }
};

// Run the test
testAuditUser().then(result => {
  process.exit(result ? 0 : 1);
});