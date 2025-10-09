# Operational Guide

## Overview
This document provides operational guidance for managing the NEWS4US PostgreSQL database in production environments.

## Installation and Setup

### Prerequisites
- PostgreSQL 12 or higher
- Node.js 14 or higher
- Redis (for caching)
- Sufficient disk space for database and backups

### Database Installation

#### 1. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib

# macOS
brew install postgresql
```

#### 2. Initialize Database
```bash
# Ubuntu/Debian
sudo service postgresql start
sudo -u postgres psql

# CentOS/RHEL
sudo postgresql-setup initdb
sudo systemctl start postgresql

# macOS
brew services start postgresql
```

#### 3. Create Database and User
```sql
-- Connect as superuser
sudo -u postgres psql

-- Create database
CREATE DATABASE news_db;

-- Create user
CREATE USER news_user WITH PASSWORD 'strong_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE news_db TO news_user;
```

### Application Setup

#### 1. Clone Repository
```bash
git clone <repository-url>
cd news4us
```

#### 2. Install Dependencies
```bash
cd backend
npm install
```

#### 3. Configure Environment Variables
Create `.env` file in backend directory:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=news_db
DB_USER=news_user
DB_PASSWORD=strong_password
DB_SSL=false
DB_MAX_CONNECTIONS=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

#### 4. Run Migrations
```bash
cd backend
node migrations/run-migration.js
```

## Configuration

### Database Configuration

#### postgresql.conf
Key settings to optimize:
```conf
# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Checkpoint settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
min_wal_size = 1GB
max_wal_size = 2GB

# Query planner
random_page_cost = 1.1
seq_page_cost = 1.0

# Logging
log_statement = 'all'
log_duration = on
log_min_duration_statement = 1000
```

#### pg_hba.conf
Authentication configuration:
```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5

# SSL connections
hostssl all             all             0.0.0.0/0               md5
```

### Application Configuration

#### Connection Pooling
```javascript
// config/db.js
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'news_db',
  user: process.env.DB_USER || 'news_user',
  password: process.env.DB_PASSWORD || 'strong_password',
  ssl: process.env.DB_SSL || false,
  max: process.env.DB_MAX_CONNECTIONS || 20,
  idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT || 30000,
  connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT || 2000,
};
```

#### SSL Configuration
To enable SSL:
```env
DB_SSL=true
DB_SSL_CA=/path/to/ca.crt
DB_SSL_KEY=/path/to/client.key
DB_SSL_CERT=/path/to/client.crt
```

## Monitoring and Alerting

### Database Monitoring

#### 1. Connection Pool Monitoring
Monitor connection pool metrics:
- Total connections
- Idle connections
- Waiting requests
- Error rates

#### 2. Query Performance Monitoring
Track query performance:
- Response times
- Execution plans
- Resource usage

#### 3. Resource Utilization
Monitor system resources:
- CPU usage
- Memory usage
- Disk I/O
- Network I/O

### Application Monitoring

#### 1. Health Checks
Implement health check endpoints:
```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    const dbHealth = await testDatabaseConnection();
    
    // Check Redis connectivity
    const redisHealth = await testRedisConnection();
    
    // Check other dependencies
    const overallHealth = dbHealth && redisHealth;
    
    res.status(overallHealth ? 200 : 503).json({
      status: overallHealth ? 'healthy' : 'unhealthy',
      database: dbHealth ? 'connected' : 'disconnected',
      redis: redisHealth ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

#### 2. Performance Metrics
Collect performance metrics:
- Request rates
- Response times
- Error rates
- Throughput

### Alerting Configuration

#### Critical Alerts
Configure alerts for critical issues:
- Database connectivity failures
- High connection pool utilization (>90%)
- Slow query performance (>5 seconds)
- High error rates (>5%)

#### Warning Alerts
Configure alerts for warning conditions:
- Moderate connection pool utilization (>80%)
- Moderate query performance (>1 second)
- Moderate error rates (>1%)

## Backup and Recovery

### Backup Strategy

#### 1. Full Backups
Daily full database backups:
```bash
# Full backup
pg_dump -U news_user -h localhost -d news_db > backup_$(date +%Y%m%d).sql

# Compressed backup
pg_dump -U news_user -h localhost -d news_db | gzip > backup_$(date +%Y%m%d).sql.gz
```

#### 2. Incremental Backups
Hourly WAL (Write-Ahead Log) archiving:
```conf
# postgresql.conf
archive_mode = on
archive_command = 'cp %p /path/to/archive/%f'
```

#### 3. Point-in-Time Recovery
Configure for point-in-time recovery:
```conf
# postgresql.conf
wal_level = replica
max_wal_senders = 3
```

### Recovery Procedures

#### 1. Full Database Recovery
```bash
# Stop PostgreSQL
sudo systemctl stop postgresql

# Restore from backup
psql -U news_user -h localhost -d news_db < backup_20251001.sql

# Start PostgreSQL
sudo systemctl start postgresql
```

#### 2. Point-in-Time Recovery
```bash
# Stop PostgreSQL
sudo systemctl stop postgresql

# Create recovery.conf
echo "restore_command = 'cp /path/to/archive/%f %p'" > /var/lib/postgresql/data/recovery.conf
echo "recovery_target_time = '2025-10-01 12:00:00'" >> /var/lib/postgresql/data/recovery.conf

# Start PostgreSQL in recovery mode
sudo systemctl start postgresql

# After recovery, remove recovery.conf
rm /var/lib/postgresql/data/recovery.conf
```

## Maintenance Procedures

### Daily Maintenance

#### 1. Health Check
- Verify database connectivity
- Check connection pool status
- Review recent logs
- Monitor resource utilization

#### 2. Backup Verification
- Verify backup completion
- Test backup restoration
- Check backup integrity

#### 3. Log Review
- Review error logs
- Check for slow queries
- Monitor security events

### Weekly Maintenance

#### 1. Database Statistics Update
```sql
-- Update table statistics
ANALYZE;
```

#### 2. Index Maintenance
```sql
-- Check index usage
SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;

-- Rebuild fragmented indexes if needed
REINDEX INDEX index_name;
```

#### 3. Performance Review
- Review query performance
- Analyze slow queries
- Optimize database configuration

### Monthly Maintenance

#### 1. Comprehensive Performance Review
- Analyze long-term performance trends
- Review resource utilization patterns
- Optimize database configuration

#### 2. Security Audit
- Review user privileges
- Check for unauthorized access
- Update security policies

#### 3. Documentation Update
- Update operational documentation
- Document configuration changes
- Review best practices

## Troubleshooting

### Common Issues

#### 1. Connection Pool Exhaustion
**Symptoms:**
- "Timeout acquiring a connection" errors
- High waiting requests
- Slow application performance

**Solutions:**
- Increase connection pool size
- Optimize query performance
- Implement connection timeouts
- Monitor for connection leaks

#### 2. Slow Query Performance
**Symptoms:**
- High query response times
- Increased connection acquisition times
- Poor application performance

**Solutions:**
- Analyze query execution plans
- Optimize database indexes
- Implement query caching
- Scale database resources

#### 3. Database Connectivity Issues
**Symptoms:**
- "Connection refused" errors
- "Network is unreachable" errors
- Intermittent connectivity

**Solutions:**
- Check database server status
- Verify network connectivity
- Check firewall settings
- Review authentication configuration

### Diagnostic Commands

#### 1. Check Database Status
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database connectivity
pg_isready -U news_user -h localhost -d news_db
```

#### 2. Analyze Query Performance
```sql
-- Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check active connections
SELECT pid, usename, application_name, client_addr, state, query
FROM pg_stat_activity
WHERE state = 'active';
```

#### 3. Monitor Resource Usage
```sql
-- Check table sizes
SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) AS size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Check index usage
SELECT relname, indexrelname, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_tup_read DESC;
```

## Security Procedures

### User Management

#### 1. Create New User
```sql
-- Create user with specific privileges
CREATE ROLE new_user WITH LOGIN PASSWORD 'strong_password';
GRANT USAGE ON SCHEMA public TO new_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO new_user;
```

#### 2. Revoke User Privileges
```sql
-- Revoke specific privileges
REVOKE INSERT, UPDATE, DELETE ON TABLE articles FROM user_name;

-- Revoke all privileges
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM user_name;
```

#### 3. Change User Password
```sql
-- Change user password
ALTER USER user_name WITH PASSWORD 'new_strong_password';
```

### Security Auditing

#### 1. Review User Privileges
```sql
-- List all users and their privileges
SELECT r.rolname, r.rolsuper, r.rolinherit, r.rolcreaterole, r.rolcreatedb, r.rolcanlogin
FROM pg_catalog.pg_roles r
WHERE r.rolname !~ '^pg_'
ORDER BY 1;
```

#### 2. Check for Unauthorized Access
```sql
-- Check recent connections
SELECT usename, application_name, client_addr, backend_start, state
FROM pg_stat_activity
WHERE backend_start > NOW() - INTERVAL '1 hour'
ORDER BY backend_start DESC;
```

#### 3. Review Audit Logs
```sql
-- Check recent audit log entries
SELECT table_name, operation, user_id, timestamp
FROM audit_log
WHERE timestamp > NOW() - INTERVAL '1 hour'
ORDER BY timestamp DESC;
```

## Disaster Recovery

### Recovery Plan

#### 1. Incident Response
- Identify the issue
- Assess impact
- Activate recovery procedures
- Communicate with stakeholders

#### 2. Data Recovery
- Restore from latest backup
- Apply transaction logs
- Validate data integrity
- Test application functionality

#### 3. Service Restoration
- Bring database online
- Verify application connectivity
- Monitor system performance
- Resume normal operations

### Business Continuity

#### 1. High Availability
- Configure database replication
- Implement load balancing
- Set up automatic failover
- Test failover procedures

#### 2. Backup Strategy
- Daily full backups
- Hourly incremental backups
- Off-site backup storage
- Regular backup testing

## Conclusion

This operational guide provides comprehensive procedures for managing the NEWS4US PostgreSQL database in production environments. Following these procedures will ensure reliable, secure, and high-performance database operations.