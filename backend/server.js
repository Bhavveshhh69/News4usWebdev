import express from 'express';
import cors from 'cors';
import yahooFinance from 'yahoo-finance2';

const app = express();
const port = 4000; // Port for the backend server

app.use(cors()); // Enable CORS for all routes

app.get('/api/stocks', async (req, res) => {
  const tickers = [
    '^NSEI',         // NIFTY 50
    'RELIANCE.NS',
    'TCS.NS',
    'HDFCBANK.NS',
    'INFY.NS',
    'ICICIBANK.NS',
    'HINDUNILVR.NS',
    'BHARTIARTL.NS'
  ];

  try {
    console.log('Fetching data for tickers:', tickers);
    const quotes = await yahooFinance.quote(tickers);
    console.log('Successfully fetched data from Yahoo Finance.');

    const stockData = quotes.map(quote => ({
      symbol: quote.symbol.replace('.NS', ''),
      longName: quote.longName,
      regularMarketPrice: quote.regularMarketPrice,
      regularMarketChange: quote.regularMarketChange,
      regularMarketChangePercent: quote.regularMarketChangePercent,
    }));

    res.json(stockData);
  } catch (error) {
    console.error('Failed to fetch stock data:', error);
    res.status(500).json({ message: 'Failed to fetch stock data', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
