import { executeQuery } from './config/db-utils.js';

const verifySecuritySetup = async () => {
  try {
    console.log('Verifying security setup...');
    
    // Check if roles exist
    console.log('Checking roles...');
    const rolesResult = await executeQuery(`
      SELECT rolname, rolcanlogin, rolcreatedb, rolsuper 
      FROM pg_roles 
      WHERE rolname IN ('app_user', 'read_only_user', 'admin_user', 'audit_user')
      ORDER BY rolname
    `);
    
    console.log('Roles found:');
    rolesResult.rows.forEach(role => {
      console.log(`- ${role.rolname}: login=${role.rolcanlogin}, createdb=${role.rolcreatedb}, superuser=${role.rolsuper}`);
    });
    
    // Check if audit log table exists
    console.log('\nChecking audit log table...');
    const tableResult = await executeQuery(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'audit_log'
    `);
    
    if (tableResult.rows.length > 0) {
      console.log('✓ Audit log table exists');
      
      // Check audit log table structure
      const columnsResult = await executeQuery(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'audit_log' 
        ORDER BY ordinal_position
      `);
      
      console.log('Audit log table structure:');
      columnsResult.rows.forEach(column => {
        console.log(`- ${column.column_name} (${column.data_type}, nullable: ${column.is_nullable})`);
      });
    } else {
      console.log('✗ Audit log table does not exist');
    }
    
    // Check if audit function exists
    console.log('\nChecking audit function...');
    const functionResult = await executeQuery(`
      SELECT proname 
      FROM pg_proc 
      WHERE proname = 'audit_trigger_func'
    `);
    
    if (functionResult.rows.length > 0) {
      console.log('✓ Audit trigger function exists');
    } else {
      console.log('✗ Audit trigger function does not exist');
    }
    
    // Check if triggers exist
    console.log('\nChecking audit triggers...');
    const triggerResult = await executeQuery(`
      SELECT tgname, tgrelid::regclass 
      FROM pg_trigger 
      WHERE tgname LIKE '%audit%' 
      ORDER BY tgname
    `);
    
    if (triggerResult.rows.length > 0) {
      console.log('Audit triggers found:');
      triggerResult.rows.forEach(trigger => {
        console.log(`- ${trigger.tgname} on ${trigger.tgrelid}`);
      });
    } else {
      console.log('No audit triggers found');
    }
    
    console.log('\nSecurity setup verification completed');
    process.exit(0);
  } catch (err) {
    console.error('Error verifying security setup:', err.stack);
    process.exit(1);
  }
};

verifySecuritySetup();