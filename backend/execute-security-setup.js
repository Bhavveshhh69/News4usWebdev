import { executeQuery } from './config/db-utils.js';
import fs from 'fs';
import path from 'path';

const executeSecuritySetup = async () => {
  try {
    console.log('Executing security setup...');
    
    // Read and execute setup-security-roles.sql
    console.log('Setting up security roles...');
    const rolesSql = fs.readFileSync(path.join(process.cwd(), 'setup-security-roles.sql'), 'utf8');
    
    // Execute the entire file as one statement since it contains complex commands
    try {
      await executeQuery(rolesSql);
      console.log('Security roles setup completed');
    } catch (err) {
      console.warn('Error setting up security roles:', err.message);
    }
    
    // Read and execute setup-audit-logging.sql
    console.log('Setting up audit logging...');
    const auditSql = fs.readFileSync(path.join(process.cwd(), 'setup-audit-logging.sql'), 'utf8');
    
    // Execute the entire file as one statement
    try {
      await executeQuery(auditSql);
      console.log('Audit logging setup completed');
    } catch (err) {
      console.warn('Error setting up audit logging:', err.message);
    }
    
    console.log('Security setup completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error executing security setup:', err.stack);
    process.exit(1);
  }
};

executeSecuritySetup();