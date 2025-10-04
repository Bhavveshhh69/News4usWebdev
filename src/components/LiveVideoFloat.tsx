import React, { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { X, Maximize2, Minimize2, Play } from 'lucide-react';
import { Button } from "./ui/button";
import { useContent } from '../store/contentStore';
import { extractYouTubeId } from '../utils/youtube';

export function LiveVideoFloat() {
  const { youtubeVideos, miniPlayerEnabled } = useContent() as any;
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const miniPlayerVideo = (youtubeVideos && youtubeVideos.length > 0)
    ? (youtubeVideos.find((v: any) => v.isMiniPlayer) || youtubeVideos[0])
    : null;
  if (!miniPlayerEnabled || !isVisible || !miniPlayerVideo) return null;

  const videoId = extractYouTubeId(miniPlayerVideo.videoUrl || '');

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
          {showVideo ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&rel=0&playsinline=1`}
              title={miniPlayerVideo.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <>
              <ImageWithFallback
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt={miniPlayerVideo.title}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                onClick={() => setShowVideo(true)}
              >
                <div className="bg-red-600 rounded-full p-3">
                  <Play className="w-6 h-6 text-white ml-1" />
                </div>
              </div>
            </>
          )}
          
          {/* Video overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          {/* Video info */}
          <div className="absolute bottom-2 left-2 right-2">
            <h4 className="text-white text-sm font-medium line-clamp-2">
              {miniPlayerVideo.title}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}