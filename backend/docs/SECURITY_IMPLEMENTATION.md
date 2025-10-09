# Security Implementation Documentation

## Overview
This document provides comprehensive documentation for the security measures implemented in the NEWS4US PostgreSQL database.

## Role-Based Access Control

### Database Roles

#### 1. app_user
Application user with read/write access to application tables.

**Privileges:**
- SELECT, INSERT, UPDATE, DELETE on all application tables
- USAGE, SELECT on all sequences
- Cannot create or modify database schema
- Cannot access administrative functions

**Usage:**
This role is used by the application for all data manipulation operations.

#### 2. read_only_user
Read-only user for analytics and reporting.

**Privileges:**
- SELECT on all tables
- Cannot modify any data
- Cannot create or modify database schema
- Ideal for reporting and analytics queries

**Usage:**
This role is used for analytics queries and reporting tools to prevent accidental data modification.

#### 3. admin_user
Administrative user for schema changes and maintenance.

**Privileges:**
- ALL PRIVILEGES on all database objects
- Can create/modify/drop tables, indexes, functions
- Should be used only for administrative tasks

**Usage:**
This role is used for database schema changes, maintenance operations, and administrative tasks.

#### 4. audit_user
Specialized user for audit logging operations.

**Privileges:**
- INSERT on audit_log table
- Cannot read or modify application data
- Limited privileges focused on audit functionality

**Usage:**
This role is used by the audit logging system to insert audit records.

### Role Creation SQL
```sql
-- Create application user with limited privileges
CREATE ROLE app_user WITH LOGIN PASSWORD 'strong_app_password_123';
COMMENT ON ROLE app_user IS 'Application user with read/write access to application tables';

-- Create read-only user for analytics
CREATE ROLE read_only_user WITH LOGIN PASSWORD 'strong_read_password_123';
COMMENT ON ROLE read_only_user IS 'Read-only user for analytics and reporting';

-- Create admin user for schema changes
CREATE ROLE admin_user WITH LOGIN PASSWORD 'strong_admin_password_123';
COMMENT ON ROLE admin_user IS 'Administrative user for schema changes and maintenance';

-- Create audit user for audit logging
CREATE ROLE audit_user WITH LOGIN PASSWORD 'strong_audit_password_123';
COMMENT ON ROLE audit_user IS 'User for audit logging operations';

-- Grant appropriate privileges to each role

-- Grant SELECT, INSERT, UPDATE, DELETE on all current and future tables in public schema to app_user
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_user;

-- Grant SELECT on all current and future tables in public schema to read_only_user
GRANT USAGE ON SCHEMA public TO read_only_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO read_only_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO read_only_user;

-- Grant all privileges on schema to admin_user
GRANT ALL PRIVILEGES ON SCHEMA public TO admin_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO admin_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO admin_user;

## Audit Logging System

### Components

#### 1. audit_log Table
Central repository for all audit events.

**Columns:**
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| table_name | VARCHAR(50) | Name of table where operation occurred |
| operation | VARCHAR(10) | Type of operation (INSERT, UPDATE, DELETE) |
| row_id | INTEGER | ID of affected row |
| old_values | JSONB | Previous values (for UPDATE/DELETE) |
| new_values | JSONB | New values (for INSERT/UPDATE) |
| user_id | INTEGER | ID of user performing operation |
| timestamp | TIMESTAMP WITH TIME ZONE | When operation occurred |
| transaction_id | BIGINT | Database transaction ID |

**Indexes:**
- audit_log_pkey (PRIMARY KEY)
- idx_audit_log_table_name
- idx_audit_log_operation
- idx_audit_log_user_id
- idx_audit_log_timestamp
- idx_audit_log_transaction_id

#### 2. audit_trigger_func Function
PostgreSQL function that captures audit events.

**Definition:**
```sql
CREATE OR REPLACE FUNCTION audit_trigger_func() RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_log (table_name, operation, row_id, old_values, user_id, transaction_id)
    VALUES (TG_TABLE_NAME, TG_OP, OLD.id, to_jsonb(OLD), 
            COALESCE(NULLIF(current_setting('app.current_user_id', true), ''), '0')::integer,
            txid_current());
    RETURN OLD;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_log (table_name, operation, row_id, new_values, user_id, transaction_id)
    VALUES (TG_TABLE_NAME, TG_OP, NEW.id, to_jsonb(NEW),
            COALESCE(NULLIF(current_setting('app.current_user_id', true), ''), '0')::integer,
            txid_current());
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_log (table_name, operation, row_id, old_values, new_values, user_id, transaction_id)
    VALUES (TG_TABLE_NAME, TG_OP, NEW.id, to_jsonb(OLD), to_jsonb(NEW),
            COALESCE(NULLIF(current_setting('app.current_user_id', true), ''), '0')::integer,
            txid_current());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

#### 3. Table Triggers
Audit triggers installed on all sensitive tables.

**Tables with Audit Triggers:**
- users
- articles
- user_profiles
- user_preferences
- comments
- media_assets
- categories

**Trigger Creation Example:**
```sql
CREATE TRIGGER users_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

### Audit Logging Features

#### 1. Automatic Logging
- All INSERT, UPDATE, and DELETE operations are automatically logged
- No application code changes required
- Consistent logging across all tables

#### 2. User Context
- Captures user ID through session variables
- Tracks which user performed each operation
- User context is automatically associated with audit events

#### 3. Data Serialization
- Old and new values are serialized as JSONB
- Complete record of data changes
- Easy querying and analysis of audit data

#### 4. Transaction Tracking
- Transaction IDs are captured for correlation
- Related operations can be grouped
- ACID compliance is maintained

### Audit Log Query Examples

#### 1. Find all operations by a specific user
```sql
SELECT * FROM audit_log 
WHERE user_id = 123 
ORDER BY timestamp DESC;
```

#### 2. Find all changes to a specific table
```sql
SELECT * FROM audit_log 
WHERE table_name = 'users' 
ORDER BY timestamp DESC;
```

#### 3. Find all operations within a time range
```sql
SELECT * FROM audit_log 
WHERE timestamp BETWEEN '2025-10-01 00:00:00' AND '2025-10-01 23:59:59'
ORDER BY timestamp DESC;
```

#### 4. Find all DELETE operations
```sql
SELECT * FROM audit_log 
WHERE operation = 'DELETE'
ORDER BY timestamp DESC;
```

## SSL Encryption

### Configuration
SSL encryption can be enabled for secure database connections.

**Environment Variables:**
| Variable | Description |
|----------|-------------|
| DB_SSL | Enable SSL (true/false) |
| DB_SSL_CA | Certificate Authority certificate file path |
| DB_SSL_KEY | Client private key file path |
| DB_SSL_CERT | Client certificate file path |

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

## Password Security

### Best Practices
1. Use strong, complex passwords
2. Rotate passwords regularly
3. Never store passwords in plain text
4. Use environment variables for password storage
5. Implement password policies

### Password Policy Recommendations
- Minimum 12 characters
- Include uppercase and lowercase letters
- Include numbers and special characters
- No dictionary words
- Regular rotation (every 90 days)

## Security Monitoring

### Audit Log Monitoring
- Regular review of audit logs
- Alerting on suspicious activities
- Analysis of access patterns
- Compliance reporting

### Connection Monitoring
- Monitor connection pool utilization
- Track connection acquisition times
- Alert on connection failures
- Monitor for unauthorized access

## Compliance

### GDPR Compliance
- User data can be exported upon request
- Data deletion procedures are implemented
- Personal data is protected with encryption
- Audit logs maintain access records

### Other Regulations
- HIPAA compliance (if applicable)
- SOX compliance (if applicable)
- Industry-specific regulations

## Security Testing

### Penetration Testing
- Regular vulnerability scanning
- SQL injection testing
- Privilege escalation testing
- Authentication mechanism testing

### Security Audits
- Regular security audits
- Access control reviews
- Configuration reviews
- Compliance verification

## Conclusion

This security implementation provides a comprehensive security framework for the NEWS4US PostgreSQL database. The role-based access control, audit logging system, SSL encryption, and monitoring capabilities ensure data protection and compliance.