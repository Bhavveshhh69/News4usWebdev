import pkg from 'pg';
import dbConfig, { roleConfigs } from './db.js';

const { Pool } = pkg;

// Create connection pools for different roles
const defaultPool = new Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  password: dbConfig.password,
  ssl: dbConfig.ssl === 'true' || dbConfig.ssl === true ? true : 
       dbConfig.ssl === 'false' || dbConfig.ssl === false ? false : 
       dbConfig.ssl,
  max: dbConfig.max,
  idleTimeoutMillis: dbConfig.idleTimeoutMillis,
  connectionTimeoutMillis: dbConfig.connectionTimeoutMillis,
});
const appUserPool = new Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: roleConfigs.app_user.user,
  password: roleConfigs.app_user.password,
  ssl: dbConfig.ssl === 'true' || dbConfig.ssl === true ? true : 
       dbConfig.ssl === 'false' || dbConfig.ssl === false ? false : 
       dbConfig.ssl,
  max: dbConfig.max,
  idleTimeoutMillis: dbConfig.idleTimeoutMillis,
  connectionTimeoutMillis: dbConfig.connectionTimeoutMillis,
});

const readOnlyUserPool = new Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: roleConfigs.read_only_user.user,
  password: roleConfigs.read_only_user.password,
  ssl: dbConfig.ssl === 'true' || dbConfig.ssl === true ? true : 
       dbConfig.ssl === 'false' || dbConfig.ssl === false ? false : 
       dbConfig.ssl,
  max: dbConfig.max,
  idleTimeoutMillis: dbConfig.idleTimeoutMillis,
  connectionTimeoutMillis: dbConfig.connectionTimeoutMillis,
});

const adminUserPool = new Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: roleConfigs.admin_user.user,
  password: roleConfigs.admin_user.password,
  ssl: dbConfig.ssl === 'true' || dbConfig.ssl === true ? true : 
       dbConfig.ssl === 'false' || dbConfig.ssl === false ? false : 
       dbConfig.ssl,
  max: 5, // Limit admin connections
  idleTimeoutMillis: dbConfig.idleTimeoutMillis,
  connectionTimeoutMillis: dbConfig.connectionTimeoutMillis,
});

const auditUserPool = new Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: roleConfigs.audit_user.user,
  password: roleConfigs.audit_user.password,
  ssl: dbConfig.ssl === 'true' || dbConfig.ssl === true ? true : 
       dbConfig.ssl === 'false' || dbConfig.ssl === false ? false : 
       dbConfig.ssl,
  max: 5, // Limit audit connections
  idleTimeoutMillis: dbConfig.idleTimeoutMillis,
  connectionTimeoutMillis: dbConfig.connectionTimeoutMillis,
});

// Test the database connections
const testConnections = async () => {
  try {
    const appClient = await appUserPool.connect();
    await appClient.query('SELECT NOW()');
    appClient.release();
    console.log('App user database connection successful');
    
    const readOnlyClient = await readOnlyUserPool.connect();
    await readOnlyClient.query('SELECT NOW()');
    readOnlyClient.release();
    console.log('Read-only user database connection successful');
    
    const adminClient = await adminUserPool.connect();
    await adminClient.query('SELECT NOW()');
    adminClient.release();
    console.log('Admin user database connection successful');
    
    const auditClient = await auditUserPool.connect();
    await auditClient.query('SELECT NOW()');
    auditClient.release();
    console.log('Audit user database connection successful');
    
    return true;
  } catch (err) {
    console.error('Database connection failed:', err.stack);
    return false;
  }
};

// Export the pools and test function
export { 
  appUserPool, 
  readOnlyUserPool, 
  adminUserPool, 
  auditUserPool, 
  testConnections, 
  defaultPool as pool 
};