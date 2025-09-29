import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Play, TrendingUp, Mail } from 'lucide-react';
// @ts-ignore - Ignore TypeScript error for sonner import
import { toast } from "sonner@2.0.3";

export function Sidebar() {
  const [email, setEmail] = useState('');

  const stockData = [
    { symbol: 'S&P 500', value: '4,234.56', change: '+1.2%', isPositive: true },
    { symbol: 'NASDAQ', value: '13,567.89', change: '+0.8%', isPositive: true },
    { symbol: 'DOW JONES', value: '34,123.45', change: '-0.3%', isPositive: false },
    { symbol: 'BITCOIN', value: '$45,678', change: '+2.1%', isPositive: true }
  ];

  const youtubeVideos = [
    {
      title: "Breaking: Global Climate Summit Updates",
      thumbnail: "https://images.unsplash.com/photo-1650984661525-7e6b1b874e47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2luZyUyMG5ld3MlMjBuZXdzcm9vbXxlbnwxfHx8fDE3NTgwMTA4Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "12:34"
    },
    {
      title: "Tech Market Analysis Today",
      thumbnail: "https://images.unsplash.com/photo-1645226880663-81561dcab0ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHN0b2NrJTIwbWFya2V0JTIwY2hhcnRzfGVufDF8fHx8MTc1ODAxMDg3N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "8:45"
    },
    {
      title: "Healthcare Breakthrough Report",
      thumbnail: "https://images.unsplash.com/photo-1618498082410-b4aa22193b38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwbWVkaWNhbCUyMG5ld3N8ZW58MXx8fHwxNzU4MDEwODc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "15:20"
    }
  ];

  const trendingArticles = [
    "Economic reforms reshape global markets",
    "Climate summit reaches historic agreement", 
    "Technology breakthrough in AI research",
    "Sports championship breaks viewership records",
    "Entertainment industry shows strong recovery"
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Successfully subscribed to news updates!");
      setEmail('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Live Stock Market */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-red-600" />
          <h3 className="font-bold text-gray-900 dark:text-white">Live Markets</h3>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        </div>
        
        <div className="space-y-3">
          {stockData.map((stock, index) => (
            <div key={index} className="flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded transition-colors">
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{stock.symbol}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stock.value}</p>
              </div>
              <span className={`text-sm font-medium ${
                stock.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {stock.change}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Live updates every 30 seconds
          </p>
        </div>
      </div>

      {/* YouTube News Links */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Video News</h3>
        
        <div className="space-y-4">
          {youtubeVideos.map((video, index) => (
            <div key={index} className="flex space-x-3 group cursor-pointer">
              <div className="relative flex-shrink-0">
                <ImageWithFallback
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-20 h-14 object-cover rounded"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded group-hover:bg-opacity-50 transition-all">
                  <Play className="w-4 h-4 text-white" />
                </div>
                <span className="absolute bottom-1 right-1 bg-black text-white text-xs px-1 rounded">
                  {video.duration}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-3 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {video.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Now */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Trending Now</h3>
        
        <div className="space-y-3">
          {trendingArticles.map((article, index) => (
            <div key={index} className="flex items-start space-x-3 group cursor-pointer">
              <span className="text-red-600 font-bold text-sm flex-shrink-0 mt-1">
                {index + 1}
              </span>
              <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                {article}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Subscription */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Mail className="w-5 h-5 text-red-600" />
          <h3 className="font-bold text-gray-900 dark:text-white">Stay Updated</h3>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Get the latest news in your inbox
        </p>
        
        <form onSubmit={handleSubscribe} className="space-y-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />
          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
            Subscribe Now
          </Button>
        </form>
      </div>
    </div>
  );
}