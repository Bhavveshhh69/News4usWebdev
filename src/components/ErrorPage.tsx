import React from 'react';
import { Button } from "./ui/button";
import { Home, AlertTriangle } from 'lucide-react';

interface ErrorPageProps {
  onBackToHome?: () => void;
}

export function ErrorPage({ onBackToHome }: ErrorPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        {/* NEWS4US Logo */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            <span className="text-red-600">NEWS</span>
            <span className="text-gray-900 dark:text-white">4US</span>
          </h1>
        </div>

        {/* 404 Number */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="w-16 h-16 text-red-600" />
          </div>
          <h2 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">404</h2>
          <div className="w-24 h-1 bg-red-600 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Page Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Oops! The page you are looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={onBackToHome || (() => window.location.href = '/')}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
            size="lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline"
              onClick={() => window.history.back()}
              className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Go Back
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Reload Page
            </Button>
          </div>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            You might be looking for:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a href="#" className="text-red-600 hover:text-red-700 hover:underline">
              Latest News
            </a>
            <a href="#" className="text-red-600 hover:text-red-700 hover:underline">
              Politics
            </a>
            <a href="#" className="text-red-600 hover:text-red-700 hover:underline">
              Sports
            </a>
            <a href="#" className="text-red-600 hover:text-red-700 hover:underline">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}