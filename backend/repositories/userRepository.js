// User repository with ACID compliance
import { executeQuery, executeTransaction } from '../config/db-utils.js';
import { hashPassword, comparePassword, sanitizeUser } from '../config/security.js';

// Create a new user
const createUser = async (userData) => {
  const { email, password, name, role = 'user' } = userData;
  
  try {
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Insert user into database
    const query = `
      INSERT INTO users (email, password, name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, name, role, created_at, updated_at, last_login, is_active
    `;
    
    const values = [email, hashedPassword, name, role];
    const result = await executeQuery(query, values);
    
    return sanitizeUser(result.rows[0]);
  } catch (err) {
    // Handle duplicate email error
    if (err.code === '23505') {
      throw new Error('User with this email already exists');
    }
    throw err;
  }
};

// Find user by email
const findUserByEmail = async (email) => {
  try {
    const query = 'SELECT * FROM users WHERE email = $1';
    const values = [email];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Find user by ID
const findUserById = async (id) => {
  try {
    const query = 'SELECT id, email, name, role, created_at, updated_at, last_login, is_active FROM users WHERE id = $1';
    const values = [id];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Update user last login time
const updateUserLoginTime = async (userId) => {
  try {
    const query = 'UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = $1 RETURNING last_login';
    const values = [userId];
    const result = await executeQuery(query, values);
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Update user information
const updateUser = async (userId, updateData) => {
  try {
    const fields = [];
    const values = [];
    let index = 1;
    
    // Build dynamic query based on provided fields
    for (const [key, value] of Object.entries(updateData)) {
      if (key !== 'id' && key !== 'password') { // Don't allow ID or password updates here
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }
    }
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    values.push(userId); // Add userId for WHERE clause
    const query = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${index} RETURNING id, email, name, role, created_at, updated_at, last_login, is_active`;
    
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    return sanitizeUser(result.rows[0]);
  } catch (err) {
    throw err;
  }
};

// Update user password
const updateUserPassword = async (userId, newPassword) => {
  try {
    const hashedPassword = await hashPassword(newPassword);
    
    const query = 'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name, role, created_at, updated_at, last_login, is_active';
    const values = [hashedPassword, userId];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    return sanitizeUser(result.rows[0]);
  } catch (err) {
    throw err;
  }
};

// Deactivate user (soft delete)
const deactivateUser = async (userId) => {
  try {
    const query = 'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id, email, name, role, created_at, updated_at, last_login, is_active';
    const values = [userId];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    return sanitizeUser(result.rows[0]);
  } catch (err) {
    throw err;
  }
};

// Get all users (for admin purposes)
const getAllUsers = async (limit = 100, offset = 0) => {
  try {
    const query = `
      SELECT id, email, name, role, created_at, updated_at, last_login, is_active 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const values = [limit, offset];
    const result = await executeQuery(query, values);
    
    return result.rows;
  } catch (err) {
    throw err;
  }
};

export {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserLoginTime,
  updateUser,
  updateUserPassword,
  deactivateUser,
  getAllUsers
};