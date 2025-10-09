// Migration to create application audit log table
import { executeQuery } from '../config/db-utils.js';

async function up() {
  try {
    // Create app_audit_log table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS app_audit_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50),
        target_id INTEGER,
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ip_address INET,
        user_agent TEXT
      )
    `);
    
    // Create indexes
    await executeQuery('CREATE INDEX IF NOT EXISTS idx_app_audit_log_user_id ON app_audit_log(user_id)');
    await executeQuery('CREATE INDEX IF NOT EXISTS idx_app_audit_log_action ON app_audit_log(action)');
    await executeQuery('CREATE INDEX IF NOT EXISTS idx_app_audit_log_target ON app_audit_log(target_type, target_id)');
    await executeQuery('CREATE INDEX IF NOT EXISTS idx_app_audit_log_created_at ON app_audit_log(created_at)');
    
    console.log('Application audit log table created successfully');
  } catch (err) {
    console.error('Error creating application audit log table:', err);
    throw err;
  }
}

async function down() {
  try {
    await executeQuery('DROP TABLE IF EXISTS app_audit_log');
    console.log('Application audit log table dropped successfully');
  } catch (err) {
    console.error('Error dropping application audit log table:', err);
    throw err;
  }
}

export { up, down };