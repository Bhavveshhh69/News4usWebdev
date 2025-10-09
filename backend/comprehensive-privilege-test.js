// Comprehensive test to diagnose privilege issues
import pkg from 'pg';
const { Client } = pkg;

const comprehensivePrivilegeTest = async () => {
  try {
    console.log('Comprehensive privilege test...');
    
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
    
    // Check current privileges for audit_user
    const currentPrivileges = await superClient.query(`
      SELECT grantee, table_name, privilege_type 
      FROM information_schema.table_privileges 
      WHERE table_name IN ('app_audit_log', 'audit_fix_test_table') AND grantee = 'audit_user'
    `);
    
    console.log('Current privileges for audit_user:');
    if (currentPrivileges.rows.length === 0) {
      console.log('No privileges found');
    } else {
      currentPrivileges.rows.forEach(row => {
        console.log(`- ${row.table_name}: ${row.privilege_type}`);
      });
    }
    
    // Check if audit_user can connect to database
    const userCanConnect = await superClient.query(`
      SELECT has_database_privilege('audit_user', 'news_db', 'CONNECT') as can_connect
    `);
    
    console.log(`Audit user can connect to database: ${userCanConnect.rows[0].can_connect}`);
    
    // Check if audit_user has USAGE on schema
    const userCanUseSchema = await superClient.query(`
      SELECT has_schema_privilege('audit_user', 'public', 'USAGE') as can_use_schema
    `);
    
    console.log(`Audit user can use public schema: ${userCanUseSchema.rows[0].can_use_schema}`);
    
    // Check specific table privileges
    const tablePrivileges = await superClient.query(`
      SELECT 
        has_table_privilege('audit_user', 'app_audit_log', 'SELECT') as can_select,
        has_table_privilege('audit_user', 'app_audit_log', 'INSERT') as can_insert,
        has_table_privilege('audit_user', 'app_audit_log', 'UPDATE') as can_update,
        has_table_privilege('audit_user', 'app_audit_log', 'DELETE') as can_delete
    `);
    
    console.log('Privileges for audit_user on app_audit_log:');
    console.log(tablePrivileges.rows[0]);
    
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
    
    // Try a simple SELECT to see if we can access the table at all
    try {
      await auditClient.query('SELECT COUNT(*) FROM app_audit_log');
      console.log('✅ Audit user can SELECT from app_audit_log');
    } catch (err) {
      console.log('❌ Audit user cannot SELECT from app_audit_log:', err.message);
    }
    
    // Try to insert into the table
    try {
      const result = await auditClient.query(`
        INSERT INTO app_audit_log (user_id, action, details) 
        VALUES (999, 'privilege_test', '{"test": "data"}') 
        RETURNING id
      `);
      console.log(`✅ INSERT into app_audit_log successful, new entry ID: ${result.rows[0].id}`);
    } catch (err) {
      console.log('❌ INSERT into app_audit_log failed:', err.message);
      console.log('Error code:', err.code);
    }
    
    await auditClient.end();
    console.log('✅ Audit user connection closed');
    
    return true;
  } catch (err) {
    console.error('Error in comprehensive privilege test:', err.message);
    return false;
  }
};

comprehensivePrivilegeTest().then(result => {
  process.exit(result ? 0 : 1);
});