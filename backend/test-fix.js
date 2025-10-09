// Test script to check if the fix works
import pkg from 'pg';
const { Client } = pkg;

const testFix = async () => {
  try {
    console.log('Testing if the fix works...');
    
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
      await superClient.query('DROP TABLE IF EXISTS audit_fix_test_table');
      console.log('✅ Dropped existing test table');
    } catch (err) {
      console.log('Note: Error dropping test table:', err.message);
    }
    
    // Create a new test table (this should inherit the default ACLs)
    await superClient.query(`
      CREATE TABLE audit_fix_test_table (
        id SERIAL PRIMARY KEY,
        data TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ New test table created (should inherit default ACLs)');
    
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
        INSERT INTO audit_fix_test_table (data) 
        VALUES ('test data after fix') 
        RETURNING id
      `);
      console.log(`✅ INSERT into new test table successful after fix, new entry ID: ${result.rows[0].id}`);
    } catch (err) {
      console.log('❌ INSERT into new test table failed after fix:', err.message);
      console.log('Error code:', err.code);
    }
    
    await auditClient.end();
    console.log('✅ Audit user connection closed');
    
    return true;
  } catch (err) {
    console.error('Error testing fix:', err.message);
    return false;
  }
};

testFix().then(result => {
  process.exit(result ? 0 : 1);
});