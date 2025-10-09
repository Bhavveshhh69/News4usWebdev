// Debug script for audit user privileges
import pkg from 'pg';
const { Client } = pkg;

const debugAuditUser = async () => {
  try {
    console.log('Debugging audit user privileges...');
    
    // Create a direct client connection for audit user
    const client = new Client({
      host: 'localhost',
      port: 5432,
      database: 'news_db',
      user: 'audit_user',
      password: 'strong_audit_password_123',
      ssl: false
    });
    
    await client.connect();
    console.log('✅ Audit user connected successfully');
    
    // Check what tables the audit user can see
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Tables visible to audit user:');
    tables.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    // Check specific privileges on app_audit_log
    const privileges = await client.query(`
      SELECT 
        has_table_privilege('audit_user', 'app_audit_log', 'SELECT') as can_select,
        has_table_privilege('audit_user', 'app_audit_log', 'INSERT') as can_insert,
        has_table_privilege('audit_user', 'app_audit_log', 'UPDATE') as can_update,
        has_table_privilege('audit_user', 'app_audit_log', 'DELETE') as can_delete
    `);
    
    console.log('\nPrivileges for audit_user on app_audit_log:');
    console.log(privileges.rows[0]);
    
    // Try to insert directly
    try {
      const result = await client.query(`
        INSERT INTO app_audit_log (user_id, action, details) 
        VALUES (1, 'debug_test', '{"test": "data"}') 
        RETURNING id
      `);
      console.log(`✅ INSERT successful, new audit log entry ID: ${result.rows[0].id}`);
    } catch (err) {
      console.log('❌ INSERT failed:', err.message);
      console.log('Error code:', err.code);
    }
    
    await client.end();
  } catch (err) {
    console.error('Error debugging audit user:', err.message);
  }
};

debugAuditUser();