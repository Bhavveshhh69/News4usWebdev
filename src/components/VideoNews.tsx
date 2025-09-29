import React, { useState } from 'react';
import { VideoPlayer, VideoThumbnail } from './VideoPlayer';
import { VideoShare } from './SocialShare';
import { Play } from 'lucide-react';

export function VideoNews() {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const videoNews = [
    {
      id: 1,
      title: "Breaking: Global Climate Summit Reaches Historic Agreement",
      videoId: "dQw4w9WgXcQ", // Demo YouTube video ID
      duration: "12:34",
      views: "2.3M",
      source: "NEWS4US",
      timeAgo: "2 hours ago",
      isLive: false
    },
    {
      id: 2,
      title: "LIVE: Tech Market Analysis - AI Stocks Surge",
      videoId: "dQw4w9WgXcQ", // Demo YouTube video ID
      duration: "",
      views: "1.8M",
      source: "Market Watch",
      timeAgo: "streaming now",
      isLive: true
    },
    {
      id: 3,
      title: "Healthcare Breakthrough: New Cancer Treatment",
      videoId: "dQw4w9WgXcQ", // Demo YouTube video ID
      duration: "15:20",
      views: "987K",
      source: "Health Today",
      timeAgo: "6 hours ago",
      isLive: false
    },
    {
      id: 4,
      title: "Championship Final Highlights",
      videoId: "dQw4w9WgXcQ", // Demo YouTube video ID
      duration: "22:15",
      views: "5.2M",
      source: "Sports Central",
      timeAgo: "1 day ago",
      isLive: false
    },
    {
      id: 5,
      title: "Celebrity Award Show Behind The Scenes",
      videoId: "dQw4w9WgXcQ", // Demo YouTube video ID
      duration: "18:32",
      views: "3.7M",
      source: "Entertainment Weekly",
      timeAgo: "1 day ago",
      isLive: false
    },
    {
      id: 6,
      title: "Political Debate Analysis",
      videoId: "dQw4w9WgXcQ", // Demo YouTube video ID
      duration: "25:45",
      views: "1.2M",
      source: "Political Insider",
      timeAgo: "2 days ago",
      isLive: false
    }
  ];

  const openVideo = (video: any) => {
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
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
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