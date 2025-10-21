# 🚀 NEWS4US Backend Deployment Guide

## Overview
This guide explains how to deploy the NEWS4US Node.js backend server to your shared hosting environment.

## Prerequisites
- Node.js 18+ installed on your server
- Database configured and accessible
- Domain `news4us.in` pointing to your server

## Quick Start

### Option 1: Using the Deployment Script (Recommended)

#### Linux/macOS:
```bash
cd /path/to/backend
chmod +x deploy.sh
./deploy.sh
```

#### Windows:
```batch
cd /path/to/backend
deploy.bat
```

### Option 2: Manual Deployment

```bash
cd /path/to/backend

# Install dependencies
npm install --production

# Set environment variables
export NODE_ENV=production
export PORT=4002

# Run database migrations
node migrations/run-migration.js

# Create admin user
node create-admin-user.js

# Start the server
node start-server.js
```

## Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
NODE_ENV=production
PORT=4002

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=news_db
DB_USER=news_user
DB_PASSWORD=your_password

# Optional: Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Server Ports
- **Backend API:** Port 4002 (configurable via PORT environment variable)
- **Frontend:** Port 80/443 (served by your web server)

## Server Architecture

The backend server is designed to:
1. **Serve API endpoints** at `/api/*` paths
2. **Serve static frontend files** for SPA routing
3. **Handle authentication** with HTTP-only cookies
4. **Provide health checks** at `/health` endpoint

## Troubleshooting

### Backend Not Accessible
If API calls return HTML instead of JSON:

1. **Check if backend is running:**
   ```bash
   ps aux | grep node  # Linux/macOS
   # or
   netstat -tlnp | grep 4002  # Check port 4002
   ```

2. **Test backend directly:**
   ```bash
   curl http://localhost:4002/health
   curl http://localhost:4002/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"admin@news4us.com","password":"admin123"}'
   ```

3. **Check logs:**
   ```bash
   tail -f server.out.log
   ```

### Port Conflicts
If port 4002 is in use:
```bash
# Find what's using the port
lsof -i :4002  # Linux/macOS
netstat -ano | findstr :4002  # Windows

# Use a different port
export PORT=4003
node server.js
```

### Database Connection Issues
```bash
# Test database connection
node test-db-connection.js

# Check database credentials in .env file
cat .env | grep DB_
```

## Health Monitoring

The server provides a health check endpoint:
```bash
curl https://news4us.in/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-21T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

## Production Checklist

- [ ] Backend server is running on port 4002
- [ ] Database is configured and accessible
- [ ] Admin user exists (`admin@news4us.com` / `admin123`)
- [ ] Environment variables are set correctly
- [ ] Server logs are being monitored
- [ ] Health check endpoint is responding
- [ ] API endpoints are returning JSON (not HTML)

## Support

If you encounter issues:
1. Check the server logs (`server.out.log`)
2. Verify database connectivity
3. Test API endpoints directly
4. Ensure all environment variables are set
5. Check firewall and port accessibility
