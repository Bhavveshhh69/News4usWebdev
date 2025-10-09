import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useContent, YouTubeVideo } from '../../store/contentStore';
import { Switch } from '../ui/switch';
import { extractYouTubeId } from '../../utils/youtube';
import { Play, Star, StarOff } from 'lucide-react'; // Add these imports

export function YouTubeVideosEditor() {
  const { youtubeVideos, miniPlayerEnabled, setMiniPlayerEnabled, addYouTubeVideo, updateYouTubeVideo, deleteYouTubeVideo, setMiniPlayerVideo, clearMiniPlayerVideo } = useContent();
  const [editingVideo, setEditingVideo] = useState(null as YouTubeVideo | null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateVideo = () => {
    setEditingVideo({
      id: '',
      title: '',
      videoUrl: '',
    });
    setIsCreating(true);
  };

  const handleSaveVideo = () => {
    if (!editingVideo) return;

    if (isCreating) {
      const newVideo = {
        ...editingVideo,
        id: Date.now().toString(),
      };
      addYouTubeVideo(newVideo);
    } else {
      updateYouTubeVideo(editingVideo);
    }

    setEditingVideo(null);
    setIsCreating(false);
  };

  const handleDeleteVideo = (id: string) => {
    deleteYouTubeVideo(id);
  };

  // Add function to set mini player video
  const handleSetMiniPlayer = (id: string) => {
    setMiniPlayerVideo(id);
  };

  // Add function to clear mini player video
  const handleClearMiniPlayer = () => {
    clearMiniPlayerVideo();
  };

  // Find the current mini player video
  const miniPlayerVideo = youtubeVideos.find(video => video.isMiniPlayer);

  // Use shared extractor utility

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">YouTube Videos</h2>
        <Button onClick={handleCreateVideo}>Add New Video</Button>
      </div>

      {/* Mini Player Status */}
      <Card>
        <CardHeader>
          <CardTitle>Mini Player Settings</CardTitle>
          <CardDescription>Enable the floating player and choose which video appears</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">Enable Floating Mini Player</p>
              <p className="text-sm text-gray-500">Globally show or hide the floating video player</p>
            </div>
            <Switch checked={miniPlayerEnabled} onCheckedChange={setMiniPlayerEnabled} />
          </div>

          {miniPlayerVideo ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Play className="text-red-600" />
                <div>
                  <p className="font-medium">{miniPlayerVideo.title}</p>
                  <p className="text-sm text-gray-500">Currently set as mini player video</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleClearMiniPlayer}>
                <StarOff className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No video is currently set for the mini player</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage YouTube Videos</CardTitle>
          <CardDescription>Add and manage your YouTube videos to be displayed in the Video News section</CardDescription>
        </CardHeader>
        <CardContent>
          {editingVideo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="videoTitle">Video Title</Label>
                  <Input
                    id="videoTitle"
                    value={editingVideo.title}
                    onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                    placeholder="Enter video title"
                  />
                </div>
                <div>
                  <Label htmlFor="videoUrl">YouTube URL</Label>
                  <Input
                    id="videoUrl"
                    value={editingVideo.videoUrl}
                    onChange={(e) => setEditingVideo({ ...editingVideo, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              </div>
              {editingVideo.videoUrl && (
                <div className="mt-4">
                  <Label>Preview</Label>
                  <div className="mt-2">
                    <iframe
                      width="100%"
                      height="315"
                      src={`https://www.youtube.com/embed/${extractYouTubeId(editingVideo.videoUrl)}`}
                      title="YouTube video preview"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
              <div className="flex space-x-2">
                <Button onClick={handleSaveVideo}>Save Video</Button>
                <Button variant="outline" onClick={() => setEditingVideo(null)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {youtubeVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {youtubeVideos.map((video) => (
                    <div key={video.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{video.title}</h3>
                      <div className="mt-2 aspect-video">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${extractYouTubeId(video.videoUrl)}?playsinline=1&enablejsapi=1&origin=${window.location.origin}&widget_referrer=${window.location.origin}&modestbranding=1`}
                          title={video.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        {!video.isMiniPlayer ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetMiniPlayer(video.id)}
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Set Mini Player
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={handleClearMiniPlayer}
                          >
                            <StarOff className="w-4 h-4 mr-2" />
                            Clear Mini Player
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingVideo(video);
                            setIsCreating(false);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteVideo(video.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No YouTube videos added yet.</p>
                  <Button onClick={handleCreateVideo} className="mt-4">Add Your First Video</Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}