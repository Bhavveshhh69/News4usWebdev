@echo off
REM NEWS4US Backend Deployment Script for Windows
REM This script deploys the Node.js backend to shared hosting

echo 🚀 Deploying NEWS4US Backend to production...

REM Set production environment
set NODE_ENV=production
set PORT=4002

REM Install dependencies (if needed)
echo 📦 Installing dependencies...
npm install --production

REM Run database migrations (if needed)
echo 🗄️ Running database migrations...
node migrations/run-migration.js

REM Create admin user (if needed)
echo 👤 Setting up admin user...
node create-admin-user.js

REM Start the server
echo 🔥 Starting production server...
node start-server.js

pause
