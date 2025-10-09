// Test script for stock API endpoint
import fetch from 'node-fetch';

async function testStockAPI() {
  try {
    console.log('Testing stock API endpoint...');
    
    // Test the stock endpoint
    const response = await fetch('http://localhost:4002/api/stocks');
    
    if (response.ok) {
      const data = await response.json();
      console.log('Stock API Response:', data);
      console.log('Success: Stock API is working correctly');
    } else {
      console.log('Error: Stock API returned status', response.status);
      const errorData = await response.text();
      console.log('Error details:', errorData);
    }
  } catch (error) {
    console.log('Error connecting to stock API:', error.message);
    console.log('This is expected if the backend server is not running');
  }
}

testStockAPI();