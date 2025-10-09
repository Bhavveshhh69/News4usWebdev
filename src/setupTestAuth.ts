// Script to set up authentication for testing
const setupTestAuth = () => {
  // Set up a test token in localStorage
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTkzMTY5NzksImV4cCI6MTc1OTQwMzM3OX0.KGM6DmzwXKBTQImh66HCkw2Rcd2VnL79XnTCiNO-vAw';
  const adminUser = {
    email: 'admin@example.com',
    role: 'admin',
    name: 'Admin User'
  };
  
  localStorage.setItem('token', token);
  localStorage.setItem('adminUser', JSON.stringify(adminUser));
  
  console.log('Test authentication set up successfully');
};

// Run the setup
setupTestAuth();