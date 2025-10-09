// Tag controller to handle HTTP requests
import {
  createTag,
  getTagById,
  getTagByName,
  getAllTags,
  updateTag,
  deleteTag,
  getArticlesByTag
} from '../repositories/tagRepository.js';

import { authenticate, authorize } from '../middleware/authMiddleware.js';

// Create a new tag
const createTagHandler = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if tag already exists
    const existingTag = await getTagByName(name);
    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: 'Tag with this name already exists'
      });
    }
    
    const tag = await createTag({ name, description });
    
    res.status(201).json({
      success: true,
      tag,
      message: 'Tag created successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create tag'
    });
  }
};

// Get tag by ID
const getTagHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tag = await getTagById(id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }
    
    res.status(200).json({
      success: true,
      tag,
      message: 'Tag retrieved successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to retrieve tag'
    });
  }
};

// Get tag by name
const getTagByNameHandler = async (req, res) => {
  try {
    const { name } = req.params;
    
    const tag = await getTagByName(name);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }
    
    res.status(200).json({
      success: true,
      tag,
      message: 'Tag retrieved successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to retrieve tag'
    });
  }
};

// Get all tags
const getAllTagsHandler = async (req, res) => {
  try {
    const tags = await getAllTags();
    
    res.status(200).json({
      success: true,
      tags,
      message: 'Tags retrieved successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to retrieve tags'
    });
  }
};

// Get articles by tag with pagination
const getArticlesByTagHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit, offset } = req.query;
    
    // Check if tag exists
    const existingTag = await getTagById(id);
    if (!existingTag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }
    
    const result = await getArticlesByTag(
      id,
      parseInt(limit) || 10,
      parseInt(offset) || 0
    );
    
    res.status(200).json({
      success: true,
      ...result,
      message: 'Articles retrieved successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to retrieve articles by tag'
    });
  }
};

// Update a tag
const updateTagHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Check if tag exists
    const existingTag = await getTagById(id);
    if (!existingTag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }
    
    // Check if another tag with the same name exists
    if (name) {
      const tagWithName = await getTagByName(name);
      if (tagWithName && tagWithName.id !== parseInt(id)) {
        return res.status(400).json({
          success: false,
          message: 'Tag with this name already exists'
        });
      }
    }
    
    const tag = await updateTag(id, { name, description });
    
    res.status(200).json({
      success: true,
      tag,
      message: 'Tag updated successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to update tag'
    });
  }
};

// Delete a tag
const deleteTagHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if tag exists
    const existingTag = await getTagById(id);
    if (!existingTag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }
    
    await deleteTag(id);
    
    res.status(200).json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete tag'
    });
  }
};

export {
  createTagHandler,
  getTagHandler,
  getTagByNameHandler,
  getAllTagsHandler,
  getArticlesByTagHandler,
  updateTagHandler,
  deleteTagHandler
};