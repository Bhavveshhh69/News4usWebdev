#!/bin/bash

# NEWS4US Backend Deployment Script
# This script deploys the Node.js backend to shared hosting

echo "🚀 Deploying NEWS4US Backend to production..."

# Set production environment
export NODE_ENV=production
export PORT=${PORT:-4002}

# Install dependencies (if needed)
echo "📦 Installing dependencies..."
npm install --production

# Run database migrations (if needed)
echo "🗄️ Running database migrations..."
node migrations/run-migration.js

# Create admin user (if needed)
echo "👤 Setting up admin user..."
node create-admin-user.js

# Start the server
echo "🔥 Starting production server..."
node start-server.js
