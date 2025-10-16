import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Newspaper, RefreshCw } from 'lucide-react';

interface StockData {
  symbol: string;
  longName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
}

export function LiveMarketUpdates() {
  const [marketData, setMarketData] = useState([] as StockData[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null as string | null);
  const [lastUpdated, setLastUpdated] = useState(null as string | null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStockData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }
    setError(null);
    try {
      setLoading(true);
      // Use environment variable for API endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/stocks`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('Stock data received:', result); // Debug log
      
      // Handle both direct data and data with error information
      if (Array.isArray(result)) {
        // Direct data array
        setMarketData(result);
      } else if (result.data && Array.isArray(result.data)) {
        // Data with error information
        setMarketData(result.data);
        if (result.error) {
          setError(result.error);
        }
      } else {
        throw new Error('Invalid data format received from server');
      }
      
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error: any) {
      console.error("Failed to fetch stock data:", error);
      setError(error.message || 'Unable to fetch live market data. Please check your connection and try again.');
      
      // Set fallback data for better user experience
      const fallbackData = [
        { symbol: 'AAPL', longName: 'Apple Inc.', regularMarketPrice: 175.25, regularMarketChange: 2.35, regularMarketChangePercent: 1.36 },
        { symbol: 'MSFT', longName: 'Microsoft Corp.', regularMarketPrice: 335.65, regularMarketChange: -1.25, regularMarketChangePercent: -0.37 },
        { symbol: 'GOOGL', longName: 'Alphabet Inc.', regularMarketPrice: 138.22, regularMarketChange: 3.42, regularMarketChangePercent: 2.54 },
        { symbol: 'AMZN', longName: 'Amazon.com Inc.', regularMarketPrice: 145.18, regularMarketChange: 0.85, regularMarketChangePercent: 0.59 },
        { symbol: 'TSLA', longName: 'Tesla Inc.', regularMarketPrice: 248.50, regularMarketChange: -5.25, regularMarketChangePercent: -2.07 },
        { symbol: 'META', longName: 'Meta Platforms Inc.', regularMarketPrice: 315.75, regularMarketChange: 7.35, regularMarketChangePercent: 2.38 }
      ];
      setMarketData(fallbackData);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStockData();
    // Refresh every 30 seconds
    const interval = setInterval(() => fetchStockData(false), 30000);

    return () => clearInterval(interval);
  }, []);
  
  const marketNews = [
    "Inflation concerns weigh on investor sentiment",
    "Tech sector leads market rally on strong earnings",
    "Global supply chain issues continue to impact manufacturing",
    "Healthcare stocks show strong quarterly performance"
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-6">
        <DollarSign className="w-6 h-6 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Live Market Updates</h2>
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <button 
          onClick={() => fetchStockData(true)}
          disabled={loading || isRefreshing}
          className="ml-auto text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p className="font-bold">Notice</p>
          <p>{error}</p>
          <p className="mt-2 text-sm">Displaying sample data. Click refresh to try again.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Data Grid */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : marketData && marketData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketData.map((stock) => {
                const isPositive = stock.regularMarketChange > 0;
                // Use stock symbol as key instead of index for better React performance
                return (
                  <div key={stock.symbol} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{stock.symbol}</h3>
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{stock.regularMarketPrice?.toFixed(2) || 'N/A'}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stock.regularMarketChange?.toFixed(2) || 'N/A'}
                        </span>
                        <span className={`text-xs ${
                          isPositive ? 'text-green-500' : 'text-red-500'
                        }`}>
                          ({stock.regularMarketChangePercent?.toFixed(2) || 'N/A'}%)
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{stock.longName}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No market data available</p>
            </div>
          )}
          
          {lastUpdated && (
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-right">
              Last updated: {lastUpdated}
            </div>
          )}
        </div>

        {/* Market News */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Market Headlines</h3>
            <div className="space-y-4">
              {marketNews.map((news, index) => (
                <div key={index} className="flex items-start space-x-3 group cursor-pointer">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-relaxed">
                    {news}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Live updates every 30 seconds
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}