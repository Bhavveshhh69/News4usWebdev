import React, { useEffect } from 'react';
import { ContentProvider } from '../store/contentStore';
import { TestContentStore } from './TestContentStore';

// Set up test authentication
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

export function TestPage() {
  useEffect(() => {
    setupTestAuth();
  }, []);

  return (
    <ContentProvider>
      <div className="min-h-screen bg-gray-50">
        <TestContentStore />
      </div>
    </ContentProvider>
  );
}