-- Fix audit user privileges for app_audit_log table
GRANT INSERT ON app_audit_log TO audit_user;
GRANT USAGE ON SEQUENCE app_audit_log_id_seq TO audit_user;