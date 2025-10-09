# Troubleshooting Guide

## Overview
This document provides comprehensive troubleshooting guidance for common issues that may occur with the NEWS4US PostgreSQL database and application.

## Database Connectivity Issues

### 1. Connection Refused

**Symptoms:**
- "Connection refused" errors
- "could not connect to server" messages
- Application unable to connect to database

**Causes:**
- PostgreSQL service not running
- Incorrect host/port configuration
- Firewall blocking connections
- Network connectivity issues

**Solutions:**

#### Check PostgreSQL Service Status
```bash
# Ubuntu/Debian
sudo systemctl status postgresql

# CentOS/RHEL
sudo systemctl status postgresql

# macOS
brew services list | grep postgresql
```

#### Start PostgreSQL Service
```bash
# Ubuntu/Debian
sudo systemctl start postgresql

# CentOS/RHEL
sudo systemctl start postgresql

# macOS
brew services start postgresql
```

#### Verify Connection Settings
Check `.env` file configuration:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=news_db
DB_USER=news_user
DB_PASSWORD=strong_password
```

#### Test Database Connectivity
```bash
# Test with pg_isready
pg_isready -U news_user -h localhost -d news_db

# Test with psql
psql -U news_user -h localhost -d news_db -c "SELECT 1;"
```

#### Check Firewall Settings
```bash
# Ubuntu/Debian
sudo ufw status

# CentOS/RHEL
sudo firewall-cmd --list-all

# Check if port 5432 is open
sudo netstat -tlnp | grep 5432
```

### 2. Authentication Failed

**Symptoms:**
- "password authentication failed" errors
- "authentication failed for user" messages
- Access denied to database

**Causes:**
- Incorrect username/password
- User does not exist
- Authentication method misconfiguration

**Solutions:**

#### Verify User Credentials
Check `.env` file:
```env
DB_USER=news_user
DB_PASSWORD=strong_password
```

#### Reset User Password
```sql
-- Connect as superuser
sudo -u postgres psql

-- Reset password
ALTER USER news_user WITH PASSWORD 'new_strong_password';
```

#### Check Authentication Configuration
Review `pg_hba.conf`:
```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

#### Reload Configuration
```bash
sudo systemctl reload postgresql
```

### 3. SSL Connection Issues

**Symptoms:**
- "SSL connection failed" errors
- "certificate verify failed" messages
- SSL handshake failures

**Causes:**
- SSL not properly configured
- Certificate files missing or invalid
- SSL settings mismatch

**Solutions:**

#### Disable SSL (for testing)
Update `.env` file:
```env
DB_SSL=false
```

#### Configure SSL Properly
Update `.env` file:
```env
DB_SSL=true
DB_SSL_CA=/path/to/ca.crt
DB_SSL_KEY=/path/to/client.key
DB_SSL_CERT=/path/to/client.crt
```

#### Verify Certificate Files
```bash
# Check if files exist
ls -la /path/to/ca.crt /path/to/client.key /path/to/client.crt

# Check certificate validity
openssl x509 -in /path/to/ca.crt -text -noout
openssl x509 -in /path/to/client.crt -text -noout
```

## Performance Issues

### 1. Slow Query Performance

**Symptoms:**
- Long response times for database queries
- Application timeouts
- High CPU usage

**Causes:**
- Missing indexes
- Inefficient queries
- High database load
- Insufficient resources

**Solutions:**

#### Analyze Query Execution Plans
```sql
-- Enable query analysis
EXPLAIN ANALYZE SELECT * FROM articles WHERE author_id = 123;

-- Check for sequential scans
EXPLAIN SELECT * FROM articles WHERE title LIKE '%technology%';
```

#### Identify Missing Indexes
```sql
-- Check for sequential scans on large tables
SELECT 
  schemaname, 
  tablename, 
  seq_scan, 
  seq_tup_read, 
  idx_scan
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC;
```

#### Create Missing Indexes
```sql
-- Create index on frequently queried columns
CREATE INDEX idx_articles_author_id ON articles(author_id);

-- Create composite index for multiple column queries
CREATE INDEX idx_articles_author_status ON articles(author_id, status);

-- Create partial index for filtered queries
CREATE INDEX idx_articles_published ON articles(published_at) WHERE status = 'published';
```

#### Update Database Statistics
```sql
-- Update statistics for query planner
ANALYZE;

-- Update statistics for specific table
ANALYZE articles;
```

### 2. Connection Pool Exhaustion

**Symptoms:**
- "Timeout acquiring a connection" errors
- "Connection pool is full" messages
- Application performance degradation

**Causes:**
- Too many concurrent connections
- Connection leaks
- Long-running queries
- Insufficient pool size

**Solutions:**

#### Check Connection Pool Status
```sql
-- Check active connections
SELECT 
  COUNT(*) as total_connections,
  COUNT(*) FILTER (WHERE state = 'active') as active_connections,
  COUNT(*) FILTER (WHERE state = 'idle') as idle_connections
FROM pg_stat_activity;

-- Check connection details
SELECT 
  pid, 
  usename, 
  application_name, 
  client_addr, 
  state, 
  query
FROM pg_stat_activity
WHERE state = 'active';
```

#### Increase Connection Pool Size
Update configuration in `config/db.js`:
```javascript
const dbConfig = {
  // ... other settings
  max: 30,  // Increase from default 20
  // ... other settings
};
```

#### Identify Connection Leaks
```sql
-- Check for long-running connections
SELECT 
  pid, 
  usename, 
  application_name, 
  client_addr, 
  backend_start, 
  state_change, 
  state, 
  query
FROM pg_stat_activity
WHERE backend_start < NOW() - INTERVAL '1 hour'
ORDER BY backend_start;
```

#### Optimize Long-Running Queries
```sql
-- Find slow queries (requires pg_stat_statements)
SELECT 
  query, 
  calls, 
  total_time, 
  mean_time, 
  rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### 3. High Memory Usage

**Symptoms:**
- Database consuming excessive memory
- System performance degradation
- Out of memory errors

**Causes:**
- Inefficient memory settings
- Large result sets
- Memory leaks
- Insufficient system memory

**Solutions:**

#### Check Memory Usage
```sql
-- Check current memory settings
SHOW shared_buffers;
SHOW work_mem;
SHOW maintenance_work_mem;
SHOW effective_cache_size;
```

#### Optimize Memory Settings
Update `postgresql.conf`:
```conf
# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
```

#### Monitor Memory Usage
```bash
# Check system memory usage
free -h

# Check PostgreSQL memory usage
ps aux | grep postgres | awk '{print $2}' | xargs ps -o pid,vsz,rss,comm
```

#### Optimize Queries to Reduce Memory Usage
```sql
-- Use LIMIT to reduce result set size
SELECT * FROM articles ORDER BY created_at DESC LIMIT 100;

-- Use pagination for large result sets
SELECT * FROM articles ORDER BY created_at DESC LIMIT 50 OFFSET 0;
```

## Data Integrity Issues

### 1. Missing Data

**Symptoms:**
- Expected data not found
- Inconsistent data across tables
- Foreign key constraint violations

**Causes:**
- Failed transactions
- Application errors
- Manual data deletion
- Database corruption

**Solutions:**

#### Check for Missing Records
```sql
-- Check for orphaned records
SELECT a.id, a.title
FROM articles a
LEFT JOIN users u ON a.author_id = u.id
WHERE u.id IS NULL;

-- Check for missing related data
SELECT u.id, u.name
FROM users u
LEFT JOIN articles a ON u.id = a.author_id
WHERE a.author_id IS NULL;
```

#### Restore from Backup
```bash
# Stop PostgreSQL
sudo systemctl stop postgresql

# Restore from backup
psql -U news_user -h localhost -d news_db < backup_file.sql

# Start PostgreSQL
sudo systemctl start postgresql
```

#### Implement Data Validation
```sql
-- Add constraints to prevent data integrity issues
ALTER TABLE articles 
ADD CONSTRAINT fk_articles_author_id 
FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add check constraints
ALTER TABLE articles 
ADD CONSTRAINT chk_articles_status 
CHECK (status IN ('draft', 'published', 'deleted'));
```

### 2. Duplicate Data

**Symptoms:**
- Multiple records with same data
- Inconsistent reports
- Data validation errors

**Causes:**
- Application bugs
- Failed deduplication
- Manual data entry errors
- Missing unique constraints

**Solutions:**

#### Identify Duplicate Records
```sql
-- Find duplicate users by email
SELECT email, COUNT(*) as count
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- Find duplicate articles by title and author
SELECT title, author_id, COUNT(*) as count
FROM articles
GROUP BY title, author_id
HAVING COUNT(*) > 1;
```

#### Remove Duplicate Records
```sql
-- Remove duplicate users (keep the one with lowest ID)
DELETE FROM users
WHERE id NOT IN (
  SELECT MIN(id)
  FROM users
  GROUP BY email
);

-- Remove duplicate articles (keep the one with lowest ID)
DELETE FROM articles
WHERE id NOT IN (
  SELECT MIN(id)
  FROM articles
  GROUP BY title, author_id
);
```

#### Prevent Future Duplicates
```sql
-- Add unique constraints
ALTER TABLE users 
ADD CONSTRAINT uk_users_email 
UNIQUE (email);

-- Add composite unique constraint
ALTER TABLE article_tags 
ADD CONSTRAINT uk_article_tags 
UNIQUE (article_id, tag_id);
```

## Security Issues

### 1. Unauthorized Access

**Symptoms:**
- Unexpected data access
- Security audit violations
- Unknown user accounts
- Suspicious database activity

**Causes:**
- Weak passwords
- Misconfigured permissions
- Unsecured network access
- Compromised credentials

**Solutions:**

#### Review User Accounts
```sql
-- List all database users
SELECT rolname, rolsuper, rolcanlogin, rolcreatedb, rolcreaterole
FROM pg_roles
WHERE rolname NOT LIKE 'pg_%'
ORDER BY rolname;

-- Check for unauthorized users
SELECT rolname
FROM pg_roles
WHERE rolname NOT IN ('postgres', 'news_user', 'app_user', 'read_only_user', 'admin_user', 'audit_user');
```

#### Revoke Unauthorized Access
```sql
-- Revoke specific privileges
REVOKE INSERT, UPDATE, DELETE ON TABLE articles FROM unauthorized_user;

-- Drop unauthorized users
DROP ROLE IF EXISTS unauthorized_user;
```

#### Implement Stronger Security
```sql
-- Enforce password complexity
-- (This would typically be done at the application level or with extensions)

-- Enable SSL connections
-- Update postgresql.conf
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'

-- Update pg_hba.conf
hostssl all all 0.0.0.0/0 md5
```

### 2. Audit Log Issues

**Symptoms:**
- Missing audit records
- Incomplete audit trails
- Audit log corruption
- Performance impact from auditing

**Causes:**
-