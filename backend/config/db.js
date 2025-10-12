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

// Role-specific configurations (temporarily use main user for all roles)
const roleConfigs = {
  app_user: {
    user: process.env.DB_USER || 'postgres.hfymcyzedgdapbtwonwt',
    password: process.env.DB_PASSWORD || 'Bhavv@1127'
  },
  read_only_user: {
    user: process.env.DB_USER || 'postgres.hfymcyzedgdapbtwonwt',
    password: process.env.DB_PASSWORD || 'Bhavv@1127'
  },
  admin_user: {
    user: process.env.DB_USER || 'postgres.hfymcyzedgdapbtwonwt',
    password: process.env.DB_PASSWORD || 'Bhavv@1127'
  },
  audit_user: {
    user: process.env.DB_USER || 'postgres.hfymcyzedgdapbtwonwt',
    password: process.env.DB_PASSWORD || 'Bhavv@1127'
  }
};

export default dbConfig;
export { roleConfigs };