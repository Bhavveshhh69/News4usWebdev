// Enhanced test script for stock API endpoint with timeout testing
import fetch from 'node-fetch';

async function testStockAPI() {
  try {
    console.log('Testing stock API endpoint...');
    
    // Test the stock endpoint with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for test
    
    const response = await fetch('http://localhost:4002/api/stocks', {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const result = await response.json();
      console.log('Stock API Response:');
      
      // Check if it's the new format with error information
      if (Array.isArray(result)) {
        console.log('Data:', result);
        console.log('Success: Stock API returned data array');
      } else if (result.data) {
        console.log('Data:', result.data);
        if (result.error) {
          console.log('Warning from server:', result.error);
        }
        console.log('Success: Stock API returned enhanced response format');
      } else {
        console.log('Unexpected response format:', result);
      }
    } else {
      console.log('Error: Stock API returned status', response.status);
      const errorData = await response.text();
      console.log('Error details:', errorData);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Error: Stock API request timed out');
    } else {
      console.log('Error connecting to stock API:', error.message);
      console.log('This is expected if the backend server is not running');
    }
  }
}

// Run the test
testStockAPI();