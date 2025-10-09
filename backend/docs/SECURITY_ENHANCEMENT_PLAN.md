# Security Enhancement Plan

## Current Security Status

Based on our Phase 1 assessment, the current security posture has these characteristics:

- PostgreSQL version 18.0 (current)
- SSL disabled (major security risk)
- Two database roles: postgres (superuser) and news_user
- Public schema access properly configured
- Currently 1 active connection

## Proposed Security Enhancements

### 1. Enable SSL Encryption

#### Implementation Steps:
1. Generate SSL certificates (or obtain from certificate authority)
2. Configure PostgreSQL to require SSL connections
3. Update application connection strings to use SSL
4. Test SSL connectivity
5. Disable non-SSL connections

#### Configuration Changes:
```sql
-- postgresql.conf changes
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
ssl_ca_file = 'ca.crt'

-- pg_hba.conf changes
hostssl all all 0.0.0.0/0 md5
```

### 2. Implement Role-Based Access Control

#### Current Roles:
- postgres (superuser)
- news_user (application user)

#### Proposed New Roles:
- app_user: Read/write access to application tables
- read_only_user: Read-only access for analytics
- admin_user: Administrative access for schema changes
- audit_user: Special role for audit logging

#### Implementation Steps:
1. Create new database roles with minimal required permissions
2. Grant appropriate privileges to each role
3. Update application to use specific roles based on function
4. Remove unnecessary superuser access

#### SQL Commands:
```sql
-- Create roles
CREATE ROLE app_user WITH LOGIN PASSWORD 'strong_password_1';
CREATE ROLE read_only_user WITH LOGIN PASSWORD 'strong_password_2';
CREATE ROLE admin_user WITH LOGIN PASSWORD 'strong_password_3';
CREATE ROLE audit_user WITH LOGIN PASSWORD 'strong_password_4';

-- Grant privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO read_only_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO admin_user;
GRANT INSERT ON audit_log TO audit_user;

-- Grant privileges on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
```

### 3. Implement Row-Level Security

#### Use Cases:
- User data isolation
- Organization-based data access (if multi-tenant)

#### Implementation Steps:
1. Enable row-level security on sensitive tables
2. Create security policies
3. Test policy enforcement
4. Monitor policy effectiveness

#### SQL Commands:
```sql
-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to restrict access to own profile
CREATE POLICY user_profiles_isolation_policy 
ON user_profiles 
FOR ALL 
TO app_user 
USING (user_id = current_setting('app.current_user_id')::integer);

-- Enable RLS on user_preferences table
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policy to restrict access to own preferences
CREATE POLICY user_preferences_isolation_policy 
ON user_preferences 
FOR ALL 
TO app_user 
USING (user_id = current_setting('app.current_user_id')::integer);
```

### 4. Set Up Audit Logging

#### Implementation Steps:
1. Create audit log table
2. Create audit logging functions
3. Set up triggers on sensitive tables
4. Test audit logging
5. Set up log retention and archiving

#### SQL Commands:
```sql
-- Create audit log table
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
  row_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  user_id INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  transaction_id BIGINT
);

-- Create audit logging function
CREATE OR REPLACE FUNCTION audit_trigger_func() RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_log (table_name, operation, row_id, old_values, user_id, transaction_id)
    VALUES (TG_TABLE_NAME, TG_OP, OLD.id, to_jsonb(OLD), current_setting('app.current_user_id')::integer, txid_current());
    RETURN OLD;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_log (table_name, operation, row_id, new_values, user_id, transaction_id)
    VALUES (TG_TABLE_NAME, TG_OP, NEW.id, to_jsonb(NEW), current_setting('app.current_user_id')::integer, txid_current());
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_log (table_name, operation, row_id, old_values, new_values, user_id, transaction_id)
    VALUES (TG_TABLE_NAME, TG_OP, NEW.id, to_jsonb(OLD), to_jsonb(NEW), current_setting('app.current_user_id')::integer, txid_current());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers on sensitive tables
CREATE TRIGGER users_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER articles_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON articles
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

### 5. Password Security

#### Implementation Steps:
1. Enforce strong password policies
2. Implement password expiration
3. Set up account lockout after failed attempts
4. Enable two-factor authentication (at application level)

#### Configuration:
```sql
-- In postgresql.conf
password_encryption = scram-sha-256

-- Create extension for password checking (if available)
CREATE EXTENSION IF NOT EXISTS passwordcheck;
```

### 6. Network Security

#### Implementation Steps:
1. Restrict database access to specific IP addresses
2. Use firewall rules to limit access
3. Implement connection pooling at network level
4. Monitor for suspicious connections

#### Configuration:
```sql
-- In pg_hba.conf, restrict access to specific IPs
hostssl all all 192.168.1.0/24 md5
hostssl all all 10.0.0.0/8 md5
```

## Implementation Timeline

### Week 1: SSL Encryption and Role-Based Access
- Generate and configure SSL certificates
- Create new database roles
- Update application connection configuration
- Test and verify changes

### Week 2: Row-Level Security and Audit Logging
- Enable and configure row-level security
- Implement audit logging system
- Test security policies
- Validate audit logging

### Week 3: Password and Network Security
- Implement strong password policies
- Configure network access restrictions
- Set up monitoring for security events
- Conduct security testing

### Week 4: Validation and Documentation
- Comprehensive security testing
- Documentation of all security measures
- Training for development team
- Final security assessment

## Testing Plan

### Security Testing Checklist:
- [ ] SSL encryption is enabled and enforced
- [ ] All connections use SSL
- [ ] Role-based access control is working correctly
- [ ] Row-level security policies are enforced
- [ ] Audit logging captures all relevant events
- [ ] Password policies are enforced
- [ ] Network access restrictions are effective
- [ ] No unauthorized access is possible

### Penetration Testing:
- Conduct vulnerability scanning
- Perform SQL injection testing
- Test privilege escalation attempts
- Validate authentication mechanisms

## Monitoring and Alerting

### Security Events to Monitor:
- Failed login attempts
- Unauthorized access attempts
- Schema modification attempts
- Large data export attempts
- Unusual query patterns

### Alerting Thresholds:
- More than 5 failed login attempts in 1 minute
- Access to sensitive tables outside business hours
- Simultaneous connections from multiple geographic locations
- Large data queries that exceed normal patterns

## Compliance Considerations

### GDPR Compliance:
- Ensure user data can be exported upon request
- Implement data deletion procedures
- Protect personal data with encryption
- Maintain audit logs for data access

### Other Regulations:
- HIPAA (if applicable)
- SOX (if applicable)
- Industry-specific regulations

## Rollback Plan

If security enhancements cause issues:
1. Revert pg_hba.conf to allow non-SSL connections
2. Restore original database roles
3. Disable row-level security policies
4. Remove audit logging triggers
5. Validate system functionality
6. Implement fixes and re-deploy

## Success Criteria

Security enhancements will be considered successful when:
- All connections use SSL encryption
- Role-based access control is properly implemented
- Row-level security policies are enforced
- Audit logging captures all relevant events
- Password policies are enforced
- Network access is properly restricted
- All security tests pass
- System performance is not negatively impacted