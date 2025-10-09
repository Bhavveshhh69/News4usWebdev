// Test file for admin service
import { 
  getAdminUserList,
  getAdminUserDetails,
  updateAdminUserRole,
  setAdminUserActiveStatus,
  getAdminArticleList,
  getAdminCategoryList,
  getAdminTagList,
  getAdminSystemStats,
  getAdminRecentActivity
} from './services/adminService.js';

import { pool } from './config/database.js';
import { hashPassword } from './config/security.js';

// Test data
const testUsers = [
  {
    email: 'admin@test.com',
    password: 'Admin123!',
    name: 'Admin User',
    role: 'admin'
  },
  {
    email: 'author@test.com',
    password: 'Author123!',
    name: 'Author User',
    role: 'author'
  },
  {
    email: 'user@test.com',
    password: 'User123!',
    name: 'Regular User',
    role: 'user'
  }
];

const testCategories = [
  { name: 'Technology', description: 'Tech news and updates' },
  { name: 'Sports', description: 'Sports news and events' }
];

const testTags = [
  { name: 'breaking' },
  { name: 'featured' }
];

let createdUsers = [];
let createdCategories = [];
let createdTags = [];
let createdArticles = [];

async function setupTestData() {
  console.log('Setting up test data...');
  
  // Create test users
  for (const user of testUsers) {
    const hashedPassword = await hashPassword(user.password);
    const userQuery = `
      INSERT INTO users (email, password, name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, name, role
    `;
    const userResult = await pool.query(userQuery, [
      user.email,
      hashedPassword,
      user.name,
      user.role
    ]);
    createdUsers.push(userResult.rows[0]);
  }
  
  // Create test categories
  for (const category of testCategories) {
    const categoryQuery = `
      INSERT INTO categories (name, description)
      VALUES ($1, $2)
      RETURNING id, name, description
    `;
    const categoryResult = await pool.query(categoryQuery, [
      category.name,
      category.description
    ]);
    createdCategories.push(categoryResult.rows[0]);
  }
  
  // Create test tags
  for (const tag of testTags) {
    const tagQuery = `
      INSERT INTO tags (name)
      VALUES ($1)
      RETURNING id, name
    `;
    const tagResult = await pool.query(tagQuery, [tag.name]);
    createdTags.push(tagResult.rows[0]);
  }
  
  // Create test articles
  const articleQuery = `
    INSERT INTO articles (title, summary, content, author_id, category_id, status, is_featured)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, title, summary, author_id, category_id, status, is_featured
  `;
  
  // Create articles for testing
  const article1 = await pool.query(articleQuery, [
    'Test Article 1',
    'This is a test article summary',
    'This is the full content of the test article.',
    createdUsers[1].id, // author
    createdCategories[0].id, // category
    'published',
    true
  ]);
  createdArticles.push(article1.rows[0]);
  
  const article2 = await pool.query(articleQuery, [
    'Test Article 2',
    'Another test article summary',
    'This is the full content of another test article.',
    createdUsers[1].id, // author
    createdCategories[1].id, // category
    'draft',
    false
  ]);
  createdArticles.push(article2.rows[0]);
  
  console.log('Test data setup completed.');
}

async function cleanupTestData() {
  console.log('Cleaning up test data...');
  
  // Delete articles first due to foreign key constraints
  if (createdArticles.length > 0) {
    const articleIds = createdArticles.map(a => a.id);
    await pool.query('DELETE FROM articles WHERE id = ANY($1)', [articleIds]);
  }
  
  // Delete tags
  if (createdTags.length > 0) {
    const tagIds = createdTags.map(t => t.id);
    await pool.query('DELETE FROM tags WHERE id = ANY($1)', [tagIds]);
  }
  
  // Delete categories
  if (createdCategories.length > 0) {
    const categoryIds = createdCategories.map(c => c.id);
    await pool.query('DELETE FROM categories WHERE id = ANY($1)', [categoryIds]);
  }
  
  // Delete users
  if (createdUsers.length > 0) {
    const userIds = createdUsers.map(u => u.id);
    await pool.query('DELETE FROM users WHERE id = ANY($1)', [userIds]);
  }
  
  console.log('Test data cleanup completed.');
}

async function runTests() {
  try {
    // Setup test data
    await setupTestData();
    
    console.log('\n=== Testing Admin Service ===\n');
    
    // Test 1: Get user list
    console.log('1. Testing getAdminUserList...');
    const userList = await getAdminUserList(10, 0, { role: 'user' });
    console.log('User list result:', userList);
    
    // Test 2: Get user details
    console.log('\n2. Testing getAdminUserDetails...');
    const userDetails = await getAdminUserDetails(createdUsers[0].id);
    console.log('User details result:', userDetails);
    
    // Test 3: Update user role
    console.log('\n3. Testing updateAdminUserRole...');
    const updatedUser = await updateAdminUserRole(createdUsers[2].id, 'author');
    console.log('Updated user result:', updatedUser);
    
    // Test 4: Set user active status
    console.log('\n4. Testing setAdminUserActiveStatus...');
    const updatedStatus = await setAdminUserActiveStatus(createdUsers[2].id, false);
    console.log('Updated status result:', updatedStatus);
    
    // Test 5: Get article list
    console.log('\n5. Testing getAdminArticleList...');
    const articleList = await getAdminArticleList(10, 0, { status: 'published' });
    console.log('Article list result:', articleList);
    
    // Test 6: Get category list
    console.log('\n6. Testing getAdminCategoryList...');
    const categoryList = await getAdminCategoryList();
    console.log('Category list result:', categoryList);
    
    // Test 7: Get tag list
    console.log('\n7. Testing getAdminTagList...');
    const tagList = await getAdminTagList();
    console.log('Tag list result:', tagList);
    
    // Test 8: Get system stats
    console.log('\n8. Testing getAdminSystemStats...');
    const systemStats = await getAdminSystemStats();
    console.log('System stats result:', systemStats);
    
    // Test 9: Get recent activity
    console.log('\n9. Testing getAdminRecentActivity...');
    const recentActivity = await getAdminRecentActivity(5);
    console.log('Recent activity result:', recentActivity);
    
    console.log('\n=== All tests completed successfully ===\n');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Cleanup test data
    await cleanupTestData();
    process.exit(0);
  }
}

// Run the tests
runTests();