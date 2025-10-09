# Performance Optimization Plan

## Current Performance Baseline

Based on our Phase 1 assessment, the current performance characteristics are:
- Connection latency: ~90ms
- Simple query execution: ~13ms
- Complex query execution: ~22ms
- Insert operation: ~10ms
- Current connection pool status: 1 total, 1 idle

## Proposed Performance Optimizations

### 1. Query Result Caching

#### Current Issues:
- No caching of frequently accessed data
- Repeated queries for the same data
- No distinction between hot and cold data

#### Proposed Solution:
Implement a multi-layer caching strategy using Redis for frequently accessed data.

#### Implementation Plan:
1. Set up Redis instance
2. Implement caching layer in repository functions
3. Add cache invalidation strategies
4. Monitor cache performance

#### Caching Implementation:

```javascript
// cache-manager.js
import Redis from 'redis';
import { promisify } from 'util';

class CacheManager {
  constructor() {
    this.redisClient = Redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: process.env.REDIS_DB || 0
    });
    
    this.getAsync = promisify(this.redisClient.get).bind(this.redisClient);
    this.setAsync = promisify(this.redisClient.set).bind(this.redisClient);
    this.delAsync = promisify(this.redisClient.del).bind(this.redisClient);
    this.expireAsync = promisify(this.redisClient.expire).bind(this.redisClient);
  }
  
  async get(key) {
    try {
      const value = await this.getAsync(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      console.error('Cache get error:', err);
      return null;
    }
  }
  
  async set(key, value, ttl = 3600) {  // Default 1 hour TTL
    try {
      await this.setAsync(key, JSON.stringify(value));
      if (ttl) {
        await this.expireAsync(key, ttl);
      }
    } catch (err) {
      console.error('Cache set error:', err);
    }
  }
  
  async delete(key) {
    try {
      await this.delAsync(key);
    } catch (err) {
      console.error('Cache delete error:', err);
    }
  }
  
  async invalidatePattern(pattern) {
    try {
      const keys = await promisify(this.redisClient.keys).bind(this.redisClient)(pattern);
      if (keys.length > 0) {
        await this.delAsync(keys);
      }
    } catch (err) {
      console.error('Cache pattern invalidation error:', err);
    }
  }
}

export default new CacheManager();
```

```javascript
// Enhanced articleRepository.js with caching
import cacheManager from '../utils/cache-manager.js';
import { executeQuery, executeTransaction } from '../config/db-utils.js';

// Get article by ID with caching
const getArticleById = async (id) => {
  try {
    // Try to get from cache first
    const cacheKey = `article:${id}`;
    let article = await cacheManager.get(cacheKey);
    
    if (article) {
      console.log(`Cache hit for article ${id}`);
      return article;
    }
    
    console.log(`Cache miss for article ${id}, querying database`);
    
    // If not in cache, query database
    const query = `
      SELECT 
        a.id, a.title, a.summary, a.content, a.author_id, a.category_id, 
        a.status, a.published_at, a.created_at, a.updated_at, a.views, a.is_featured,
        u.name as author_name, u.email as author_email,
        c.name as category_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.id = $1 AND a.status != 'deleted'
    `;
    
    const values = [id];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    // Get associated tags
    const tagsQuery = `
      SELECT t.id, t.name
      FROM tags t
      JOIN article_tags at ON t.id = at.tag_id
      WHERE at.article_id = $1
    `;
    
    const tagsResult = await executeQuery(tagsQuery, [id]);
    article = result.rows[0];
    article.tags = tagsResult.rows;
    
    // Store in cache for 1 hour
    await cacheManager.set(cacheKey, article, 3600);
    
    return article;
  } catch (err) {
    throw err;
  }
};

// Enhanced getAllArticles with caching for common queries
const getAllArticles = async (limit = 10, offset = 0, filters = {}) => {
  try {
    // Create cache key based on parameters
    const cacheKey = `articles:limit:${limit}:offset:${offset}:${JSON.stringify(filters)}`;
    
    // Try to get from cache first
    let cachedResult = await cacheManager.get(cacheKey);
    if (cachedResult) {
      console.log(`Cache hit for articles query`);
      return cachedResult;
    }
    
    console.log(`Cache miss for articles query, querying database`);
    
    let query = `
      SELECT 
        a.id, a.title, a.summary, a.content, a.author_id, a.category_id, 
        a.status, a.published_at, a.created_at, a.updated_at, a.views, a.is_featured,
        u.name as author_name, u.email as author_email,
        c.name as category_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.status != 'deleted'
    `;
    
    const values = [];
    let valueIndex = 1;
    
    // Apply filters
    if (filters.categoryId) {
      query += ` AND a.category_id = $${valueIndex}`;
      values.push(filters.categoryId);
      valueIndex++;
    }
    
    if (filters.authorId) {
      query += ` AND a.author_id = $${valueIndex}`;
      values.push(filters.authorId);
      valueIndex++;
    }
    
    if (filters.status) {
      query += ` AND a.status = $${valueIndex}`;
      values.push(filters.status);
      valueIndex++;
    }
    
    if (filters.isFeatured !== undefined) {
      query += ` AND a.is_featured = $${valueIndex}`;
      values.push(filters.isFeatured);
      valueIndex++;
    }
    
    // Add ordering and pagination
    query += ` ORDER BY a.created_at DESC LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`;
    values.push(limit, offset);
    
    const result = await executeQuery(query, values);
    
    // Get tags for each article
    const articles = result.rows;
    for (const article of articles) {
      const tagsQuery = `
        SELECT t.id, t.name
        FROM tags t
        JOIN article_tags at ON t.id = at.tag_id
        WHERE at.article_id = $1
      `;
      
      const tagsResult = await executeQuery(tagsQuery, [article.id]);
      article.tags = tagsResult.rows;
    }
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM articles a WHERE a.status != \'deleted\'';
    const countValues = [];
    let countValueIndex = 1;
    
    if (filters.categoryId) {
      countQuery += ` AND a.category_id = $${countValueIndex}`;
      countValues.push(filters.categoryId);
      countValueIndex++;
    }
    
    if (filters.authorId) {
      countQuery += ` AND a.author_id = $${countValueIndex}`;
      countValues.push(filters.authorId);
      countValueIndex++;
    }
    
    if (filters.status) {
      countQuery += ` AND a.status = $${countValueIndex}`;
      countValues.push(filters.status);
      countValueIndex++;
    }
    
    if (filters.isFeatured !== undefined) {
      countQuery += ` AND a.is_featured = $${countValueIndex}`;
      countValues.push(filters.isFeatured);
      countValueIndex++;
    }
    
    const countResult = await executeQuery(countQuery, countValues);
    const total = parseInt(countResult.rows[0].total, 10);
    
    const finalResult = {
      articles,
      total,
      limit,
      offset
    };
    
    // Store in cache for 15 minutes (shorter TTL for dynamic data)
    await cacheManager.set(cacheKey, finalResult, 900);
    
    return finalResult;
  } catch (err) {
    throw err;
  }
};

// Invalidate cache when articles are modified
const invalidateArticleCache = async (articleId) => {
  try {
    // Invalidate specific article cache
    if (articleId) {
      await cacheManager.delete(`article:${articleId}`);
    }
    
    // Invalidate article lists (more complex - might need pattern-based invalidation)
    await cacheManager.invalidatePattern('articles:*');
  } catch (err) {
    console.error('Error invalidating article cache:', err);
  }
};

// Update functions to invalidate cache
const createArticle = async (articleData, authorId) => {
  // ... existing implementation ...
  const article = results[0].rows[0];
  
  // Invalidate cache after creation
  await invalidateArticleCache();
  
  return article;
};

const updateArticle = async (articleId, updateData, authorId) => {
  // ... existing implementation ...
  const article = result.rows[0];
  
  // Invalidate cache after update
  await invalidateArticleCache(articleId);
  
  return article;
};

const deleteArticle = async (articleId, authorId) => {
  // ... existing implementation ...
  const result = result.rows[0];
  
  // Invalidate cache after deletion
  await invalidateArticleCache(articleId);
  
  return result;
};

export {
  createArticle,
  getArticleById,
  getAllArticles,
  updateArticle,
  deleteArticle,
  publishArticle,
  incrementArticleViews,
  searchArticles,
  associateTagsWithArticle
};
```

### 2. Database Monitoring and Alerting

#### Current Issues:
- No monitoring of database performance
- No alerting for performance issues
- Limited visibility into query performance

#### Proposed Solution:
Implement comprehensive database monitoring with alerting.

#### Implementation Plan:
1. Set up monitoring tools (Prometheus, Grafana)
2. Implement custom metrics collection
3. Configure alerting rules
4. Create dashboards for performance visualization

#### Monitoring Implementation:

```javascript
// db-monitor.js
import { pool } from './config/database.js';

class DatabaseMonitor {
  constructor() {
    this.metrics = {
      queryCount: 0,
      totalQueryTime: 0,
      slowQueries: 0,
      errors: 0,
      poolStats: {
        total: 0,
        idle: 0,
        waiting: 0
      }
    };
    
    this.slowQueryThreshold = parseInt(process.env.SLOW_QUERY_THRESHOLD) || 1000; // 1 second
  }
  
  // Wrap query execution with monitoring
  async executeMonitoredQuery(query, values = []) {
    const startTime = Date.now();
    this.metrics.queryCount++;
    
    try {
      const result = await pool.query(query, values);
      const queryTime = Date.now() - startTime;
      this.metrics.totalQueryTime += queryTime;
      
      if (queryTime > this.slowQueryThreshold) {
        this.metrics.slowQueries++;
        console.warn(`Slow query detected (${queryTime}ms): ${query.substring(0, 100)}...`);
      }
      
      return result;
    } catch (err) {
      this.metrics.errors++;
      console.error('Database query error:', err);
      throw err;
    }
  }
  
  // Update pool statistics
  updatePoolStats() {
    this.metrics.poolStats.total = pool.totalCount;
    this.metrics.poolStats.idle = pool.idleCount;
    this.metrics.poolStats.waiting = pool.waitingCount;
  }
  
  // Get current metrics
  getMetrics() {
    return {
      ...this.metrics,
      avgQueryTime: this.metrics.queryCount > 0 ? 
        this.metrics.totalQueryTime / this.metrics.queryCount : 0
    };
  }
  
  // Reset counters (for periodic reporting)
  resetCounters() {
    this.metrics.queryCount = 0;
    this.metrics.totalQueryTime = 0;
    this.metrics.slowQueries = 0;
    this.metrics.errors = 0;
  }
  
  // Start periodic monitoring
  startMonitoring(interval = 30000) {  // Every 30 seconds
    this.intervalId = setInterval(() => {
      this.updatePoolStats();
      const metrics = this.getMetrics();
      console.log('Database metrics:', metrics);
      
      // Check for alert conditions
      if (metrics.poolStats.waiting > 10) {
        console.error('High number of waiting database connections:', metrics.poolStats.waiting);
      }
      
      if (metrics.errors > 5) {
        console.error('High number of database errors:', metrics.errors);
      }
      
      if (metrics.avgQueryTime > 2000) {  // 2 seconds
        console.error('High average query time:', metrics.avgQueryTime);
      }
    }, interval);
  }
  
  // Stop monitoring
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

export default new DatabaseMonitor();
```

### 3. Read Replicas for Scaling

#### Current Issues:
- All database operations use single instance
- Read operations impact write performance
- No horizontal scaling for read-heavy workloads

#### Proposed Solution:
Implement read replicas to scale read operations.

#### Implementation Plan:
1. Set up read replica database instance
2. Update application to route read queries to replicas
3. Implement replica selection strategy
4. Monitor replica performance

#### Read Replica Implementation:

```javascript
// Enhanced database configuration with read replicas
import pkg from 'pg';
import dbConfig from './db.js';

const { Pool } = pkg;

// Primary (write) connection pool
const primaryPool = new Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  password: dbConfig.password,
  ssl: dbConfig.ssl,
  max: dbConfig.max,
  idleTimeoutMillis: dbConfig.idleTimeoutMillis,
  connectionTimeoutMillis: dbConfig.connectionTimeoutMillis,
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
    ssl: dbConfig.ssl,
    max: parseInt(process.env.DB_REPLICA_MAX_CONNECTIONS) || 10,
    idleTimeoutMillis: dbConfig.idleTimeoutMillis,
    connectionTimeoutMillis: dbConfig.connectionTimeoutMillis,
  });
  
  replicaPools.push(replicaPool);
});

// Function to get appropriate pool based on operation type
const getPool = (operationType = 'read') => {
  if (operationType === 'write' || replicaPools.length === 0) {
    return primaryPool;
  }
  
  // Round-robin selection for read replicas
  const randomIndex = Math.floor(Math.random() * replicaPools.length);
  return replicaPools[randomIndex];
};

// Enhanced database utility functions with replica support
const executeQuery = async (query, values = [], operationType = 'read') => {
  const pool = getPool(operationType);
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

const executeTransaction = async (queries) => {
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
    return results;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Database transaction error:', err.stack);
    throw err;
  } finally {
    client.release();
  }
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
export { primaryPool, replicaPools, getPool, executeQuery, executeTransaction, testConnection };
```

### 4. Automated Performance Tuning

#### Current Issues:
- No automated database maintenance
- Statistics not regularly updated
- Indexes not optimized over time

#### Proposed Solution:
Implement automated performance tuning procedures.

#### Implementation Plan:
1. Create automated maintenance scripts
2. Schedule regular ANALYZE and VACUUM operations
3. Implement index optimization procedures
4. Set up performance trend analysis

#### Automated Tuning Implementation:

```sql
-- Create maintenance function
CREATE OR REPLACE FUNCTION perform_maintenance()
RETURNS VOID AS $$
BEGIN
  -- Analyze all tables to update statistics
  EXECUTE 'ANALYZE';
  
  -- Vacuum tables with high update/deletion rates
  -- This is a simplified example - in practice, you'd check pg_stat_user_tables
  -- to identify tables needing vacuum
  
  -- Log maintenance completion
  RAISE NOTICE 'Database maintenance completed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to identify and rebuild fragmented indexes
CREATE OR REPLACE FUNCTION optimize_indexes()
RETURNS VOID AS $$
DECLARE
  index_name TEXT;
  table_name TEXT;
BEGIN
  -- This is a simplified example
  -- In practice, you'd check pg_stat_user_indexes for fragmentation
  
  -- For demonstration, we'll just log
  RAISE NOTICE 'Index optimization analysis completed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job function (would be called by external scheduler)
CREATE OR REPLACE FUNCTION run_daily_maintenance()
RETURNS VOID AS $$
BEGIN
  PERFORM perform_maintenance();
  PERFORM optimize_indexes();
  
  -- Refresh materialized views
  REFRESH MATERIALIZED VIEW CONCURRENTLY article_analytics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_engagement;
  
  RAISE NOTICE 'Daily maintenance completed at %', NOW();
END;
$$ LANGUAGE plpgsql;
```

## Implementation Timeline

### Week 1: Query Result Caching
- Set up Redis instance
- Implement caching layer
- Add cache invalidation strategies
- Test caching performance

### Week 2: Database Monitoring
- Implement monitoring tools
- Set up custom metrics collection
- Configure alerting rules
- Create performance dashboards

### Week 3: Read Replicas
- Set up read replica database instance
- Update application to use replicas
- Implement replica selection strategy
- Test replica performance

### Week 4: Automated Tuning and Final Testing
- Implement automated maintenance scripts
- Schedule regular optimization procedures
- Conduct comprehensive performance testing
- Document all optimizations

## Testing Plan

### Caching Testing:
- [ ] Cache hit/miss ratios are within expected ranges
- [ ] Cache invalidation works correctly
- [ ] Performance improvement is measurable
- [ ] Memory usage is within limits

### Monitoring Testing:
- [ ] Metrics are collected accurately
- [ ] Alerts are triggered appropriately
- [ ] Dashboards display correct information
- [ ] Performance trends are visible

### Read Replica Testing:
- [ ] Read queries are distributed to replicas
- [ ] Write queries use primary database
- [ ] Replica lag is within acceptable limits
- [ ] Failover works correctly

### Automated Tuning Testing:
- [ ] Maintenance procedures run successfully
- [ ] Statistics are updated regularly
- [ ] Index optimization is effective
- [ ] Performance trends show improvement

## Monitoring and Alerting

### Performance Metrics to Monitor:
- Cache hit ratios (> 80%)
- Average query response times (< 50ms for cached, < 200ms for database)
- Database connection pool utilization (< 80%)
- Replica lag (< 1 second)
- Memory usage (< 80%)

### Alerting Thresholds:
- Cache hit ratio < 70%
- Average query time > 500ms
- Connection pool utilization > 90%
- Replica lag > 5 seconds
- Memory usage > 90%

## Rollback Plan

If performance optimizations cause issues:
1. Disable caching layer
2. Revert to single database instance
3. Disable monitoring overhead
4. Suspend automated maintenance
5. Validate system performance
6. Implement fixes and re-deploy

## Success Criteria

Performance optimizations will be considered successful when:
- Query response times are improved by at least 40%
- Cache hit ratio is above 80%
- Database connection pool utilization is optimized
- Read replica distribution is balanced
- Automated maintenance procedures run successfully
- All tests pass successfully
- System performance is improved overall