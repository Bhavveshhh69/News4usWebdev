import React, { useState } from 'react';
import { VideoPlayer, VideoThumbnail } from './VideoPlayer';
import { VideoShare } from './SocialShare';
import { Play } from 'lucide-react';
import { useContent } from '../store/contentStore';
import { extractYouTubeId } from '../utils/youtube';

type VideoNewsItem = {
  id: string | number;
  title: string;
  videoId: string;
  duration: string;
  views: string;
  source: string;
  timeAgo: string;
  isLive: boolean;
};

export function VideoNews() {
  const [selectedVideo, setSelectedVideo] = useState<VideoNewsItem | null>(null);
  const { youtubeVideos } = useContent();

  // Convert all videos from the store to the format expected by the component
  const videoNews = youtubeVideos.map((video, index) => ({
    id: `video-${video.id || index}`,
    title: video.title,
    videoId: extractYouTubeId(video.videoUrl),
    duration: "", // This could be fetched from YouTube API in a real app
    views: "1.2M", // Placeholder
    source: "NEWS4US", // Placeholder
    timeAgo: "Recently added", // Placeholder
    isLive: video.title.toLowerCase().includes('live'), // Simple heuristic
  }));

  const openVideo = (video: VideoNewsItem) => {
    setSelectedVideo(video);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-6">
        <Play className="w-6 h-6 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Video News</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoNews.map((video) => (
          <div 
            key={video.id} 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group relative"
          >
            <div className="relative">
              <VideoThumbnail
                videoId={video.videoId}
                title={video.title}
                duration={video.isLive ? undefined : video.duration}
                isLive={video.isLive}
                onClick={() => openVideo(video)}
              />
              
              {/* Social Share Button */}
              <VideoShare
                videoTitle={video.title}
                videoUrl={`https://www.youtube.com/watch?v=${video.videoId}`}
              />
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors whitespace-normal">
                {video.title}
              </h3>
              
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium text-red-600">{video.source}</span>
                <div className="flex items-center space-x-3">
                  <span>{video.views} views</span>
                  <span>{video.timeAgo}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          videoId={selectedVideo.videoId}
          title={selectedVideo.title}
          isLive={selectedVideo.isLive}
          showModal={true}
          onClose={closeVideo}
          autoPlay={true}
        />
      )}
    </section>
  );
}