# Connection Management Documentation

## Overview
This document provides comprehensive documentation for the connection management system implemented in the NEWS4US application.

## Connection Pooling Configuration

### Primary Connection Pool
The primary connection pool is used for write operations and transactions.

**Configuration Parameters:**
| Parameter | Default Value | Description |
|-----------|---------------|-------------|
| host | localhost | Database host |
| port | 5432 | Database port |
| database | news_db | Database name |
| user | postgres | Database user |
| password | Bhavv@1127 | Database password |
| ssl | false | SSL encryption (can be enabled) |
| max | 20 | Maximum number of clients in the pool |
| min | 5 | Minimum number of clients in the pool |
| idleTimeoutMillis | 30000 | Close idle clients after 30 seconds |
| connectionTimeoutMillis | 2000 | Return an error after 2 seconds if connection could not be established |
| acquireTimeoutMillis | 30000 | Return an error after 30 seconds if connection could not be acquired |
| keepAlive | true | Enable keep-alive |
| keepAliveInitialDelayMillis | 0 | Initial delay for keep-alive |

### Read Replica Connection Pools
Read replica pools are used for read operations to distribute load.

**Configuration Parameters:**
| Parameter | Default Value | Description |
|-----------|---------------|-------------|
| host | (from DB_REPLICA_HOSTS) | Replica database host |
| port | 5432 | Replica database port |
| database | news_db | Replica database name |
| user | postgres | Replica database user |
| password | Bhavv@1127 | Replica database password |
| ssl | false | SSL encryption (can be enabled) |
| max | 10 | Maximum number of clients in the pool |
| min | 2 | Minimum number of clients in the pool |
| idleTimeoutMillis | 60000 | Close idle clients after 60 seconds |
| connectionTimeoutMillis | 5000 | Return an error after 5 seconds if connection could not be established |
| keepAlive | true | Enable keep-alive |
| keepAliveInitialDelayMillis | 0 | Initial delay for keep-alive |

## Connection Routing

### Operation Types
Connections are routed based on operation type:

1. **Write Operations** - Always use primary pool
   - INSERT operations
   - UPDATE operations
   - DELETE operations
   - Transactions

2. **Read Operations** - Use replica pools when available
   - SELECT operations
   - Queries without data modification

### Pool Selection Logic
```javascript
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
```

## Retry Logic

### Exponential Backoff
The system implements exponential backoff for connection retries:

1. **First Attempt** - Immediate retry
2. **Second Attempt** - Wait 1 second
3. **Third Attempt** - Wait 2 seconds
4. **Fourth Attempt** - Wait 4 seconds
5. **And so on...**

### Retry Configuration
| Parameter | Default Value | Description |
|-----------|---------------|-------------|
| maxRetries | 3 | Maximum number of retry attempts |
| baseDelay | 1000 | Base delay in milliseconds |

### Retry Implementation
```javascript
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
```

## Circuit Breaker Pattern

### Implementation
The system implements a circuit breaker pattern to prevent cascading failures:

1. **Closed State** - Normal operation, requests are processed
2. **Open State** - Failure threshold exceeded, requests are blocked
3. **Half-Open State** - Test requests are allowed to check system recovery

### Circuit Breaker Configuration
| Parameter | Default Value | Description |
|-----------|---------------|-------------|
| failureThreshold | 5 | Number of failures before opening circuit |
| timeout | 60000 | Time in milliseconds before attempting reset |
| resetTimeout | 30000 | Time in milliseconds for half-open state |

## Health Monitoring

### Metrics Collection
The system collects the following metrics:

1. **Connection Pool Metrics**
   - Total connections
   - Idle connections
   - Waiting requests
   - Error count

2. **Performance Metrics**
   - Query response times
   - Connection acquisition times
   - Transaction durations

3. **Resource Utilization**
   - CPU usage
   - Memory usage
   - Disk I/O

### Monitoring Implementation
```javascript
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
```

## Alerting Thresholds

### Critical Alerts
| Metric | Threshold | Action |
|--------|-----------|--------|
| Waiting Requests | > 10 | Log error and send alert |
| Error Rate | > 5% | Log error and send alert |
| Connection Pool Utilization | > 90% | Log error and send alert |
| Query Response Time | > 5 seconds | Log warning |

### Warning Alerts
| Metric | Threshold | Action |
|--------|-----------|--------|
| Connection Pool Utilization | > 80% | Log warning |
| Error Rate | > 1% | Log warning |
| Query Response Time | > 1 second | Log warning |

## SSL Configuration

### Enabling SSL
To enable SSL encryption for database connections:

1. Set `DB_SSL=true` in environment variables
2. Provide SSL certificate files:
   - `DB_SSL_CA` - Certificate Authority certificate
   - `DB_SSL_KEY` - Client private key
   - `DB_SSL_CERT` - Client certificate

### SSL Configuration Example
```javascript
// SSL Configuration
ssl: process.env.DB_SSL === 'true' ? {
  rejectUnauthorized: true,
  ca: process.env.DB_SSL_CA ? fs.readFileSync(process.env.DB_SSL_CA).toString() : undefined,
  key: process.env.DB_SSL_KEY ? fs.readFileSync(process.env.DB_SSL_KEY).toString() : undefined,
  cert: process.env.DB_SSL_CERT ? fs.readFileSync(process.env.DB_SSL_CERT).toString() : undefined,
} : false,
```

## Best Practices

### Connection Management
1. Always release connections back to the pool after use
2. Use connection timeouts to prevent hanging connections
3. Monitor connection pool utilization regularly
4. Implement proper error handling for connection failures

### Performance Optimization
1. Use appropriate pool sizing based on workload
2. Implement connection keep-alive for persistent connections
3. Use read replicas to distribute read load
4. Implement retry logic with exponential backoff

### Security
1. Use SSL encryption for all database connections
2. Implement role-based access control
3. Regularly rotate database credentials
4. Monitor for unauthorized access attempts

## Troubleshooting

### Common Issues

#### 1. Connection Pool Exhaustion
**Symptoms:**
- "Timeout acquiring a connection" errors
- High waiting requests metric
- Slow query performance

**Solutions:**
- Increase pool size
- Optimize query performance
- Implement connection timeouts
- Monitor for connection leaks

#### 2. Connection Failures
**Symptoms:**
- "Connection refused" errors
- "Network is unreachable" errors
- Intermittent database connectivity issues

**Solutions:**
- Check database server status
- Verify network connectivity
- Implement retry logic
- Check firewall settings

#### 3. Slow Query Performance
**Symptoms:**
- High query response times
- Increased connection acquisition times
- Poor application performance

**Solutions:**
- Optimize database indexes
- Analyze query execution plans
- Implement query caching
- Scale database resources

## Conclusion

This connection management documentation provides a comprehensive overview of the connection pooling, routing, retry logic, monitoring, and security features implemented in the NEWS4US application. The system is designed for optimal performance, reliability, and security.