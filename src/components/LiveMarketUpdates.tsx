import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Newspaper } from 'lucide-react';
import { useContent } from '../store/contentStore';

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
  const { articles } = useContent();

  useEffect(() => {
    const fetchStockData = async () => {
      setError(null);
      try {
        setLoading(true);
        // Use a relative path for the API endpoint to work in different environments
        const response = await fetch('/api/stocks');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMarketData(data);
      } catch (error: any) {
        console.error("Failed to fetch stock data:", error);
        setError(error.message || 'Failed to fetch stock data. Please make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStockData, 30000);

    return () => clearInterval(interval);
  }, []);
  
  // Get market-related articles from the content store
  const marketNews = articles
    .filter(article => 
      article.category.toLowerCase().includes('business') || 
      article.tags.some(tag => tag.toLowerCase().includes('market')) ||
      article.title.toLowerCase().includes('market') ||
      article.summary.toLowerCase().includes('market')
    )
    .slice(0, 4)
    .map(article => article.title);

  // Fallback market news if no articles are available
  const fallbackMarketNews = [
    "Inflation concerns weigh on investor sentiment",
    "Tech sector leads market rally on strong earnings",
    "Global supply chain issues continue to impact manufacturing",
    "Healthcare stocks show strong quarterly performance"
  ];

  const displayMarketNews = marketNews.length > 0 ? marketNews : fallbackMarketNews;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-6">
        <DollarSign className="w-6 h-6 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Live Market Updates</h2>
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
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
          ) : (
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
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{stock.regularMarketPrice.toFixed(2)}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stock.regularMarketChange.toFixed(2)}
                        </span>
                        <span className={`text-xs ${
                          isPositive ? 'text-green-500' : 'text-red-500'
                        }`}>
                          ({stock.regularMarketChangePercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Market News */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Market Headlines</h3>
            <div className="space-y-4">
              {displayMarketNews.map((news, index) => (
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