import React, { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from "./ui/button";

export function LiveVideoFloat() {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      isExpanded ? 'w-80 h-60' : 'w-64 h-40'
    }`}>
      <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
        {/* Live Badge */}
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>LIVE NOW</span>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute top-2 right-2 z-10 flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-black/50 text-white hover:bg-black/70 p-1 h-auto"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="bg-black/50 text-white hover:bg-black/70 p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Video Content */}
        <div className="relative w-full h-full">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1650984661525-7e6b1b874e47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2luZyUyMG5ld3MlMjBuZXdzcm9vbXxlbnwxfHx8fDE3NTgwMTA4Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Live News Stream"
            className="w-full h-full object-cover"
          />
          
          {/* Video overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          {/* Video info */}
          <div className="absolute bottom-2 left-2 right-2">
            <h4 className="text-white text-sm font-medium line-clamp-2">
              Breaking: Global Climate Summit Live Coverage
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}