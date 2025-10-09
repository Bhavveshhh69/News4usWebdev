import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Menu, X, Moon, Sun, Newspaper } from 'lucide-react';
import { Link, useRouter } from './Router';
const RLink: any = Link;

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  showThemeToggle?: boolean;
}

const NAVIGATION_ITEMS = [
  { name: 'Home', path: '/' },
  { name: 'News', path: '/category' },
  { name: 'Politics', path: '/politics' },
  { name: 'Health', path: '/health' },
  { name: 'Sports', path: '/sports' },
  { name: 'Entertainment', path: '/entertainment' },
  { name: 'About Us', path: '/about' },
  { name: 'E-Paper', path: '/e-paper' }
];

export function Header({ isDarkMode, toggleDarkMode, showThemeToggle = false }: HeaderProps) {
  const { currentRoute } = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState('/Newlogo.jpeg');

  // Function to handle logo loading errors
  const handleLogoError = () => {
    // Try alternative logo paths in order of preference
    const fallbackLogos = [
      '/logo.png',
      '/news-logo.jpg'
    ];
    
    // If we haven't tried all fallbacks yet, try the next one
    const currentIndex = fallbackLogos.indexOf(logoSrc);
    if (currentIndex < fallbackLogos.length - 1) {
      setLogoSrc(fallbackLogos[currentIndex + 1]);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6 md:py-8 lg:py-10 xl:py-12 gap-4 lg:gap-7 xl:gap-8 lg:grid lg:grid-cols-3">
          {/* Left: Logo Section */}
          <div className="flex items-center space-x-4 md:space-x-5 lg:space-x-6 xl:space-x-7 justify-start min-w-0">
            <img 
              src={logoSrc} 
              alt="NEWS4US Official Logo" 
              onError={handleLogoError}
              className="h-12 sm:h-14 md:h-16 lg:h-20 xl:h-24 w-auto object-contain shrink-0"
            />
            <RLink to="/">
              <h1 className="hidden sm:block text-3xl md:text-4xl lg:text-5xl xl:text-6xl tracking-tight font-extrabold cursor-pointer">
                <span className="text-red-700 dark:text-red-600">NEWS</span>
                <span className="text-gray-900 dark:text-white">4US</span>
              </h1>
            </RLink>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex justify-center lg:text-lg xl:text-xl">
            <div className="flex items-center">
              {NAVIGATION_ITEMS.map((item, index) => (
                <>
                  <RLink
                    to={item.path}
                    className={`transition-colors duration-300 flex items-center whitespace-nowrap font-medium px-3 py-2 rounded-md mx-1 ${
                      currentRoute === item.path
                        ? 'text-red-700 font-bold dark:text-red-500 bg-red-50 dark:bg-red-900/20'
                        : item.name === 'E-Paper' 
                          ? 'text-red-700 font-semibold dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10' 
                          : 'text-gray-700 hover:text-red-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-red-500 dark:hover:bg-gray-800'
                    }`}
                  >
                    {item.name === 'E-Paper' && <Newspaper className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 mr-2" />}
                    <span>{item.name}</span>
                  </RLink>
                  {index < NAVIGATION_ITEMS.length - 1 && (
                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                  )}
                </>
              ))}
            </div>
          </nav>

          {/* Right: Controls and Brand */}
          <div className="flex items-center justify-end space-x-4 md:space-x-5 lg:space-x-6 xl:space-x-8">
            {/* Brand/Sponsor Section - Hidden on smaller screens */}
            <div className="hidden xl:flex items-center">
              <img 
                src="/brand.png" 
                alt="NEWS4US Brand Image" 
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/e465bbd90453757b67bdbd6f68b53e083c3b6284.png'; }}
                className="h-14 xl:h-16 w-auto object-contain"
              />
            </div>

            {/* Dark Mode Toggle (optional) */}
            {showThemeToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="p-3 md:p-3.5 lg:p-4 xl:p-5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                {isDarkMode ? <Sun className="h-6 w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8" /> : <Moon className="h-6 w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8" />}
              </Button>
            )}
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-4 pt-4 pb-5 space-y-2 sm:px-5 bg-white dark:bg-gray-900 border-t dark:border-gray-700">
              {NAVIGATION_ITEMS.map((item) => (
                <RLink
                  key={item.name}
                  to={item.path}
                  className={`block px-5 py-4 rounded-lg transition-colors duration-300 font-medium ${
                    currentRoute === item.path
                      ? 'bg-red-50 text-red-700 font-bold dark:bg-red-900/30 dark:text-red-500'
                      : item.name === 'E-Paper'
                        ? 'text-red-700 font-semibold dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-gray-700 hover:text-red-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-red-500 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center space-x-4">
                    {item.name === 'E-Paper' && <Newspaper className="w-5 h-5" />}
                    <span className="text-lg">{item.name}</span>
                  </div>
                </RLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}