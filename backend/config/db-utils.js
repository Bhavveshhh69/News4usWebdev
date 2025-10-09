// Database utility functions
import { appUserPool, readOnlyUserPool, adminUserPool, auditUserPool } from './database.js';

// Execute a query with error handling
const executeQuery = async (query, values = [], poolType = 'app') => {
  let pool;
  switch (poolType) {
    case 'read':
      pool = readOnlyUserPool;
      break;
    case 'admin':
      pool = adminUserPool;
      break;
    case 'audit':
      pool = auditUserPool;
      break;
    default:
      pool = appUserPool;
  }
  
  const client = await pool.connect();
  try {
    const result = await client.query(query, values);
    return result;
  } catch (err) {
    console.error('Database query error:', err.stack);
    throw err;
  } finally {
    client.release();
  }
};

// Execute a transaction with multiple queries
const executeTransaction = async (queries, poolType = 'app') => {
  let pool;
  switch (poolType) {
    case 'read':
      pool = readOnlyUserPool;
      break;
    case 'admin':
      pool = adminUserPool;
      break;
    case 'audit':
      pool = auditUserPool;
      break;
    default:
      pool = appUserPool;
  }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const results = [];
    for (const { query, values } of queries) {
      const result = await client.query(query, values);
      results.push(result);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Database transaction error:', err.stack);
    throw err;
  } finally {
    client.release();
  }
};

// Sanitize input to prevent SQL injection
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
      switch (char) {
        case '\0':
          return '\\0';
        case '\x08':
          return '\\b';
        case '\x09':
          return '\\t';
        case '\x1a':
          return '\\z';
        case '\n':
          return '\\n';
        case '\r':
          return '\\r';
        case '"':
        case "'":
        case '\\':
        case '%':
          return '\\' + char;
        default:
          return char;
      }
    });
  }
  return input;
};

// Validate email format
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Close all database connections
const closeConnections = async () => {
  await appUserPool.end();
  await readOnlyUserPool.end();
  await adminUserPool.end();
  await auditUserPool.end();
};

export { executeQuery, executeTransaction, sanitizeInput, validateEmail, closeConnections };