// Category repository with ACID compliance
import { executeQuery } from '../config/db-utils.js';

// Create a new category
const createCategory = async (categoryData) => {
  try {
    const { name, description } = categoryData;
    
    const query = `
      INSERT INTO categories (name, description)
      VALUES ($1, $2)
      RETURNING id, name, description, created_at, updated_at
    `;
    
    const values = [name, description];
    const result = await executeQuery(query, values);
    
    return result.rows[0];
  } catch (err) {
    // Handle duplicate name error
    if (err.code === '23505') {
      throw new Error('Category with this name already exists');
    }
    throw err;
  }
};

// Get category by ID
const getCategoryById = async (id) => {
  try {
    const query = 'SELECT id, name, description, created_at, updated_at FROM categories WHERE id = $1';
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

// Get category by name
const getCategoryByName = async (name) => {
  try {
    const query = 'SELECT id, name, description, created_at, updated_at FROM categories WHERE name = $1';
    const values = [name];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Get all categories
const getAllCategories = async (limit = 100, offset = 0) => {
  try {
    const query = `
      SELECT id, name, description, created_at, updated_at 
      FROM categories 
      ORDER BY name 
      LIMIT $1 OFFSET $2
    `;
    
    const values = [limit, offset];
    const result = await executeQuery(query, values);
    
    // Get article counts for each category
    const categories = result.rows;
    for (const category of categories) {
      const countQuery = 'SELECT COUNT(*) as article_count FROM articles WHERE category_id = $1 AND status = $2';
      const countResult = await executeQuery(countQuery, [category.id, 'published']);
      category.article_count = parseInt(countResult.rows[0].article_count, 10);
    }
    
    return categories;
  } catch (err) {
    throw err;
  }
};

// Update a category
const updateCategory = async (categoryId, updateData) => {
  try {
    const fields = [];
    const values = [];
    let index = 1;
    
    // Build dynamic query based on provided fields
    for (const [key, value] of Object.entries(updateData)) {
      if (key !== 'id' && key !== 'created_at') { // Don't allow ID or created_at updates
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }
    }
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    values.push(categoryId); // Add categoryId for WHERE clause
    const query = `
      UPDATE categories 
      SET ${fields.join(', ')}, updated_at = NOW() 
      WHERE id = $${index}
      RETURNING id, name, description, updated_at
    `;
    
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Category not found');
    }
    
    return result.rows[0];
  } catch (err) {
    // Handle duplicate name error
    if (err.code === '23505') {
      throw new Error('Category with this name already exists');
    }
    throw err;
  }
};

// Delete a category
const deleteCategory = async (categoryId) => {
  try {
    // Check if category has associated articles
    const checkQuery = 'SELECT COUNT(*) as article_count FROM articles WHERE category_id = $1';
    const checkResult = await executeQuery(checkQuery, [categoryId]);
    const articleCount = parseInt(checkResult.rows[0].article_count, 10);
    
    if (articleCount > 0) {
      throw new Error('Cannot delete category with associated articles');
    }
    
    // Delete the category
    const query = 'DELETE FROM categories WHERE id = $1 RETURNING id, name';
    const values = [categoryId];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Category not found');
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

export {
  createCategory,
  getCategoryById,
  getCategoryByName,
  getAllCategories,
  updateCategory,
  deleteCategory
};