import React, { useState, useEffect } from 'react';
import { Router, Route, useRouter } from "./components/Router";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { LiveVideoFloat } from "./components/LiveVideoFloat";
import { BackToTop } from "./components/BackToTop";
import { SocialShare } from "./components/SocialShare";
import { ErrorPage } from "./components/ErrorPage";
import { Toaster } from "./components/ui/sonner";
import { ReadingProgress } from "./components/ReadingProgress";
import { ContentProvider } from "./store/contentStore";
import { NavigationItem } from './types';

// Import pages
import { HomePage } from "./components/pages/HomePage";
import { CategoryPage } from "./components/pages/CategoryPage";
import { ArticlePage } from "./components/pages/ArticlePage";
import { AdminLoginPage } from "./components/pages/AdminLoginPage";
import { AdminDashboard } from "./components/pages/AdminDashboard";
import { AuthPage } from "./components/pages/AuthPage";
import { AboutPage } from "./components/pages/AboutPage";
import { EPaperPage } from "./components/pages/EPaperPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { TestPage } from "./components/TestPage"; // Added test page

const LOGO_PATH = '/logo.png';
const BRAND_IMAGE_PATH = '/brand.png';

const newsLogo = new URL(LOGO_PATH, import.meta.url).href;
const brandImage = new URL(BRAND_IMAGE_PATH, import.meta.url).href;

const NAVIGATION_ITEMS: NavigationItem[] = [
  { name: 'Home', path: '/' },
  { name: 'News', path: '/category' },
  { name: 'Politics', path: '/politics' },
  { name: 'Health', path: '/health' },
  { name: 'Sports', path: '/sports' },
  { name: 'Entertainment', path: '/entertainment' },
  { name: 'About Us', path: '/about' },
  { name: 'E-Paper', path: '/e-paper' }
];

function AppLayout() {
  const { currentRoute } = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isQuickRead, setIsQuickRead] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Ensure dark mode is applied by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Render the main website layout
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''}`}>
      <ReadingProgress className="z-[60]" />
      
      {/* Render header only for non-admin pages */}
      {!currentRoute.startsWith('/admin') && (
        <Header
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          showThemeToggle={false}
          logoSrc={newsLogo}
          brandImageSrc={brandImage}
          navigationItems={NAVIGATION_ITEMS}
        />
      )}
      
      {/* Router Routes */}
      <Route path="/" exact component={() => (
        <HomePage 
          isDarkMode={isDarkMode} 
          isQuickRead={isQuickRead} 
          setIsQuickRead={setIsQuickRead} 
        />
      )} />
      
      <Route path="/category" component={() => (
        <CategoryPage 
          category="News"
          isQuickRead={isQuickRead} 
        />
      )} />
      
      <Route path="/politics" component={() => (
        <CategoryPage 
          category="Politics"
          isQuickRead={isQuickRead} 
        />
      )} />
      
      <Route path="/health" component={() => (
        <CategoryPage 
          category="Health"
          isQuickRead={isQuickRead} 
        />
      )} />
      
      <Route path="/sports" component={() => (
        <CategoryPage 
          category="Sports"
          isQuickRead={isQuickRead} 
        />
      )} />
      
      <Route path="/entertainment" component={() => (
        <CategoryPage 
          category="Entertainment"
          isQuickRead={isQuickRead} 
        />
      )} />
      
      <Route path="/article" component={() => (
        <ArticlePage 
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode} 
        />
      )} />
      
      <Route path="/about" exact component={AboutPage} />
      <Route path="/e-paper" exact component={EPaperPage} />
      <Route path="/auth" exact component={AuthPage} />
      
      {/* Admin Routes */}
      <Route path="/admin-login" exact component={AdminLoginPage} />
      <Route path="/admin" exact component={AdminDashboard} />
      
      {/* Test Page Route */}
      <Route path="/test" exact component={TestPage} />
      
      {/* 404 Error Page - Default route */}
      <Route path="/404" exact component={() => <ErrorPage />} />

      {!currentRoute.startsWith('/admin') && (
        <>
          <Footer />
          <LiveVideoFloat />
          <BackToTop />
          
          {/* Floating Social Share */}
          <SocialShare 
            variant="floating"
            className="hidden xl:block"
          />
        </>
      )}
      
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ContentProvider>
        <ErrorBoundary>
          <AppLayout />
        </ErrorBoundary>
      </ContentProvider>
    </Router>
  );
}