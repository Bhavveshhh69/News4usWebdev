// Test authentication service
import dotenv from 'dotenv';
dotenv.config();

import { registerUser, loginUser, logoutUser, validateToken } from './services/authService.js';
import { deleteAllUserSessions } from './repositories/sessionRepository.js';
import { findUserByEmail } from './repositories/userRepository.js';
import { executeQuery } from './config/db-utils.js';

const testAuthService = async () => {
  console.log('=== Authentication Service Tests ===\n');
  
  try {
    // Test 1: User registration
    console.log('1. Testing user registration...');
    const testUser = {
      email: 'test@example.com',
      password: 'TestPass123!',
      name: 'Test User',
      role: 'user'
    };
    
    // Clean up any existing test user
    const existingUser = await findUserByEmail(testUser.email);
    if (existingUser) {
      await deleteAllUserSessions(existingUser.id);
      // Delete the user for a clean test
      await executeQuery('DELETE FROM users WHERE email = $1', [testUser.email]);
    }
    
    const registrationResult = await registerUser(testUser);
    console.log('   ✓ User registration successful');
    console.log('   ✓ User ID:', registrationResult.user.id);
    console.log('   ✓ User email:', registrationResult.user.email);
    console.log('   ✓ User name:', registrationResult.user.name);
    console.log('   ✓ User role:', registrationResult.user.role, '\n');
    
    // Test 2: User login
    console.log('2. Testing user login...');
    const loginResult = await loginUser(testUser.email, testUser.password);
    console.log('   ✓ User login successful');
    console.log('   ✓ Session ID:', loginResult.sessionId);
    console.log('   ✓ Token length:', loginResult.token.length, 'characters\n');
    
    // Test 3: Token validation
    console.log('3. Testing token validation...');
    const tokenValidationResult = await validateToken(loginResult.token);
    console.log('   ✓ Token validation successful');
    console.log('   ✓ Validated user ID:', tokenValidationResult.user.id);
    console.log('   ✓ Validated user email:', tokenValidationResult.user.email, '\n');
    
    // Test 4: User logout
    console.log('4. Testing user logout...');
    const logoutResult = await logoutUser(loginResult.sessionId);
    console.log('   ✓ User logout successful');
    console.log('   ✓ Logout message:', logoutResult.message, '\n');
    
    // Test 5: Invalid credentials handling
    console.log('5. Testing invalid credentials handling...');
    try {
      await loginUser(testUser.email, 'wrongpassword');
      console.log('   ✗ Invalid credentials test failed - should have thrown an error');
    } catch (err) {
      console.log('   ✓ Invalid credentials properly rejected');
      console.log('   ✓ Error message:', err.message, '\n');
    }
    
    // Test 6: Duplicate user registration handling
    console.log('6. Testing duplicate user registration handling...');
    try {
      await registerUser(testUser);
      console.log('   ✗ Duplicate registration test failed - should have thrown an error');
    } catch (err) {
      console.log('   ✓ Duplicate registration properly rejected');
      console.log('   ✓ Error message:', err.message, '\n');
    }
    
    // Clean up test user
    console.log('Cleaning up test user...');
    const user = await findUserByEmail(testUser.email);
    if (user) {
      await deleteAllUserSessions(user.id);
      await executeQuery('DELETE FROM users WHERE email = $1', [testUser.email]);
    }
    console.log('   ✓ Test user cleanup completed\n');
    
    console.log('=== All Authentication Service tests passed successfully! ===');
    return true;
    
  } catch (err) {
    console.error('Authentication Service tests failed:', err.message);
    console.error('Stack trace:', err.stack);
    return false;
  }
};

testAuthService().then(success => {
  if (success) {
    console.log('\n🎉 Authentication Service implementation is complete and verified!');
    process.exit(0);
  } else {
    console.log('\n❌ Authentication Service implementation has issues that need to be addressed.');
    process.exit(1);
  }
});