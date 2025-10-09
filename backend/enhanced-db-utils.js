// Enhanced database utility functions with retry logic and replica support
import { primaryPool, replicaPools, getPool } from './enhanced-database.js';

// Execute a query with retry logic
const executeQuery = async (query, values = [], operationType = 'read', maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const pool = getPool(operationType);
      const client = await pool.connect();
      
      try {
        const result = await client.query(query, values);
        client.release();
        return result;
      } catch (err) {
        client.release();
        throw err;
      }
    } catch (err) {
      lastError = err;
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        console.error(`Query failed after ${maxRetries + 1} attempts:`, err.stack);
        throw err;
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`Query attempt ${attempt + 1} failed, retrying in ${delay}ms:`, err.message);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Execute a transaction with retry logic
const executeTransaction = async (queries, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Transactions always use primary pool
    const client = await primaryPool.connect();
    
    try {
      await client.query('BEGIN');
      
      const results = [];
      for (const { query, values } of queries) {
        const result = await client.query(query, values);
        results.push(result);
      }
      
      await client.query('COMMIT');
      client.release();
      return results;
    } catch (err) {
      await client.query('ROLLBACK');
      client.release();
      lastError = err;
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        console.error(`Transaction failed after ${maxRetries + 1} attempts:`, err.stack);
        throw err;
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`Transaction attempt ${attempt + 1} failed, retrying in ${delay}ms:`, err.message);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
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
  await primaryPool.end();
  for (const replicaPool of replicaPools) {
    await replicaPool.end();
  }
};

// Connection health monitoring
class ConnectionHealthMonitor {
  constructor() {
    this.metrics = {
      totalConnections: 0,
      idleConnections: 0,
      waitingRequests: 0,
      errors: 0,
      lastError: null
    };
    
    this.slowQueryThreshold = parseInt(process.env.SLOW_QUERY_THRESHOLD) || 1000; // 1 second
  }
  
  // Update metrics
  updateMetrics() {
    this.metrics.totalConnections = primaryPool.totalCount;
    this.metrics.idleConnections = primaryPool.idleCount;
    this.metrics.waitingRequests = primaryPool.waitingCount;
  }
  
  // Log metrics periodically
  startMonitoring(interval = 30000) {  // Every 30 seconds
    this.intervalId = setInterval(() => {
      this.updateMetrics();
      console.log('Database metrics:', this.metrics);
      
      // Check for alert conditions
      if (this.metrics.waitingRequests > 10) {
        console.error('High number of waiting database connections:', this.metrics.waitingRequests);
      }
      
      if (this.metrics.errors > 5) {
        console.error('High number of database errors:', this.metrics.errors);
      }
    }, interval);
  }
  
  // Stop monitoring
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  
  // Record error
  recordError(error) {
    this.metrics.errors++;
    this.metrics.lastError = {
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Create a single instance of the monitor
const connectionMonitor = new ConnectionHealthMonitor();

export { 
  executeQuery, 
  executeTransaction, 
  sanitizeInput, 
  validateEmail, 
  closeConnections,
  connectionMonitor
};