// Test file for admin endpoints
import axios from 'axios';

// Set the base URL for the API
const BASE_URL = 'http://localhost:4001/api';

// Test admin endpoints
async function testAdminEndpoints() {
  try {
    console.log('Testing admin endpoints...\n');
    
    // First, let's login as admin to get a token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'Admin123!'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful. Token received.\n');
    
    // Set up axios with the token for subsequent requests
    const api = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Test 1: Get user list
    console.log('2. Testing GET /admin/users...');
    const usersResponse = await api.get('/admin/users');
    console.log('User list retrieved successfully.');
    console.log(`Total users: ${usersResponse.data.total}\n`);
    
    // Test 2: Get system stats
    console.log('3. Testing GET /admin/stats...');
    const statsResponse = await api.get('/admin/stats');
    console.log('System stats retrieved successfully.');
    console.log(`Total users: ${statsResponse.data.stats.users.total_users}`);
    console.log(`Total articles: ${statsResponse.data.stats.articles.total_articles}\n`);
    
    // Test 3: Get category list
    console.log('4. Testing GET /admin/categories...');
    const categoriesResponse = await api.get('/admin/categories');
    console.log('Categories retrieved successfully.');
    console.log(`Total categories: ${categoriesResponse.data.categories.length}\n`);
    
    // Test 4: Get tag list
    console.log('5. Testing GET /admin/tags...');
    const tagsResponse = await api.get('/admin/tags');
    console.log('Tags retrieved successfully.');
    console.log(`Total tags: ${tagsResponse.data.tags.length}\n`);
    
    // Test 5: Get recent activity
    console.log('6. Testing GET /admin/activity...');
    const activityResponse = await api.get('/admin/activity?limit=5');
    console.log('Recent activity retrieved successfully.');
    console.log(`Recent activities: ${activityResponse.data.activity.length}\n`);
    
    console.log('=== All admin endpoint tests completed successfully ===\n');
    
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else {
      console.error('Network Error:', error.message);
    }
  }
}

// Run the tests
testAdminEndpoints();