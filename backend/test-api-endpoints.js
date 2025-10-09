// Test file for API endpoints
import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

// Base URL for our API
const BASE_URL = 'http://localhost:4000/api';

console.log('Testing API endpoints...');

// Test public endpoints
console.log('\n--- Testing Public Endpoints ---');

try {
  // Test get all categories
  const categoriesResponse = await axios.get(`${BASE_URL}/categories`);
  console.log('Categories endpoint:', categoriesResponse.status, categoriesResponse.data);
  
  // Test get all tags
  const tagsResponse = await axios.get(`${BASE_URL}/tags`);
  console.log('Tags endpoint:', tagsResponse.status, tagsResponse.data);
  
  console.log('\n--- Public Endpoints Test Completed ---');
} catch (err) {
  console.error('Error in public endpoints test:', err.message);
}

// Test authentication required endpoints
console.log('\n--- Testing Authentication Required Endpoints ---');

try {
  // First, register a new user with a unique email
  const timestamp = Date.now();
  const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
    name: 'API Test User ' + timestamp,
    email: 'api_test_' + timestamp + '@example.com',
    password: 'TestPass123!'
  });
  
  console.log('Register endpoint:', registerResponse.status);
  
  // Login with the new user
  const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'api_test_' + timestamp + '@example.com',
    password: 'TestPass123!'
  });
  
  console.log('Login endpoint:', loginResponse.status);
  
  // Extract the token for authenticated requests
  const token = loginResponse.data.token;
  console.log('Authentication token obtained');
  
  // Test media upload endpoint
  const mediaResponse = await axios.post(`${BASE_URL}/media`, {
    filename: 'test-image-' + timestamp + '.jpg',
    originalName: 'test-image.jpg',
    mimeType: 'image/jpeg',
    size: 102400,
    path: '/uploads/test-image-' + timestamp + '.jpg',
    url: 'http://localhost:4000/uploads/test-image-' + timestamp + '.jpg',
    altText: 'Test image',
    caption: 'This is a test image'
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log('Media upload endpoint:', mediaResponse.status);
  
  // Test get media asset by ID
  const mediaId = mediaResponse.data.mediaAsset.id;
  const getMediaResponse = await axios.get(`${BASE_URL}/media/${mediaId}`);
  console.log('Get media by ID endpoint:', getMediaResponse.status, getMediaResponse.data);
  
  console.log('\n--- Authentication Required Endpoints Test Completed ---');
} catch (err) {
  console.error('Error in authentication required endpoints test:', err.message);
}