// Test script to check if a completely new user can insert into a table
import pkg from 'pg';
const { Client } = pkg;

const testNewUser = async () => {
  try {
    console.log('Testing with a completely new user...');
    
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
    
    // Drop the test user if it exists
    try {
      await superClient.query('DROP ROLE IF EXISTS test_user');
      console.log('✅ Dropped existing test user');
    } catch (err) {
      console.log('Note: Error dropping test user:', err.message);
    }
    
    // Create a completely new test user
    await superClient.query("CREATE ROLE test_user WITH LOGIN PASSWORD 'test_password_123'");
    console.log('✅ New test user created');
    
    // Grant basic privileges
    await superClient.query('GRANT USAGE ON SCHEMA public TO test_user');
    console.log('✅ Granted USAGE on schema to test_user');
    
    // Grant INSERT privilege on the test table
    await superClient.query('GRANT INSERT ON audit_test_table TO test_user');
    console.log('✅ Granted INSERT privilege on test table to test_user');
    
    // Grant USAGE on sequence
    await superClient.query('GRANT USAGE ON SEQUENCE audit_test_table_id_seq TO test_user');
    console.log('✅ Granted USAGE privilege on sequence to test_user');
    
    await superClient.end();
    console.log('✅ Superuser connection closed');
    
    // Now test with the new user
    const testClient = new Client({
      host: 'localhost',
      port: 5432,
      database: 'news_db',
      user: 'test_user',
      password: 'test_password_123',
      ssl: false
    });
    
    await testClient.connect();
    console.log('✅ Test user connected successfully');
    
    // Try to insert into the test table
    try {
      const result = await testClient.query(`
        INSERT INTO audit_test_table (data) 
        VALUES ('test data from new user') 
        RETURNING id
      `);
      console.log(`✅ INSERT into test table successful with new user, new entry ID: ${result.rows[0].id}`);
    } catch (err) {
      console.log('❌ INSERT into test table failed with new user:', err.message);
      console.log('Error code:', err.code);
    }
    
    await testClient.end();
    console.log('✅ Test user connection closed');
    
    return true;
  } catch (err) {
    console.error('Error testing new user:', err.message);
    return false;
  }
};

testNewUser().then(result => {
  process.exit(result ? 0 : 1);
});