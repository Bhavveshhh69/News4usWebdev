// Media service with ACID compliance
import { 
  createMediaAsset,
  getMediaAssetById,
  getAllMediaAssets,
  updateMediaAsset,
  deleteMediaAsset,
  getMediaAssetsByUser
} from '../repositories/mediaRepository.js';

import { findUserById } from '../repositories/userRepository.js';

// Create a new media asset
const uploadMediaAsset = async (mediaData, uploadedBy) => {
  try {
    // Validate required fields
    if (!mediaData.filename || !mediaData.originalName || !mediaData.mimeType || !mediaData.path) {
      throw new Error('Filename, original name, MIME type, and path are required');
    }
    
    // Validate user exists
    const user = await findUserById(uploadedBy);
    if (!user) {
      throw new Error('Invalid user ID');
    }
    
    // Validate file size
    if (mediaData.size <= 0) {
      throw new Error('Invalid file size');
    }
    
    // Validate MIME type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/ogg',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg'
    ];
    
    if (!allowedMimeTypes.includes(mediaData.mimeType)) {
      throw new Error('Unsupported file type');
    }
    
    // Create the media asset
    const mediaAsset = await createMediaAsset(mediaData, uploadedBy);
    
    return {
      success: true,
      mediaAsset,
      message: 'Media asset uploaded successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get media asset by ID
const getMediaAsset = async (id) => {
  try {
    const mediaAsset = await getMediaAssetById(id);
    
    if (!mediaAsset) {
      throw new Error('Media asset not found');
    }
    
    return {
      success: true,
      mediaAsset,
      message: 'Media asset retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get all media assets with pagination
const getMediaAssets = async (limit = 10, offset = 0, filters = {}) => {
  try {
    // Validate limit and offset
    if (limit < 1 || limit > 100) {
      limit = 10;
    }
    
    if (offset < 0) {
      offset = 0;
    }
    
    // Validate filters
    const validFilters = {};
    if (filters.uploadedBy) {
      const user = await findUserById(filters.uploadedBy);
      if (user) {
        validFilters.uploadedBy = filters.uploadedBy;
      }
    }
    
    if (filters.mimeType) {
      validFilters.mimeType = filters.mimeType;
    }
    
    if (filters.filename) {
      validFilters.filename = filters.filename;
    }
    
    const result = await getAllMediaAssets(limit, offset, validFilters);
    
    return {
      success: true,
      ...result,
      message: 'Media assets retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Update a media asset
const updateExistingMediaAsset = async (mediaId, updateData, uploadedBy) => {
  try {
    // Validate user exists
    const user = await findUserById(uploadedBy);
    if (!user) {
      throw new Error('Invalid user ID');
    }
    
    // Validate MIME type if provided
    if (updateData.mimeType) {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/ogg',
        'audio/mpeg',
        'audio/wav',
        'audio/ogg'
      ];
      
      if (!allowedMimeTypes.includes(updateData.mimeType)) {
        throw new Error('Unsupported file type');
      }
    }
    
    // Update the media asset
    const mediaAsset = await updateMediaAsset(mediaId, updateData, uploadedBy);
    
    return {
      success: true,
      mediaAsset,
      message: 'Media asset updated successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Delete a media asset
const deleteExistingMediaAsset = async (mediaId, uploadedBy) => {
  try {
    const result = await deleteMediaAsset(mediaId, uploadedBy);
    
    return {
      success: true,
      result,
      message: 'Media asset deleted successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get media assets by user
const getUserMediaAssets = async (userId, limit = 10, offset = 0) => {
  try {
    // Validate user exists
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('Invalid user ID');
    }
    
    // Validate limit and offset
    if (limit < 1 || limit > 100) {
      limit = 10;
    }
    
    if (offset < 0) {
      offset = 0;
    }
    
    const result = await getMediaAssetsByUser(userId, limit, offset);
    
    return {
      success: true,
      ...result,
      message: 'User media assets retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

export {
  uploadMediaAsset,
  getMediaAsset,
  getMediaAssets,
  updateExistingMediaAsset,
  deleteExistingMediaAsset,
  getUserMediaAssets
};