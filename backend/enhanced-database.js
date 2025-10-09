import pkg from 'pg';
import dbConfig from './config/db.js';
import fs from 'fs';

const { Pool } = pkg;

// Enhanced connection pool configuration
const primaryPool = new Pool({
  // Connection settings
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  password: dbConfig.password,
  
  // SSL Configuration (to be enabled when SSL certificates are available)
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: true,
    ca: process.env.DB_SSL_CA ? fs.readFileSync(process.env.DB_SSL_CA).toString() : undefined,
    key: process.env.DB_SSL_KEY ? fs.readFileSync(process.env.DB_SSL_KEY).toString() : undefined,
    cert: process.env.DB_SSL_CERT ? fs.readFileSync(process.env.DB_SSL_CERT).toString() : undefined,
  } : false,
  
  // Pool sizing
  max: parseInt(process.env.DB_MAX_CONNECTIONS) || dbConfig.max || 20,        // Maximum number of clients in the pool
  min: parseInt(process.env.DB_MIN_CONNECTIONS) || 5,         // Minimum number of clients in the pool
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || dbConfig.idleTimeoutMillis || 30000,     // Close idle clients after 30 seconds
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || dbConfig.connectionTimeoutMillis || 2000,  // Return an error after 2 seconds if connection could not be established
  acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 30000,      // Return an error after 30 seconds if connection could not be acquired
  
  // Additional options
  keepAlive: process.env.DB_KEEP_ALIVE !== 'false',               // Enable keep-alive
  keepAliveInitialDelayMillis: parseInt(process.env.DB_KEEP_ALIVE_DELAY) || 0,  // Initial delay for keep-alive
});

// Read replica connection pools
const replicaPools = [];

// Parse replica configurations from environment variables
const replicaHosts = process.env.DB_REPLICA_HOSTS ? 
  process.env.DB_REPLICA_HOSTS.split(',') : [];

replicaHosts.forEach((host, index) => {
  const replicaPool = new Pool({
    host: host.trim(),
    port: process.env.DB_REPLICA_PORT || dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    password: dbConfig.password,
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: true,
      ca: process.env.DB_SSL_CA ? fs.readFileSync(process.env.DB_SSL_CA).toString() : undefined,
      key: process.env.DB_SSL_KEY ? fs.readFileSync(process.env.DB_SSL_KEY).toString() : undefined,
      cert: process.env.DB_SSL_CERT ? fs.readFileSync(process.env.DB_SSL_CERT).toString() : undefined,
    } : false,
    max: parseInt(process.env.DB_REPLICA_MAX_CONNECTIONS) || 10,
    min: parseInt(process.env.DB_REPLICA_MIN_CONNECTIONS) || 2,
    idleTimeoutMillis: parseInt(process.env.DB_REPLICA_IDLE_TIMEOUT) || 60000,
    connectionTimeoutMillis: parseInt(process.env.DB_REPLICA_CONNECTION_TIMEOUT) || 5000,
    keepAlive: process.env.DB_REPLICA_KEEP_ALIVE !== 'false',
    keepAliveInitialDelayMillis: parseInt(process.env.DB_REPLICA_KEEP_ALIVE_DELAY) || 0,
  });
  
  replicaPools.push(replicaPool);
});

// Function to get appropriate pool based on operation type
const getPool = (operationType = 'read') => {
  // If no replicas configured or operation is write, use primary pool
  if (operationType === 'write' || replicaPools.length === 0) {
    return primaryPool;
  }
  
  // Round-robin selection for read replicas
  const randomIndex = Math.floor(Math.random() * replicaPools.length);
  return replicaPools[randomIndex];
};

// Test the database connection
const testConnection = async () => {
  try {
    const client = await primaryPool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('Primary database connection successful:', result.rows[0]);
    
    // Test replica connections
    for (let i = 0; i < replicaPools.length; i++) {
      try {
        const replicaClient = await replicaPools[i].connect();
        const replicaResult = await replicaClient.query('SELECT NOW()');
        replicaClient.release();
        console.log(`Replica ${i + 1} database connection successful:`, replicaResult.rows[0]);
      } catch (err) {
        console.error(`Replica ${i + 1} database connection failed:`, err.stack);
      }
    }
    
    return true;
  } catch (err) {
    console.error('Primary database connection failed:', err.stack);
    return false;
  }
};

// Export the pools and test function
export { primaryPool, replicaPools, getPool, testConnection };