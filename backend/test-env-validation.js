// Test environment validation
import dotenv from 'dotenv';
dotenv.config();

import validateEnvironment from './config/validate-env.js';

const testEnvironmentValidation = () => {
  try {
    console.log('Testing environment variable validation...');
    
    // Log current environment variables for debugging
    console.log('Current environment variables:');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '**** (set)' : 'not set');
    
    // Test with current environment
    const result = validateEnvironment();
    
    console.log('Environment validation result:', JSON.stringify(result, null, 2));
    
    if (result.isValid) {
      console.log('Environment validation passed');
      return true;
    } else {
      console.log('Environment validation failed. Missing variables:', result.missingVars.join(', '));
      return false;
    }
  } catch (err) {
    console.error('Environment validation test failed:', err.message);
    return false;
  }
};

const success = testEnvironmentValidation();
if (success) {
  console.log('Environment validation test completed successfully');
  process.exit(0);
} else {
  console.log('Environment validation test failed');
  process.exit(1);
}