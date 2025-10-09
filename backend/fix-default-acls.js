// Script to fix default ACLs to include audit_user
import pkg from 'pg';
const { Client } = pkg;

const fixDefaultACLs = async () => {
  try {
    console.log('Fixing default ACLs to include audit_user...');
    
    // Create a direct client connection with superuser privileges
    const client = new Client({
      host: 'localhost',
      port: 5432,
      database: 'news_db',
      user: 'postgres',
      password: 'Bhavv@1127',
      ssl: false
    });
    
    await client.connect();
    console.log('✅ Superuser connected successfully');
    
    // Add audit_user to default table ACLs
    await client.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT ON TABLES TO audit_user');
    console.log('✅ Added INSERT privilege for audit_user to default table ACLs');
    
    // Add audit_user to default sequence ACLs
    await client.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO audit_user');
    console.log('✅ Added USAGE privilege for audit_user to default sequence ACLs');
    
    await client.end();
    console.log('✅ Superuser connection closed');
    
    return true;
  } catch (err) {
    console.error('Error fixing default ACLs:', err.message);
    return false;
  }
};

fixDefaultACLs().then(result => {
  process.exit(result ? 0 : 1);
});