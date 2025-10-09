-- Create audit logging system

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
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

-- Create indexes on audit log table
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log (table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_operation ON audit_log (operation);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log (timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_transaction_id ON audit_log (transaction_id);

-- Add comment to audit log table
COMMENT ON TABLE audit_log IS 'Audit log for tracking data changes';

-- Create audit logging function
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

-- Add comment to audit function
COMMENT ON FUNCTION audit_trigger_func IS 'Function to log audit trail for data changes';

-- Create triggers on sensitive tables
-- Users table
DROP TRIGGER IF EXISTS users_audit_trigger ON users;
CREATE TRIGGER users_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Articles table
DROP TRIGGER IF EXISTS articles_audit_trigger ON articles;
CREATE TRIGGER articles_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON articles
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- User profiles table
DROP TRIGGER IF EXISTS user_profiles_audit_trigger ON user_profiles;
CREATE TRIGGER user_profiles_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- User preferences table
DROP TRIGGER IF EXISTS user_preferences_audit_trigger ON user_preferences;
CREATE TRIGGER user_preferences_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON user_preferences
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Comments table
DROP TRIGGER IF EXISTS comments_audit_trigger ON comments;
CREATE TRIGGER comments_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Media assets table
DROP TRIGGER IF EXISTS media_assets_audit_trigger ON media_assets;
CREATE TRIGGER media_assets_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON media_assets
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Categories table
DROP TRIGGER IF EXISTS categories_audit_trigger ON categories;
CREATE TRIGGER categories_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON categories
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Add comment to audit triggers
COMMENT ON TRIGGER users_audit_trigger ON users IS 'Audit trigger for users table';
COMMENT ON TRIGGER articles_audit_trigger ON articles IS 'Audit trigger for articles table';
COMMENT ON TRIGGER user_profiles_audit_trigger ON user_profiles IS 'Audit trigger for user_profiles table';
COMMENT ON TRIGGER user_preferences_audit_trigger ON user_preferences IS 'Audit trigger for user_preferences table';
COMMENT ON TRIGGER comments_audit_trigger ON comments IS 'Audit trigger for comments table';
COMMENT ON TRIGGER media_assets_audit_trigger ON media_assets IS 'Audit trigger for media_assets table';

-- Grant INSERT privilege on audit_log to audit_user
GRANT INSERT ON audit_log TO audit_user;

-- Display audit log table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'audit_log' 
ORDER BY ordinal_position;

-- Display audit triggers
SELECT tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgname LIKE '%audit%' 
ORDER BY tgname;