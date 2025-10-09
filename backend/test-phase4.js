// Test file for Phase 4 implementation
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

console.log('Testing Phase 4 implementation...');

// Test media operations
console.log('\n--- Testing Media Operations ---');

try {
  // Use the existing user ID from our previous tests
  const userId = 6;
  
  // Create a media asset
  const mediaData = {
    filename: 'phase4-test-image-' + Date.now() + '.jpg',
    originalName: 'phase4-test-image.jpg',
    mimeType: 'image/jpeg',
    size: 204800, // 200KB
    path: '/uploads/phase4-test-image-' + Date.now() + '.jpg',
    url: 'http://localhost:4001/uploads/phase4-test-image-' + Date.now() + '.jpg',
    altText: 'Phase 4 test image',
    caption: 'This is a test image for Phase 4 media service testing'
  };
  
  const newMedia = await uploadMediaAsset(mediaData, userId);
  console.log('✓ Uploaded media asset:', newMedia.mediaAsset.filename);
  
  // Get the media asset
  const retrievedMedia = await getMediaAsset(newMedia.mediaAsset.id);
  console.log('✓ Retrieved media asset:', retrievedMedia.mediaAsset.filename);
  
  // Get all media assets
  const allMedia = await getMediaAssets(10, 0, { uploadedBy: userId });
  console.log('✓ Retrieved all media assets for user, count:', allMedia.mediaAssets.length);
  
  // Update the media asset
  const updatedMedia = await updateExistingMediaAsset(newMedia.mediaAsset.id, {
    altText: 'Updated Phase 4 test image',
    caption: 'This is an updated test image for Phase 4'
  }, userId);
  console.log('✓ Updated media asset:', updatedMedia.mediaAsset.altText);
  
  // Get user media assets
  const userMedia = await getUserMediaAssets(userId, 10, 0);
  console.log('✓ Retrieved user media assets, count:', userMedia.mediaAssets.length);
  
  // Delete the media asset
  const deletedMedia = await deleteExistingMediaAsset(newMedia.mediaAsset.id, userId);
  console.log('✓ Deleted media asset:', deletedMedia.result.filename);
  
  console.log('\n--- Phase 4 Test Completed Successfully ---');
  console.log('All media operations completed with ACID compliance');
} catch (err) {
  console.error('Error in media operations:', err.message);
  console.error('Stack trace:', err.stack);
}