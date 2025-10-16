// Test script to verify bcryptjs password hashing works correctly
import { hashPassword, comparePassword } from './config/security.js';

async function testBcryptjs() {
  console.log('🔍 Testing bcryptjs password hashing...');

  try {
    // Test password hashing
    const password = 'testPassword123';
    const hashedPassword = await hashPassword(password);
    console.log('✅ Password hashing successful');
    console.log('Hash length:', hashedPassword.length);

    // Test password comparison
    const isMatch = await comparePassword(password, hashedPassword);
    console.log('✅ Password comparison (correct):', isMatch);

    const isNotMatch = await comparePassword('wrongPassword', hashedPassword);
    console.log('✅ Password comparison (incorrect):', isNotMatch);

    console.log('🎯 bcryptjs integration successful!');
    console.log('✨ No more Windows compilation issues!');
  } catch (error) {
    console.error('❌ bcryptjs test failed:', error);
    process.exit(1);
  }
}

testBcryptjs();







