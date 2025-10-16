// Test script to verify cookie-based authentication system
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
const PORT = 4003;

// Middleware
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Test login endpoint (simulates setting cookie)
app.post('/api/auth/login', (req, res) => {
  // Simulate successful login
  res.cookie('auth_token', 'test-jwt-token-12345', {
    httpOnly: true,
    secure: false, // Allow HTTP in development
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
  });

  res.json({
    success: true,
    user: { id: 1, email: 'admin@test.com', role: 'admin' },
    message: 'Login successful'
  });
});

// Test current user endpoint (simulates cookie auth)
app.get('/api/auth/me', (req, res) => {
  const token = req.cookies?.auth_token;
  if (!token || token !== 'test-jwt-token-12345') {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({
    success: true,
    user: { id: 1, email: 'admin@test.com', role: 'admin', name: 'Admin User' }
  });
});

// Test logout endpoint (simulates clearing cookie)
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    path: '/'
  });

  res.json({ success: true, message: 'Logout successful' });
});

// Test protected endpoint
app.get('/api/articles', (req, res) => {
  const token = req.cookies?.auth_token;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  res.json({
    articles: [
      { id: 1, title: 'Test Article', content: 'Test content' }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running at http://localhost:${PORT}`);
  console.log('\n📋 Test Endpoints:');
  console.log('POST /api/auth/login  - Set HTTP-only cookie');
  console.log('GET  /api/auth/me     - Get current user from cookie');
  console.log('POST /api/auth/logout - Clear cookie');
  console.log('GET  /api/articles    - Protected endpoint');
  console.log('\n🍪 Test the cookie flow:');
  console.log('1. POST to /api/auth/login');
  console.log('2. Check browser cookies (should see auth_token)');
  console.log('3. GET /api/articles (should work)');
  console.log('4. GET /api/auth/me (should return user)');
  console.log('5. POST /api/auth/logout (should clear cookie)');
});







