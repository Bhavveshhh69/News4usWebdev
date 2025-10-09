// Test script for API endpoints
import fetch from 'node-fetch';

async function testAPI() {
  try {
    // Test getting articles from API
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTkzMTY5NzksImV4cCI6MTc1OTQwMzM3OX0.KGM6DmzwXKBTQImh66HCkw2Rcd2VnL79XnTCiNO-vAw';
    
    console.log('Testing articles API...');
    let articlesResponse = await fetch('http://localhost:4002/api/articles', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Articles API Response Status:', articlesResponse.status);
    let articlesData = await articlesResponse.json();
    console.log('Articles Data:', JSON.stringify(articlesData, null, 2));
    
    // Test creating an article
    console.log('\nTesting article creation...');
    const newArticle = {
      title: 'Test Article from API',
      summary: 'This is a test article created via API',
      content: '<p>This is the full content of the test article created via API</p>',
      categoryId: 4,
      tags: ['test', 'api'],
      status: 'published'
    };
    
    const createResponse = await fetch('http://localhost:4002/api/articles', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newArticle)
    });
    
    console.log('Create Article Response Status:', createResponse.status);
    const createData = await createResponse.json();
    console.log('Create Article Data:', JSON.stringify(createData, null, 2));
    
    // Test getting articles again to verify the new article was created
    console.log('\nTesting articles API after creation...');
    articlesResponse = await fetch('http://localhost:4002/api/articles', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Articles API Response Status:', articlesResponse.status);
    articlesData = await articlesResponse.json();
    console.log('Articles Data:', JSON.stringify(articlesData, null, 2));
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testAPI();