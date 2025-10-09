import { pool } from './config/database.js';

const securityAssessment = async () => {
  try {
    const client = await pool.connect();
    
    console.log('# Security Assessment Report\n');
    
    // Check PostgreSQL version
    console.log('## PostgreSQL Version');
    const versionResult = await client.query('SELECT version()');
    console.log(versionResult.rows[0].version);
    console.log('');
    
    // Check if SSL is enabled
    console.log('## SSL Configuration');
    const sslResult = await client.query('SHOW ssl');
    console.log(`SSL Enabled: ${sslResult.rows[0].ssl}`);
    console.log('');
    
    // Check user roles and permissions
    console.log('## Database Roles');
    const rolesResult = await client.query(`
      SELECT 
        r.rolname, 
        r.rolsuper, 
        r.rolinherit, 
        r.rolcreaterole, 
        r.rolcreatedb, 
        r.rolcanlogin,
        ARRAY(SELECT b.rolname
              FROM pg_catalog.pg_auth_members m
              JOIN pg_catalog.pg_roles b ON (m.roleid = b.oid)
              WHERE m.member = r.oid) as memberof
      FROM pg_catalog.pg_roles r
      WHERE r.rolname !~ '^pg_'
      ORDER BY 1
    `);
    
    rolesResult.rows.forEach(role => {
      console.log(`- ${role.rolname}:`);
      console.log(`  Superuser: ${role.rolsuper}`);
      console.log(`  Can login: ${role.rolcanlogin}`);
      // Handle memberof array properly

      
      const memberOf = Array.isArray(role.memberof) ? role.memberof.join(', ') : 'none';
      console.log(`  Member of: ${memberOf}`);
    });
    console.log('');
    
    // Check for public schema access
    console.log('## Public Schema Access');
    const publicAccessResult = await client.query(`
      SELECT 
        nspname AS schema_name,
        nspowner::regrole AS owner
      FROM pg_namespace
      WHERE nspname = 'public'
    `);
    
    publicAccessResult.rows.forEach(schema => {
      console.log(`- Schema: ${schema.schema_name}, Owner: ${schema.owner}`);
    });
    console.log('');
    
    // Check for default privileges
    console.log('## Default Privileges');
    const defaultPrivilegesResult = await client.query(`
      SELECT 
        pg_roles.rolname AS role_name,
        pg_default_acl.defaclnamespace::regnamespace AS schema_name,
        pg_default_acl.defaclobjtype AS object_type,
        pg_default_acl.defaclacl AS privileges
      FROM pg_default_acl
      JOIN pg_roles ON pg_default_acl.defaclrole = pg_roles.oid
    `);
    
    if (defaultPrivilegesResult.rows.length > 0) {
      defaultPrivilegesResult.rows.forEach(priv => {
        console.log(`- Role: ${priv.role_name}, Schema: ${priv.schema_name}, Type: ${priv.object_type}`);
      });
    } else {
      console.log('- No default privileges found');
    }
    console.log('');
    
    // Check for active connections
    console.log('## Active Connections');
    const connectionsResult = await client.query(`
      SELECT 
        pid,
        usename,
        application_name,
        client_addr,
        backend_start,
        state
      FROM pg_stat_activity
      WHERE state = 'active' OR state = 'idle'
      ORDER BY backend_start
    `);
    
    connectionsResult.rows.forEach(conn => {
      console.log(`- PID: ${conn.pid}, User: ${conn.usename}, Client: ${conn.client_addr || 'local'}, State: ${conn.state}`);
    });
    console.log('');
    
    client.release();
    
    console.log('## Security Recommendations\n');
    console.log('1. Enable SSL encryption for database connections');
    console.log('2. Review and restrict user privileges to minimum required');
    console.log('3. Implement connection pooling with appropriate limits');
    console.log('4. Regularly audit database roles and permissions');
    console.log('5. Set up proper backup and recovery procedures');
    
    process.exit(0);
  } catch (err) {
    console.error('Error during security assessment:', err.stack);
    process.exit(1);
  }
};

securityAssessment();