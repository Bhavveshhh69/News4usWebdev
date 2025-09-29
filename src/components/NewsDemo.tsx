import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Bell, User, BarChart3, AlertTriangle, Home } from 'lucide-react';

// Import our new components
import { Auth } from "./Auth";
import { ErrorPage } from "./ErrorPage";
import { StockMarketPage } from "./StockMarketPage";
import { AnnouncementBanner } from "./AnnouncementBanner";
import { ToastManager } from "./Notifications";

type DemoView = 'home' | 'auth' | 'error' | 'stocks';

interface NewsDemoProps {
  isDarkMode?: boolean;
}

export function NewsDemo({ isDarkMode }: NewsDemoProps) {
  const [currentView, setCurrentView] = useState<DemoView>('home');
  const [showBanner, setShowBanner] = useState(true);
  const [bannerType, setBannerType] = useState<'breaking' | 'maintenance' | 'election' | 'newsletter'>('breaking');

  const handleDemoToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'success':
        ToastManager.success("Article saved successfully!", "Success");
        break;
      case 'error':
        ToastManager.error("Failed to load article", "Error");
        break;
      case 'warning':
        ToastManager.warning("Limited time offer expires soon!", "Warning");
        break;
      case 'info':
        ToastManager.info("New articles available in Politics section", "Update");
        break;
    }
  };

  if (currentView === 'auth') {
    return <Auth onBack={() => setCurrentView('home')} />;
  }

  if (currentView === 'error') {
    return <ErrorPage onBackToHome={() => setCurrentView('home')} />;
  }

  if (currentView === 'stocks') {
    return (
      <div>
        <div className="bg-white dark:bg-gray-800 shadow-sm p-4">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentView('home')}
            className="mb-4"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Demo
          </Button>
        </div>
        <StockMarketPage isDarkMode={isDarkMode} />
      </div>
    );
  }

  const getBannerComponent = () => {
    switch (bannerType) {
      case 'breaking':
        return (
          <AnnouncementBanner
            type="urgent"
            title="BREAKING NEWS"
            message="URGENT: Major earthquake hits the Pacific region. Emergency response teams deployed."
            actionText="Live Updates"
            onAction={() => ToastManager.info("Redirecting to live coverage...")}
          />
        );
      case 'maintenance':
        return (
          <AnnouncementBanner
            type="warning"
            title="Scheduled Maintenance"
            message="Our website will undergo scheduled maintenance on Sunday from 2:00 AM to 4:00 AM EST."
            actionText="More Details"
          />
        );
      case 'election':
        return (
          <AnnouncementBanner
            type="announcement"
            title="ELECTION COVERAGE"
            message="Election Day Coverage: Real-time results and analysis as polls close across the nation."
            actionText="Follow Live Updates"
          />
        );
      case 'newsletter':
        return (
          <AnnouncementBanner
            type="info"
            title="Stay Informed"
            message="Get breaking news delivered to your inbox. Subscribe to our daily newsletter."
            actionText="Subscribe Now"
            onAction={() => ToastManager.success("Subscription successful!")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''}`}>
      {/* Demo Announcement Banner */}
      {showBanner && getBannerComponent()}

      {/* Demo Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                <span className="text-red-600">NEWS</span>
                <span className="text-gray-900 dark:text-white">4US</span>
                <Badge className="ml-2 bg-blue-600">Demo</Badge>
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentView('auth')}
              >
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Demo Controls */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>NEWS4US Component Demo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Page Navigation */}
                <div>
                  <h3 className="font-semibold mb-3">Navigate to Pages:</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => setCurrentView('auth')}>
                      <User className="w-4 h-4 mr-2" />
                      Auth Pages
                    </Button>
                    <Button onClick={() => setCurrentView('error')} variant="outline">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      404 Page
                    </Button>
                    <Button onClick={() => setCurrentView('stocks')} variant="outline">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Stock Market
                    </Button>
                  </div>
                </div>

                {/* Banner Controls */}
                <div>
                  <h3 className="font-semibold mb-3">Announcement Banners:</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="show-banner"
                        checked={showBanner}
                        onChange={(e) => setShowBanner(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="show-banner">Show Banner</label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm"
                        variant={bannerType === 'breaking' ? 'default' : 'outline'}
                        onClick={() => setBannerType('breaking')}
                      >
                        Breaking News
                      </Button>
                      <Button 
                        size="sm"
                        variant={bannerType === 'maintenance' ? 'default' : 'outline'}
                        onClick={() => setBannerType('maintenance')}
                      >
                        Maintenance
                      </Button>
                      <Button 
                        size="sm"
                        variant={bannerType === 'election' ? 'default' : 'outline'}
                        onClick={() => setBannerType('election')}
                      >
                        Election
                      </Button>
                      <Button 
                        size="sm"
                        variant={bannerType === 'newsletter' ? 'default' : 'outline'}
                        onClick={() => setBannerType('newsletter')}
                      >
                        Newsletter
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Toast Notifications */}
                <div>
                  <h3 className="font-semibold mb-3">Toast Notifications:</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm"
                      onClick={() => handleDemoToast('success')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Success Toast
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleDemoToast('error')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Error Toast
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleDemoToast('warning')}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Warning Toast
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleDemoToast('info')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Info Toast
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Authentication Pages</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>404 Error Page</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Stock Market Page</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Announcement Banners</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Toast Notifications</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usage Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-3">
                  <p>
                    <strong>Banners:</strong> Toggle the checkbox to show/hide banners and click buttons to change types.
                  </p>
                  <p>
                    <strong>Toasts:</strong> Click the colored buttons to trigger different toast notification types.
                  </p>
                  <p>
                    <strong>Pages:</strong> Navigate between different demo pages using the buttons above.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}