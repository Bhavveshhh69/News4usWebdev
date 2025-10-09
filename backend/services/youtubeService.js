// YouTube service orchestrating repository and validation
import { upsertVideo, listVideos, getVideo, updateVideo, deleteVideo } from '../repositories/youtubeRepository.js';

export const createOrUpdateVideo = async (payload) => {
  if (!payload || !payload.videoId || !payload.title || !payload.url) {
    throw new Error('videoId, title, and url are required');
  }
  return await upsertVideo(payload);
};

export const getVideos = async (limit = 20, offset = 0) => {
  return await listVideos({ limit, offset });
};

export const getVideoById = async (id) => {
  return await getVideo(id);
};

export const modifyVideo = async (id, data) => {
  return await updateVideo(id, data || {});
};

export const removeVideo = async (id) => {
  return await deleteVideo(id);
};


