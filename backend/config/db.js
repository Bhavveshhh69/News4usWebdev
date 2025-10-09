// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'news_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Bhavv@1127',
  ssl: process.env.DB_SSL || false,
  max: process.env.DB_MAX_CONNECTIONS || 20, // Maximum number of clients in the pool
  idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT || 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT || 2000, // How long to wait for a connection to be established
};

// Role-specific configurations
const roleConfigs = {
  app_user: {
    user: process.env.DB_APP_USER || 'app_user',
    password: process.env.DB_APP_USER_PASSWORD || 'strong_app_password_123'
  },
  read_only_user: {
    user: process.env.DB_READ_ONLY_USER || 'read_only_user',
    password: process.env.DB_READ_ONLY_USER_PASSWORD || 'strong_read_password_123'
  },
  admin_user: {
    user: process.env.DB_ADMIN_USER || 'admin_user',
    password: process.env.DB_ADMIN_USER_PASSWORD || 'strong_admin_password_123'
  },
  audit_user: {
    user: process.env.DB_AUDIT_USER || 'audit_user',
    password: process.env.DB_AUDIT_USER_PASSWORD || 'strong_audit_password_123'
  }
};

export default dbConfig;
export { roleConfigs };