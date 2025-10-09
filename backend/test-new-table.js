// Test script to check if audit user can insert into a completely new table
import pkg from 'pg';
const { Client } = pkg;

const testNewTable = async () => {
  try {
    console.log('Testing audit user with a completely new table...');
    
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
    
    // Drop the test table if it exists
    try {
      await superClient.query('DROP TABLE IF EXISTS audit_test_table');
      console.log('✅ Dropped existing test table');
    } catch (err) {
      console.log('Note: Error dropping test table:', err.message);
    }
    
    // Create a completely new test table
    await superClient.query(`
      CREATE TABLE audit_test_table (
        id SERIAL PRIMARY KEY,
        data TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ New test table created');
    
    // Grant INSERT privilege to audit_user
    await superClient.query('GRANT INSERT ON audit_test_table TO audit_user');
    console.log('✅ Granted INSERT privilege on new test table to audit_user');
    
    // Grant USAGE on sequence
    await superClient.query('GRANT USAGE ON SEQUENCE audit_test_table_id_seq TO audit_user');
    console.log('✅ Granted USAGE privilege on sequence to audit_user');
    
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
    
    // Try to insert into the new test table
    try {
      const result = await auditClient.query(`
        INSERT INTO audit_test_table (data) 
        VALUES ('test data') 
        RETURNING id
      `);
      console.log(`✅ INSERT into new test table successful, new entry ID: ${result.rows[0].id}`);
    } catch (err) {
      console.log('❌ INSERT into new test table failed:', err.message);
      console.log('Error code:', err.code);
    }
    
    await auditClient.end();
    console.log('✅ Audit user connection closed');
    
    return true;
  } catch (err) {
    console.error('Error testing new table:', err.message);
    return false;
  }
};

testNewTable().then(result => {
  process.exit(result ? 0 : 1);
});