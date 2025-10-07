import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Newspaper } from 'lucide-react';
import { Link } from './Router';
import { useContent } from '../store/contentStore';
const RLink: any = Link;

// Navigation items that sync with Header component
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

export function Footer() {
  const { articles } = useContent();
  
  // Get published articles
  const published = articles.filter(a => (a.status === 'published') || (a.status === 'scheduled' && new Date(a.publishDate).getTime() <= Date.now()));
  const sorted = [...published].sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

  // Get editor's picks from featured articles
  const editorsPicks = sorted
    .filter(a => a.placements?.categorySpot === 'featured')
    .slice(0, 3)
    .map(a => a.title);

  // Fallback editor's picks if no featured articles are available
  const fallbackEditorsPicks = [
    "Global economic outlook for 2024",
    "Climate change impact on markets",
    "Technology sector transformation"
  ];

  const displayEditorsPicks = editorsPicks.length > 0 ? editorsPicks : fallbackEditorsPicks;

  // Footer links - could be made configurable through CMS in the future
  const footerLinks = [
    "Contact Us",
    "Privacy Policy", 
    "Terms of Service",
    "Advertise",
    "Careers"
  ];

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">
              <span className="text-red-600">NEWS</span>4US
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted source for breaking news, in-depth analysis, and real-time updates from around the world. 
              We deliver accurate, unbiased journalism 24/7.
            </p>
          </div>

          {/* Navigation Links - Dynamically synced with Header */}
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              {NAVIGATION_ITEMS.map((item) => (
                <li key={item.name}>
                  <RLink 
                    to={item.path} 
                    className={`transition-colors flex items-center space-x-1 ${
                      item.name === 'E-Paper' 
                        ? 'text-red-400 font-medium' 
                        : 'text-gray-300 hover:text-red-400'
                    }`}
                  >
                    {item.name === 'E-Paper' && <Newspaper className="w-3 h-3" />}
                    <span>{item.name}</span>
                  </RLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-300 hover:text-red-400 transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Editor's Picks & Social Media */}
          <div>
            <h4 className="font-semibold mb-4">Editor's Picks</h4>
            <ul className="space-y-3 mb-6">
              {displayEditorsPicks.map((article, index) => (
                <li key={index}>
                  <a href="#" className="text-sm text-gray-300 hover:text-red-400 transition-colors line-clamp-2">
                    {article}
                  </a>
                </li>
              ))}
            </ul>
            
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-300 hover:text-red-400 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-red-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-red-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-red-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-red-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
            <p className="text-gray-400 text-xs">
              © 2024 NEWS4US. All rights reserved.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            NEWS4US is committed to delivering accurate, timely, and unbiased news coverage.
          </p>
        </div>
      </div>
    </footer>
  );
}

// Export navigation items for use in Header component
export { NAVIGATION_ITEMS };