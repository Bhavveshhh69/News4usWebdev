import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Play, TrendingUp } from 'lucide-react';
// @ts-ignore - Ignore TypeScript error for sonner import
import { toast } from "sonner@2.0.3";
import { StockData, YouTubeVideo, TrendingArticle } from '../types';

interface SidebarProps {
  stockData: StockData[];
  youtubeVideos: YouTubeVideo[];
  trendingArticles: TrendingArticle[];
}

export function Sidebar({ stockData, youtubeVideos, trendingArticles }: SidebarProps) {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: any) => {
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

      {/* Trending Articles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Trending</h3>
        
        <div className="space-y-3">
          {trendingArticles.map((article, index) => (
            <div key={index} className="flex items-start space-x-2 group cursor-pointer">
              <span className="text-red-600 font-bold text-sm">{index + 1}.</span>
              <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                {article}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg shadow-md p-6 text-white">
        <h3 className="font-bold mb-2">Stay Updated</h3>
        <p className="text-red-100 text-sm mb-4">
          Get the latest news delivered to your inbox
        </p>
        
        <form onSubmit={handleSubscribe} className="space-y-3">
          <div>
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/20 border-white/30 text-white placeholder-red-200 focus:ring-white focus:border-white"
            />
          </div>
          <Button 
            type="submit"
            className="w-full bg-white text-red-600 hover:bg-red-50"
          >
            Subscribe
          </Button>
        </form>
      </div>
    </div>
  );
}