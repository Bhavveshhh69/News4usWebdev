// Script to create an admin user
import { appUserPool as pool } from './config/database.js';
import { hashPassword } from './config/security.js';

const createAdminUser = async () => {
  try {
    const email = 'admin@example.com';
    const password = 'Admin123!';
    const name = 'Admin User';
    const role = 'admin';
    
    // Check if admin user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1', 
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Create the admin user
    const result = await pool.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email, hashedPassword, name, role]
    );
    
    console.log('Admin user created successfully:');
    console.log(result.rows[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdminUser();