// Category controller to handle HTTP requests
import {
  createCategory,
  getCategoryById,
  getCategoryByName,
  getAllCategories,
  updateCategory,
  deleteCategory
} from '../repositories/categoryRepository.js';

import { authenticate, authorize } from '../middleware/authMiddleware.js';

// Create a new category
const createCategoryHandler = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if category already exists
    const existingCategory = await getCategoryByName(name);
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    
    const category = await createCategory({ name, description });
    
    res.status(201).json({
      success: true,
      category,
      message: 'Category created successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create category'
    });
  }
};

// Get category by ID
const getCategoryHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await getCategoryById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      category,
      message: 'Category retrieved successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to retrieve category'
    });
  }
};

// Get category by name
const getCategoryByNameHandler = async (req, res) => {
  try {
    const { name } = req.params;
    
    const category = await getCategoryByName(name);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      category,
      message: 'Category retrieved successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to retrieve category'
    });
  }
};

// Get all categories
const getAllCategoriesHandler = async (req, res) => {
  try {
    const categories = await getAllCategories();
    
    res.status(200).json({
      success: true,
      categories,
      message: 'Categories retrieved successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to retrieve categories'
    });
  }
};

// Update a category
const updateCategoryHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Check if category exists
    const existingCategory = await getCategoryById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if another category with the same name exists
    if (name) {
      const categoryWithName = await getCategoryByName(name);
      if (categoryWithName && categoryWithName.id !== parseInt(id)) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }
    
    const category = await updateCategory(id, { name, description });
    
    res.status(200).json({
      success: true,
      category,
      message: 'Category updated successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to update category'
    });
  }
};

// Delete a category
const deleteCategoryHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const existingCategory = await getCategoryById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    await deleteCategory(id);
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete category'
    });
  }
};

export {
  createCategoryHandler,
  getCategoryHandler,
  getCategoryByNameHandler,
  getAllCategoriesHandler,
  updateCategoryHandler,
  deleteCategoryHandler
};