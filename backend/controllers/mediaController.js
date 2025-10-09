// Media controller to handle HTTP requests
import {
  uploadMediaAsset,
  getMediaAsset,
  getMediaAssets,
  updateExistingMediaAsset,
  deleteExistingMediaAsset,
  getUserMediaAssets
} from '../services/mediaService.js';

import { authenticate, authorize } from '../middleware/authMiddleware.js';

// Upload a new media asset
const uploadMediaHandler = async (req, res) => {
  try {
    // For this example, we'll simulate file upload data
    // In a real implementation, you would use multer or similar middleware
    const { filename, originalName, mimeType, size, path, url, altText, caption } = req.body;
    const uploadedBy = req.user.id; // Assuming user ID is attached to request by auth middleware
    
    const mediaData = {
      filename,
      originalName,
      mimeType,
      size,
      path,
      url,
      altText,
      caption
    };
    
    const result = await uploadMediaAsset(mediaData, uploadedBy);
    
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to upload media asset'
    });
  }
};

// Get media asset by ID
const getMediaHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await getMediaAsset(id);
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Media asset not found') {
      res.status(404).json({
        success: false,
        message: 'Media asset not found'
      });
    } else {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve media asset'
      });
    }
  }
};

// Get all media assets with pagination
const getMediaAssetsHandler = async (req, res) => {
  try {
    const { limit, offset, uploadedBy, mimeType, filename } = req.query;
    
    const filters = {};
    if (uploadedBy) filters.uploadedBy = uploadedBy;
    if (mimeType) filters.mimeType = mimeType;
    if (filename) filters.filename = filename;
    
    const result = await getMediaAssets(
      parseInt(limit) || 10,
      parseInt(offset) || 0,
      filters
    );
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to retrieve media assets'
    });
  }
};

// Update a media asset
const updateMediaHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const uploadedBy = req.user.id; // Assuming user ID is attached to request by auth middleware
    
    const result = await updateExistingMediaAsset(id, updateData, uploadedBy);
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Media asset not found') {
      res.status(404).json({
        success: false,
        message: 'Media asset not found'
      });
    } else {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to update media asset'
      });
    }
  }
};

// Delete a media asset
const deleteMediaHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const uploadedBy = req.user.id; // Assuming user ID is attached to request by auth middleware
    
    const result = await deleteExistingMediaAsset(id, uploadedBy);
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Media asset not found') {
      res.status(404).json({
        success: false,
        message: 'Media asset not found'
      });
    } else {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to delete media asset'
      });
    }
  }
};

// Get media assets by user
const getUserMediaHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit, offset } = req.query;
    
    const result = await getUserMediaAssets(
      userId,
      parseInt(limit) || 10,
      parseInt(offset) || 0
    );
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Invalid user ID') {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    } else {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve user media assets'
      });
    }
  }
};

export {
  uploadMediaHandler,
  getMediaHandler,
  getMediaAssetsHandler,
  updateMediaHandler,
  deleteMediaHandler,
  getUserMediaHandler
};