// Script to verify database roles
import { executeQuery } from './config/db-utils.js';

const verifyDBRoles = async () => {
  try {
    console.log('Checking database roles...');
    
    // Check if required roles exist
    const rolesCheck = await executeQuery(`
      SELECT rolname, rolcanlogin, rolcreatedb, rolsuper 
      FROM pg_roles 
      WHERE rolname IN ('app_user', 'read_only_user', 'admin_user', 'audit_user')
      ORDER BY rolname
    `);
    
    const requiredRoles = ['app_user', 'read_only_user', 'admin_user', 'audit_user'];
    const existingRoles = rolesCheck.rows.map(row => row.rolname);
    
    console.log('\nRequired roles check:');
    let allRolesPresent = true;
    requiredRoles.forEach(role => {
      if (existingRoles.includes(role)) {
        console.log(`✓ ${role}`);
      } else {
        console.log(`❌ ${role} (MISSING)`);
        allRolesPresent = false;
      }
    });
    
    if (allRolesPresent) {
      console.log('\n✅ All required roles are present');
      console.log('\nRole details:');
      rolesCheck.rows.forEach(row => {
        console.log(`- ${row.rolname}: login=${row.rolcanlogin}, createdb=${row.rolcreatedb}, superuser=${row.rolsuper}`);
      });
    } else {
      console.log('\n❌ Some required roles are missing');
    }
    
    return allRolesPresent;
  } catch (err) {
    console.error('Error verifying database roles:', err.message);
    return false;
  }
};

// Run the verification
verifyDBRoles().then(result => {
  process.exit(result ? 0 : 1);
});