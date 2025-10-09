# Maintenance Procedures

## Overview
This document provides detailed maintenance procedures for the NEWS4US PostgreSQL database to ensure optimal performance, reliability, and security.

## Daily Maintenance Tasks

### 1. Health Check
Perform daily health checks to ensure system stability.

**Procedure:**
1. Verify database connectivity
2. Check connection pool status
3. Review recent error logs
4. Monitor resource utilization

**Commands:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database connectivity
pg_isready -U news_user -h localhost -d news_db

# Check active connections
psql -U news_user -h localhost -d news_db -c "SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active';"
```

### 2. Backup Verification
Verify that backups are completed successfully.

**Procedure:**
1. Check backup completion status
2. Test backup restoration (sample)
3. Verify backup integrity

**Commands:**
```bash
# Check backup directory
ls -la /path/to/backups/

# Verify backup file integrity
pg_restore --list backup_$(date +%Y%m%d).sql.gz > /dev/null
```

### 3. Log Review
Review system and database logs for errors or warnings.

**Procedure:**
1. Check PostgreSQL error logs
2. Review application logs
3. Look for slow queries
4. Monitor security events

**Commands:**
```bash
# Check PostgreSQL logs
tail -n 100 /var/log/postgresql/postgresql-*.log

# Check for recent errors
grep -i "error\|warning" /var/log/postgresql/postgresql-*.log | tail -n 10
```

### 4. Performance Monitoring
Monitor key performance metrics.

**Procedure:**
1. Check query response times
2. Monitor connection pool utilization
3. Review cache hit ratios
4. Check resource utilization

**Commands:**
```sql
-- Check active connections
SELECT COUNT(*) as active_connections FROM pg_stat_activity WHERE state = 'active';

-- Check connection pool status
SELECT 
  COUNT(*) as total_connections,
  COUNT(*) FILTER (WHERE state = 'active') as active_connections,
  COUNT(*) FILTER (WHERE state = 'idle') as idle_connections
FROM pg_stat_activity;
```

## Weekly Maintenance Tasks

### 1. Database Statistics Update
Update table statistics for optimal query planning.

**Procedure:**
1. Run ANALYZE on all tables
2. Verify statistics update completion
3. Monitor query plan improvements

**Commands:**
```sql
-- Update statistics for all tables
ANALYZE;

-- Update statistics for specific table
ANALYZE articles;

-- Check last analyze time
SELECT schemaname, tablename, last_analyze, last_autoanalyze
FROM pg_stat_user_tables
ORDER BY last_analyze DESC NULLS LAST, last_autoanalyze DESC NULLS LAST;
```

### 2. Index Maintenance
Maintain database indexes for optimal performance.

**Procedure:**
1. Check index usage statistics
2. Identify unused indexes
3. Rebuild fragmented indexes
4. Create missing indexes

**Commands:**
```sql
-- Check unused indexes
SELECT 
  schemaname, 
  tablename, 
  indexname, 
  idx_scan, 
  idx_tup_read, 
  idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE idx_scan = 0
ORDER BY schemaname, tablename;

-- Check index sizes
SELECT 
  schemaname, 
  tablename, 
  indexname, 
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes 
JOIN pg_class ON pg_class.oid = indexrelid
ORDER BY pg_relation_size(indexrelid) DESC;

-- Rebuild specific index
REINDEX INDEX idx_articles_searchable;
```

### 3. Performance Review
Conduct comprehensive performance review.

**Procedure:**
1. Analyze slow queries
2. Review resource utilization
3. Check for bottlenecks
4. Optimize configurations

**Commands:**
```sql
-- Check slow queries (requires pg_stat_statements extension)
SELECT 
  query, 
  calls, 
  total_time, 
  mean_time, 
  rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check table bloat
SELECT 
  schemaname, 
  tablename, 
  pg_size_pretty(pg_total_relation_size(relid)) as total_size,
  pg_size_pretty(pg_relation_size(relid)) as table_size,
  pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) as index_size
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

### 4. Security Audit
Perform security audit of database access.

**Procedure:**
1. Review user privileges
2. Check for unauthorized access
3. Verify audit log completeness
4. Update security policies

**Commands:**
```sql
-- List all database users and roles
SELECT rolname, rolsuper, rolcanlogin, rolcreatedb, rolcreaterole
FROM pg_roles
WHERE rolname NOT LIKE 'pg_%'
ORDER BY rolname;

-- Check user table privileges
SELECT 
  grantee, 
  table_schema, 
  table_name, 
  privilege_type
FROM information_schema.table_privileges
WHERE grantee NOT IN ('postgres', 'PUBLIC')
ORDER BY grantee, table_schema, table_name;

-- Check recent audit log entries
SELECT 
  table_name, 
  operation, 
  user_id, 
  timestamp
FROM audit_log
WHERE timestamp > NOW() - INTERVAL '1 week'
ORDER BY timestamp DESC
LIMIT 100;
```

## Monthly Maintenance Tasks

### 1. Comprehensive Performance Review
Conduct detailed performance analysis.

**Procedure:**
1. Analyze long-term performance trends
2. Review resource utilization patterns
3. Optimize database configuration
4. Plan capacity upgrades

**Commands:**
```sql
-- Check database size growth
SELECT 
  pg_size_pretty(pg_database_size(current_database())) as database_size,
  pg_size_pretty(pg_tablespace_size('pg_default')) as tablespace_size;

-- Check table growth trends
SELECT 
  schemaname, 
  tablename, 
  pg_size_pretty(pg_total_relation_size(relid)) as total_size,
  pg_stat_file('base/' || relfilenode, true).modification as last_modified
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Check query performance trends
SELECT 
  date_trunc('day', last_execution_time) as day,
  COUNT(*) as query_count,
  AVG(mean_time) as avg_execution_time
FROM (
  SELECT 
    query, 
    last_execution_time, 
    mean_time
  FROM pg_stat_statements
  WHERE last_execution_time > NOW() - INTERVAL '1 month'
) as daily_stats
GROUP BY date_trunc('day', last_execution_time)
ORDER BY day;
```

### 2. Security Compliance Review
Ensure compliance with security policies.

**Procedure:**
1. Review access controls
2. Verify encryption settings
3. Check audit log completeness
4. Update security documentation

**Commands:**
```sql
-- Check SSL connection status
SELECT 
  pid, 
  usename, 
  application_name, 
  client_addr, 
  ssl, 
  sslversion, 
  sslcipher
FROM pg_stat_ssl 
JOIN pg_stat_activity USING (pid)
WHERE ssl = true;

-- Check for weak passwords (conceptual - actual implementation would vary)
-- This would typically be done through application-level password policies

-- Review audit log retention
SELECT 
  COUNT(*) as total_audit_entries,
  MIN(timestamp) as oldest_entry,
  MAX(timestamp) as newest_entry
FROM audit_log;
```

### 3. Backup and Recovery Testing
Test backup and recovery procedures.

**Procedure:**
1. Perform full backup restoration test
2. Test point-in-time recovery
3. Verify data integrity
4. Document test results

**Commands:**
```bash
# Test backup restoration (to temporary database)
createdb news_db_test
pg_restore -U news_user -h localhost -d news_db_test backup_$(date +%Y%m%d).sql.gz

# Verify data integrity
psql -U news_user -h localhost -d news_db_test -c "SELECT COUNT(*) FROM users;"
psql -U news_user -h localhost -d news_db_test -c "SELECT COUNT(*) FROM articles;"

# Clean up test database
dropdb news_db_test
```

### 4. Documentation Update
Update maintenance documentation.

**Procedure:**
1. Review and update procedures
2. Document configuration changes
3. Update best practices
4. Archive old documentation

## Quarterly Maintenance Tasks

### 1. Database Upgrade Planning
Plan for database version upgrades.

**Procedure:**
1. Check current PostgreSQL version
2. Review release notes for newer versions
3. Plan upgrade timeline
4. Test upgrade in staging environment

**Commands:**
```sql
-- Check current PostgreSQL version
SELECT version();

-- Check extension versions
SELECT name, default_version, installed_version
FROM pg_available_extensions
WHERE installed_version IS NOT NULL;
```

### 2. Capacity Planning
Plan for future capacity needs.

**Procedure:**
1. Analyze growth trends
2. Project future resource needs
3. Plan hardware upgrades
4. Optimize database schema

**Commands:**
```sql
-- Check disk space usage
SELECT 
  pg_size_pretty(pg_database_size(current_database())) as database_size,
  pg_size_pretty(pg_tablespace_size('pg_default')) as tablespace_size;

-- Check table growth projections
SELECT 
  schemaname, 
  tablename, 
  pg_size_pretty(pg_total_relation_size(relid)) as current_size,
  pg_size_pretty(pg_total_relation_size(relid) * 1.1) as projected_3mo_size,
  pg_size_pretty(pg_total_relation_size(relid) * 1.2) as projected_6mo_size
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

### 3. Security Assessment
Conduct comprehensive security assessment.

**Procedure:**
1. Perform penetration testing
2. Review access controls
3. Update security policies
4. Conduct security training

### 4. Performance Tuning
Optimize database performance.

**Procedure:**
1. Analyze query execution plans
2. Optimize database configuration
3. Implement advanced indexing
4. Review caching strategies

## Annual Maintenance Tasks

### 1. Comprehensive System Review
Conduct annual system review.

**Procedure:**
1. Review all maintenance procedures
2. Update documentation
3. Assess system architecture
4. Plan major upgrades

### 2. Compliance Audit
Ensure regulatory compliance.

**Procedure:**
1. Conduct compliance audit
2. Update compliance documentation
3. Address compliance gaps
4. Prepare compliance reports

### 3. Disaster Recovery Testing
Test complete disaster recovery.

**Procedure:**
1. Simulate complete system failure
2. Execute disaster recovery plan
3. Verify data recovery
4. Document test results

### 4. Technology Refresh Planning
Plan for technology upgrades.

**Procedure:**
1. Assess current technology
2. Evaluate new technologies
3. Plan upgrade roadmap
4. Budget for upgrades

## Automated Maintenance Scripts

### Daily Health Check Script
```bash
#!/bin/bash
# daily_health_check.sh

# Check PostgreSQL status
if ! pg_isready -U news_user -h localhost -d news_db > /dev/null 2>&1; then
  echo "ERROR: PostgreSQL is not responding" | mail -s "Database Alert" admin@news4us.com
  exit 1
fi

# Check active connections
active_connections=$(psql -U news_user -h localhost -d news_db -t -c "SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active';" | xargs)
if [ "$active_connections" -gt 50 ]; then
  echo "WARNING: High number of active connections: $active_connections" | mail -s "Database Alert" admin@news4us.com
fi

# Check for errors in logs
error_count=$(grep -i "error" /var/log/postgresql/postgresql-*.log | tail -n 100 | wc -l)
if [ "$error_count" -gt 0 ]; then
  echo "WARNING: $error_count errors found in logs" | mail -s "Database Alert" admin@news4us.com
fi

echo "Daily health check completed successfully"
```

### Weekly Statistics Update Script
```bash
#!/bin/bash
# weekly_analyze.sh

# Update database statistics
psql -U news_user -h localhost -d news_db -c "ANALYZE;" > /dev/null 2>&1

# Log completion
echo "$(date): Weekly statistics update completed" >> /var/log/database_maintenance.log
```

### Monthly Index Maintenance Script
```bash
#!/bin/bash
# monthly_index_maintenance.sh

# Rebuild fragmented indexes
psql -U news_user -h localhost -d news_db -c "
DO \$\$
DECLARE
  index_name text;
BEGIN
  FOR index_name IN 
    SELECT indexname 
    FROM pg_stat_user_indexes 
    WHERE idx_scan > 1000 AND (idx_tup_read = 0 OR idx_tup_read::float / idx_scan < 0.1)
  LOOP
    EXECUTE 'REINDEX INDEX ' || quote_ident(index_name);
    RAISE NOTICE 'Reindexed %', index_name;
  END LOOP;
END;
\$\$;" > /dev/null 2>&1

# Log completion
echo "$(date): Monthly index maintenance completed" >> /var/log/database_maintenance.log
```

## Maintenance Scheduling

### Cron Job Configuration
Schedule maintenance tasks using cron.

**Crontab Entries:**
```bash
# Daily health check at 6 AM
0 6 * * * /path/to/daily_health_check.sh

# Weekly statistics update on Sundays at 2 AM
0 2 * * 0 /path/to/weekly_analyze.sh

# Monthly index maintenance on first day of month at 3 AM
0 3 1 * * /path/to/monthly_index_maintenance.sh

# Quarterly performance review on first day of January, April, July, October at 4 AM
0 4 1 1,4,7,10 * /path/to/quarterly_performance_review.sh
```

## Maintenance Windows

### Recommended Maintenance Windows
Schedule maintenance during low-traffic periods.

**Windows:**
- **Daily Maintenance**: 6:00 AM - 6:30 AM
- **Weekly Maintenance**: Sunday 2:00 AM - 4:00 AM
- **Monthly Maintenance**: First day of month 3:00 AM - 5:00 AM
- **Quarterly Maintenance**: First day of quarter 4:00 AM - 8:00 AM

## Maintenance Notifications

### Alert Configuration
Configure notifications for maintenance events.

**Notification Types:**
- Maintenance completion
- Maintenance failures
- Performance alerts
- Security alerts

**Notification Methods:**
- Email alerts
- SMS notifications
- Slack notifications
- PagerDuty integration

## Conclusion

This maintenance procedures document provides a comprehensive framework for maintaining the NEWS4US PostgreSQL database. Following these procedures will ensure optimal performance, reliability, and security of the database system.