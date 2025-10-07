import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (miniPlayerVideo) {
      setIsVisible(true);
      setShowVideo(false);
    }
  }, [miniPlayerVideo?.id]);

  if (!miniPlayerEnabled || !isVisible || !miniPlayerVideo) return null;

  const videoId = extractYouTubeId(miniPlayerVideo.videoUrl || '');
  if (!videoId) return null;

  const isLive = String(miniPlayerVideo.title || '').toLowerCase().includes('live');

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      isExpanded ? 'w-96 h-64' : 'w-80 h-48'
    }`}>
      <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
        {/* Video Content */}
        <div className="relative w-full h-full">
          {showVideo ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&rel=0&playsinline=1&modestbranding=1`}
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
                className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer hover:bg-black/50 transition-colors"
                onClick={() => setShowVideo(true)}
              >
                <div className="bg-red-600 hover:bg-red-700 rounded-full p-4 transition-colors">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            </>
          )}

          {!showVideo && (
            <>
              {isLive && (
                <div className="absolute top-2 left-2 z-10">
                  <div className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>LIVE NOW</span>
                  </div>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <h4 className="text-white text-sm font-medium line-clamp-2">
                  {miniPlayerVideo.title}
                </h4>
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="absolute top-2 right-2 z-20 flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-black/60 text-white hover:bg-black/80 p-1.5 h-auto rounded"
            title={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="bg-black/60 text-white hover:bg-black/80 p-1.5 h-auto rounded"
            title="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}