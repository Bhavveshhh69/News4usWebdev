-- Create roles for enhanced security
-- This script should be run as a PostgreSQL superuser

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

-- Grant INSERT on audit_log table to audit_user (create table first)
-- Note: We'll create the audit_log table in a separate script
-- For now, we'll grant privileges assuming it will exist
GRANT USAGE ON SCHEMA public TO audit_user;
-- GRANT INSERT ON audit_log TO audit_user; -- Will be executed after audit_log table creation

-- Display the created roles
SELECT rolname, rolcanlogin, rolcreatedb, rolsuper 
FROM pg_roles 
WHERE rolname IN ('app_user', 'read_only_user', 'admin_user', 'audit_user');

-- Display privileges for app_user
SELECT table_schema, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE grantee = 'app_user' 
ORDER BY table_schema, table_name, privilege_type;