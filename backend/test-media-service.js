// Test file for Media Service functionality
import dotenv from 'dotenv';
dotenv.config();

import { 
  uploadMediaAsset,
  getMediaAsset,
  getMediaAssets,
  updateExistingMediaAsset,
  deleteExistingMediaAsset,
  getUserMediaAssets
} from './services/mediaService.js';

import { 
  createNewArticle,
  getArticle
} from './services/articleService.js';

import { 
  createCategory
} from './repositories/categoryRepository.js';

import { 
  createTag
} from './repositories/tagRepository.js';

console.log('Testing Media Service functionality...');

// Test media operations
console.log('\n--- Testing Media Operations ---');

try {
  // Use the existing user ID from our previous tests
  const userId = 6;
  
  // Create a media asset
  const mediaData = {
    filename: 'test-image-' + Date.now() + '.jpg',
    originalName: 'test-image.jpg',
    mimeType: 'image/jpeg',
    size: 102400, // 100KB
    path: '/uploads/test-image-' + Date.now() + '.jpg',
    url: 'http://localhost:4000/uploads/test-image-' + Date.now() + '.jpg',
    altText: 'Test image',
    caption: 'This is a test image for media service testing'
  };
  
  const newMedia = await uploadMediaAsset(mediaData, userId);
  console.log('Uploaded media asset:', newMedia);
  
  // Get the media asset
  const retrievedMedia = await getMediaAsset(newMedia.mediaAsset.id);
  console.log('Retrieved media asset:', retrievedMedia);
  
  // Get all media assets
  const allMedia = await getMediaAssets(10, 0, { uploadedBy: userId });
  console.log('All media assets for user:', allMedia);
  
  // Update the media asset
  const updatedMedia = await updateExistingMediaAsset(newMedia.mediaAsset.id, {
    altText: 'Updated test image',
    caption: 'This is an updated test image'
  }, userId);
  console.log('Updated media asset:', updatedMedia);
  
  // Get user media assets
  const userMedia = await getUserMediaAssets(userId, 10, 0);
  console.log('User media assets:', userMedia);
  
  // Delete the media asset
  const deletedMedia = await deleteExistingMediaAsset(newMedia.mediaAsset.id, userId);
  console.log('Deleted media asset:', deletedMedia);
  
  console.log('\n--- Media Service Test Completed Successfully ---');
} catch (err) {
  console.error('Error in media operations:', err.message);
  console.error('Stack trace:', err.stack);
}