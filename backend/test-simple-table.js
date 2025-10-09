// Test script to check if audit user can insert into a simple table
import pkg from 'pg';
const { Client } = pkg;

const testSimpleTable = async () => {
  try {
    console.log('Testing audit user with a simple table...');
    
    // Create a direct client connection with superuser privileges
    const superClient = new Client({
      host: 'localhost',
      port: 5432,
      database: 'news_db',
      user: 'postgres',
      password: 'Bhavv@1127',
      ssl: false
    });
    
    await superClient.connect();
    console.log('✅ Superuser connected successfully');
    
    // Create a simple test table
    await superClient.query(`
      CREATE TABLE IF NOT EXISTS test_audit_table (
        id SERIAL PRIMARY KEY,
        data TEXT
      )
    `);
    console.log('✅ Test table created');
    
    // Grant INSERT privilege to audit_user
    await superClient.query('GRANT INSERT ON test_audit_table TO audit_user');
    console.log('✅ Granted INSERT privilege on test table to audit_user');
    
    await superClient.end();
    console.log('✅ Superuser connection closed');
    
    // Now test with audit user
    const auditClient = new Client({
      host: 'localhost',
      port: 5432,
      database: 'news_db',
      user: 'audit_user',
      password: 'strong_audit_password_123',
      ssl: false
    });
    
    await auditClient.connect();
    console.log('✅ Audit user connected successfully');
    
    // Try to insert into the test table
    try {
      const result = await auditClient.query(`
        INSERT INTO test_audit_table (data) 
        VALUES ('test data') 
        RETURNING id
      `);
      console.log(`✅ INSERT into test table successful, new entry ID: ${result.rows[0].id}`);
    } catch (err) {
      console.log('❌ INSERT into test table failed:', err.message);
    }
    
    await auditClient.end();
    console.log('✅ Audit user connection closed');
    
    return true;
  } catch (err) {
    console.error('Error testing simple table:', err.message);
    return false;
  }
};

testSimpleTable().then(result => {
  process.exit(result ? 0 : 1);
});