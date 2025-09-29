import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3 } from 'lucide-react';

interface StockMarketPageProps {
  isDarkMode?: boolean;
}

export function StockMarketPage({ isDarkMode }: StockMarketPageProps) {
  const [timeFilter, setTimeFilter] = useState('1D');

  const majorIndices = [
    { 
      name: 'S&P 500', 
      symbol: 'SPX', 
      value: '4,234.56', 
      change: '+52.34', 
      percentage: '+1.25%', 
      isPositive: true,
      description: 'US Large Cap Index'
    },
    { 
      name: 'NASDAQ Composite', 
      symbol: 'IXIC', 
      value: '13,567.89', 
      change: '+108.45', 
      percentage: '+0.81%', 
      isPositive: true,
      description: 'Technology Heavy Index'
    },
    { 
      name: 'Dow Jones', 
      symbol: 'DJI', 
      value: '34,123.45', 
      change: '-102.33', 
      percentage: '-0.30%', 
      isPositive: false,
      description: 'Industrial Average'
    },
    { 
      name: 'Russell 2000', 
      symbol: 'RUT', 
      value: '1,987.65', 
      change: '+15.67', 
      percentage: '+0.79%', 
      isPositive: true,
      description: 'Small Cap Index'
    }
  ];

  const trendingStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: '$182.34', change: '+2.45%', volume: '89.2M', isPositive: true },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: '$245.67', change: '+5.12%', volume: '125.4M', isPositive: true },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '$128.90', change: '-1.23%', volume: '67.8M', isPositive: false },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: '$139.45', change: '+1.87%', volume: '45.6M', isPositive: true },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: '$378.12', change: '+0.95%', volume: '32.1M', isPositive: true },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: '$725.89', change: '+3.44%', volume: '78.9M', isPositive: true }
  ];

  const cryptoData = [
    { symbol: 'BTC', name: 'Bitcoin', price: '$45,678', change: '+2.34%', isPositive: true },
    { symbol: 'ETH', name: 'Ethereum', price: '$2,987', change: '+1.87%', isPositive: true },
    { symbol: 'BNB', name: 'Binance Coin', price: '$298', change: '-0.45%', isPositive: false },
    { symbol: 'SOL', name: 'Solana', price: '$87.34', change: '+4.56%', isPositive: true }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <BarChart3 className="w-8 h-8 text-red-600 mr-3" />
                Stock Market
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Real-time market data and analysis
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Live Market Data</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Time Filter Tabs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Market Overview</h2>
            <div className="flex items-center space-x-2">
              {['1D', '1W', '1M', '3M', '1Y'].map((period) => (
                <Button
                  key={period}
                  variant={timeFilter === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeFilter(period)}
                  className={timeFilter === period ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>

          {/* Major Indices */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {majorIndices.map((index, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {index.symbol}
                      </CardTitle>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{index.name}</p>
                    </div>
                    {index.isPositive ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{index.value}</p>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={index.isPositive ? "default" : "destructive"}
                        className={index.isPositive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                      >
                        {index.change} ({index.percentage})
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{index.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Market Sections */}
        <Tabs defaultValue="stocks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="stocks">Trending Stocks</TabsTrigger>
            <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          </TabsList>

          <TabsContent value="stocks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-red-600" />
                  Trending Stocks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 font-medium text-gray-600 dark:text-gray-400">Symbol</th>
                        <th className="text-left py-3 font-medium text-gray-600 dark:text-gray-400">Company</th>
                        <th className="text-right py-3 font-medium text-gray-600 dark:text-gray-400">Price</th>
                        <th className="text-right py-3 font-medium text-gray-600 dark:text-gray-400">Change</th>
                        <th className="text-right py-3 font-medium text-gray-600 dark:text-gray-400">Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trendingStocks.map((stock, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-4 font-semibold text-gray-900 dark:text-white">{stock.symbol}</td>
                          <td className="py-4 text-gray-700 dark:text-gray-300">{stock.name}</td>
                          <td className="py-4 text-right font-semibold text-gray-900 dark:text-white">{stock.price}</td>
                          <td className={`py-4 text-right font-medium ${stock.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.change}
                          </td>
                          <td className="py-4 text-right text-gray-600 dark:text-gray-400">{stock.volume}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crypto" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-red-600" />
                  Cryptocurrency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {cryptoData.map((crypto, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">{crypto.symbol}</span>
                        {crypto.isPositive ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{crypto.name}</p>
                      <p className="font-bold text-lg text-gray-900 dark:text-white">{crypto.price}</p>
                      <p className={`text-sm font-medium ${crypto.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {crypto.change}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="watchlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Watchlist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Your watchlist is empty
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Add stocks to your watchlist to track their performance
                  </p>
                  <Button className="bg-red-600 hover:bg-red-700">
                    Browse Stocks
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}