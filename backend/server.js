import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import yahooFinance from 'yahoo-finance2';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// AbortController is globally available in Node 18+
// No import needed

// Import routes
import authRoutes from './routes/authRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import tagRoutes from './routes/tagRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import userProfileRoutes from './routes/userProfileRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import youtubeRoutes from './routes/youtubeRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4002; // Use env PORT when provided

// Security middleware - CRITICAL for cookie authentication
app.use(cookieParser()); // Parse cookies for authentication
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://news4us.in', 'https://www.news4us.in']
    : ['http://localhost:3001', 'http://localhost:5173'],
  credentials: true // Allow cookies to be sent
}));
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/user', userProfileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/youtube', youtubeRoutes);

// Serve static frontend in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDir = path.join(__dirname, 'public');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(staticDir));
  // SPA fallback for non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

// Improved stock data endpoint with better error handling and fallback data
app.get('/api/stocks', async (req, res) => {
  // Using more reliable tickers that are likely to have data
  const tickers = [
    '^GSPC',         // S&P 500
    'AAPL',          // Apple
    'MSFT',          // Microsoft
    'GOOGL',         // Google
    'AMZN',          // Amazon
    'TSLA',          // Tesla
    'META',          // Meta/Facebook
    'NFLX'           // Netflix
  ];

  try {
    console.log('Fetching data for tickers:', tickers);
    
    // Add timeout control to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const quotes = await yahooFinance.quote(tickers, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log('Successfully fetched data from Yahoo Finance.');

    // Process the data with better error handling
    const stockData = quotes.map(quote => ({
      symbol: quote.symbol || 'N/A',
      longName: quote.longName || quote.symbol || 'Unknown Company',
      regularMarketPrice: quote.regularMarketPrice || 0,
      regularMarketChange: quote.regularMarketChange || 0,
      regularMarketChangePercent: quote.regularMarketChangePercent || 0,
    })).filter(stock => stock.symbol !== 'N/A'); // Remove any invalid entries

    if (stockData.length === 0) {
      throw new Error('No valid stock data received');
    }

    res.json(stockData);
  } catch (error) {
    console.error('Failed to fetch stock data:', error);
    
    // Handle different types of errors
    let errorMessage = 'Unable to fetch live market data';
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout - market data service is slow to respond';
    } else if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
      errorMessage = 'Network error - unable to connect to market data service';
    } else if (error.message && error.message.includes('Yahoo')) {
      errorMessage = 'Market data service temporarily unavailable';
    }
    
    // Comprehensive fallback data when Yahoo Finance is unavailable
    const fallbackData = [
      { symbol: 'AAPL', longName: 'Apple Inc.', regularMarketPrice: 175.25, regularMarketChange: 2.35, regularMarketChangePercent: 1.36 },
      { symbol: 'MSFT', longName: 'Microsoft Corp.', regularMarketPrice: 335.65, regularMarketChange: -1.25, regularMarketChangePercent: -0.37 },
      { symbol: 'GOOGL', longName: 'Alphabet Inc.', regularMarketPrice: 138.22, regularMarketChange: 3.42, regularMarketChangePercent: 2.54 },
      { symbol: 'AMZN', longName: 'Amazon.com Inc.', regularMarketPrice: 145.18, regularMarketChange: 0.85, regularMarketChangePercent: 0.59 },
      { symbol: 'TSLA', longName: 'Tesla Inc.', regularMarketPrice: 248.50, regularMarketChange: -5.25, regularMarketChangePercent: -2.07 },
      { symbol: 'META', longName: 'Meta Platforms Inc.', regularMarketPrice: 315.75, regularMarketChange: 7.35, regularMarketChangePercent: 2.38 },
      { symbol: 'NFLX', longName: 'Netflix Inc.', regularMarketPrice: 465.80, regularMarketChange: -2.15, regularMarketChangePercent: -0.46 },
      { symbol: 'SPX', longName: 'S&P 500 Index', regularMarketPrice: 4567.89, regularMarketChange: 23.45, regularMarketChangePercent: 0.51 }
    ];
    
    // Send fallback data with error information
    res.status(200).json({
      data: fallbackData,
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});