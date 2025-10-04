import React, { useState, useRef, useEffect } from 'react';
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, X, ExternalLink } from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  thumbnail?: string;
  isLive?: boolean;
  autoPlay?: boolean;
  showModal?: boolean;
  onClose?: () => void;
  className?: string;
}

export function VideoPlayer({
  videoId,
  title,
  thumbnail,
  isLive = false,
  autoPlay = false,
  showModal = false,
  onClose,
  className = ""
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isPiP, setIsPiP] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // YouTube embed URL
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=1&rel=0`;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const togglePiP = async () => {
    if (videoRef.current) {
      try {
        if (!isPiP) {
          await videoRef.current.requestPictureInPicture();
          setIsPiP(true);
        } else {
          document.exitPictureInPicture();
          setIsPiP(false);
        }
      } catch (error) {
        console.log('PiP not supported or failed:', error);
      }
    }
  };

  const openYouTube = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  useEffect(() => {
    let hideControlsTimeout: NodeJS.Timeout;

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(hideControlsTimeout);
      hideControlsTimeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
      clearTimeout(hideControlsTimeout);
    };
  }, [isPlaying]);

  const VideoContent = () => (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
      style={{ aspectRatio: '16/9' }}
    >
      {/* LIVE Badge */}
      {isLive && (
        <div className="absolute top-3 left-3 z-20">
          <div className="bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold flex items-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>LIVE</span>
          </div>
        </div>
      )}

      {/* YouTube iframe - primary video display */}
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />

      {/* Custom overlay controls */}
      <div
        className={`absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center space-x-4">
          {/* Play button overlay */}
          <Button
            variant="ghost"
            size="lg"
            onClick={togglePlay}
            className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-4 rounded-full"
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </Button>
        </div>
      </div>

      {/* Bottom controls bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>

            <span className="text-white text-sm font-medium truncate max-w-40">
              {title}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Picture-in-Picture */}
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePiP}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2"
              title="Picture-in-Picture"
            >
              {isPiP ? <Minimize className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
            </Button>

            {/* Open in YouTube */}
            <Button
              variant="ghost"
              size="sm"
              onClick={openYouTube}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2"
              title="Open in YouTube"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (showModal) {
    return (
      <Dialog open={showModal} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-full p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="p-6 pt-4">
            <VideoContent />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return <VideoContent />;
}

// Simple video thumbnail component for VideoNews section
interface VideoThumbnailProps {
  videoId: string;
  title: string;
  duration?: string;
  isLive?: boolean;
  onClick: () => void;
  className?: string;
}

export function VideoThumbnail({
  videoId,
  title,
  duration,
  isLive = false,
  onClick,
  className = ""
}: VideoThumbnailProps) {
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div 
      className={`relative cursor-pointer group ${className}`}
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-lg">
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          style={{ aspectRatio: '16/9' }}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (!target.dataset.fallback) {
              target.dataset.fallback = '1';
              target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }
          }}
        />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-red-600 hover:bg-red-700 rounded-full p-3">
            <Play className="w-6 h-6 text-white ml-1" />
          </div>
        </div>

        {/* LIVE Badge */}
        {isLive && (
          <div className="absolute top-2 left-2">
            <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              <span>LIVE</span>
            </div>
          </div>
        )}

        {/* Duration */}
        {duration && !isLive && (
          <div className="absolute bottom-2 right-2">
            <div className="bg-black bg-opacity-80 text-white px-2 py-1 rounded text-xs">
              {duration}
            </div>
          </div>
        )}
      </div>

      <div className="mt-2">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
          {title}
        </h3>
      </div>
    </div>
  );
}