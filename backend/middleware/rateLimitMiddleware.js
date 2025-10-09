// Rate limiting middleware
import { executeQuery } from '../config/db-utils.js';

// Check if Redis is available, otherwise use in-memory store
let redisClient;
try {
  const redis = await import('redis');
  if (process.env.REDIS_URL) {
    redisClient = redis.createClient({ url: process.env.REDIS_URL });
    await redisClient.connect();
    console.log('Redis client connected for rate limiting');
  }
} catch (err) {
  console.log('Redis not available, using in-memory store for rate limiting');
}

// In-memory store for rate limiting (fallback when Redis is not available)
const rateLimitStore = new Map();

// Clean up old entries periodically (for in-memory store)
if (!redisClient) {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now - value.timestamp > 60000) { // Remove entries older than 1 minute
        rateLimitStore.delete(key);
      }
    }
  }, 30000); // Run cleanup every 30 seconds
}

// Rate limiting middleware
const rateLimit = (windowMs = 60000, maxRequests = 10) => {
  return async (req, res, next) => {
    try {
      // Create a unique key based on IP address and endpoint
      const key = `${req.ip}-${req.path}`;
      const now = Date.now();
      
      let record;
      
      // Use Redis if available, otherwise use in-memory store
      if (redisClient) {
        // Get current request count for this key from Redis
        const redisValue = await redisClient.get(key);
        if (redisValue) {
          record = JSON.parse(redisValue);
        }
      } else {
        // Get current request count for this key from in-memory store
        record = rateLimitStore.get(key);
      }
      
      if (!record) {
        // First request for this key
        const newRecord = {
          count: 1,
          timestamp: now
        };
        
        if (redisClient) {
          await redisClient.setEx(key, Math.ceil(windowMs / 1000), JSON.stringify(newRecord));
        } else {
          rateLimitStore.set(key, newRecord);
        }
        
        res.set('X-RateLimit-Limit', maxRequests);
        res.set('X-RateLimit-Remaining', maxRequests - 1);
        next();
        return;
      }
      
      // Check if window has expired
      if (now - record.timestamp > windowMs) {
        // Reset window
        const newRecord = {
          count: 1,
          timestamp: now
        };
        
        if (redisClient) {
          await redisClient.setEx(key, Math.ceil(windowMs / 1000), JSON.stringify(newRecord));
        } else {
          rateLimitStore.set(key, newRecord);
        }
        
        res.set('X-RateLimit-Limit', maxRequests);
        res.set('X-RateLimit-Remaining', maxRequests - 1);
        next();
        return;
      }
      
      // Increment request count
      record.count++;
      
      if (redisClient) {
        await redisClient.setEx(key, Math.ceil(windowMs / 1000), JSON.stringify(record));
      } else {
        rateLimitStore.set(key, record);
      }
      
      // Check if limit exceeded
      if (record.count > maxRequests) {
        res.set('X-RateLimit-Limit', maxRequests);
        res.set('X-RateLimit-Remaining', 0);
        res.set('X-RateLimit-Reset', new Date(record.timestamp + windowMs).toUTCString());
        return res.status(429).json({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.'
        });
      }
      
      res.set('X-RateLimit-Limit', maxRequests);
      res.set('X-RateLimit-Remaining', maxRequests - record.count);
      res.set('X-RateLimit-Reset', new Date(record.timestamp + windowMs).toUTCString());
      next();
    } catch (err) {
      console.error('Rate limiting error:', err);
      // Fail open - allow request if rate limiting fails
      next();
    }
  };
};

// Specialized rate limiting for authentication endpoints
const authRateLimit = rateLimit(900000, 5); // 5 requests per 15 minutes

// Specialized rate limiting for general API endpoints
const apiRateLimit = rateLimit(60000, 100); // 100 requests per minute

export {
  rateLimit,
  authRateLimit,
  apiRateLimit
};