// YouTube controller for HTTP requests
import { createOrUpdateVideo, getVideos, getVideoById, modifyVideo, removeVideo } from '../services/youtubeService.js';

export const listYouTubeVideosHandler = async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const result = await getVideos(parseInt(limit) || 20, parseInt(offset) || 0);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to list YouTube videos' });
  }
};

export const createYouTubeVideoHandler = async (req, res) => {
  try {
    const payload = req.body;
    const video = await createOrUpdateVideo(payload);
    res.status(201).json({ success: true, video });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to create YouTube video' });
  }
};

export const getYouTubeVideoHandler = async (req, res) => {
  try {
    const video = await getVideoById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, video });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to get YouTube video' });
  }
};

export const updateYouTubeVideoHandler = async (req, res) => {
  try {
    const video = await modifyVideo(req.params.id, req.body);
    if (!video) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, video });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to update YouTube video' });
  }
};

export const deleteYouTubeVideoHandler = async (req, res) => {
  try {
    const id = await removeVideo(req.params.id);
    if (!id) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, id });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to delete YouTube video' });
  }
};


