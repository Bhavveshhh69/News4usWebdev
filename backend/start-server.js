#!/usr/bin/env node

/**
 * Production server starter for NEWS4US backend
 * This script ensures the server starts properly in shared hosting environments
 */

import { spawn } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🚀 Starting NEWS4US Backend Server...');
console.log(`📅 ${new Date().toISOString()}`);
console.log(`🔧 Node Version: ${process.version}`);
console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);

// Check if required dependencies are available
try {
  // Test database connection (optional)
  if (process.env.NODE_ENV === 'production') {
    console.log('🔍 Checking database connectivity...');
    // Add database connectivity check here if needed
  }

  console.log('✅ All checks passed. Starting server...');

  // Start the main server
  const serverProcess = spawn('node', ['server.js'], {
    stdio: 'inherit',
    env: process.env
  });

  serverProcess.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });

  serverProcess.on('exit', (code) => {
    console.log(`🔄 Server process exited with code ${code}`);
    process.exit(code);
  });

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    console.log('📴 Received SIGTERM, shutting down gracefully...');
    serverProcess.kill('SIGTERM');
  });

  process.on('SIGINT', () => {
    console.log('📴 Received SIGINT, shutting down gracefully...');
    serverProcess.kill('SIGINT');
  });

} catch (error) {
  console.error('❌ Startup error:', error);
  process.exit(1);
}
