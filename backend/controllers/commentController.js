// Comment controller to handle HTTP requests
import {
  createNewComment,
  getComment,
  getArticleComments,
  updateExistingComment,
  deleteExistingComment,
  getCommentReplies
} from '../services/commentService.js';

import { authenticate } from '../middleware/authMiddleware.js';

// Create a new comment
const createCommentHandler = async (req, res) => {
  try {
    const { content, articleId, parentId } = req.body;
    const authorId = req.user.id; // Assuming user ID is attached to request by auth middleware
    
    const commentData = {
      content,
      articleId,
      parentId
    };
    
    const result = await createNewComment(commentData, authorId);
    
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to create comment'
    });
  }
};

// Get comment by ID
const getCommentHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await getComment(id);
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Comment not found') {
      res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    } else {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve comment'
      });
    }
  }
};

// Get all comments for an article with pagination
const getArticleCommentsHandler = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { limit, offset } = req.query;
    
    const result = await getArticleComments(
      articleId,
      parseInt(limit) || 10,
      parseInt(offset) || 0
    );
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Invalid article ID') {
      res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    } else {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve comments'
      });
    }
  }
};

// Update a comment
const updateCommentHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const authorId = req.user.id; // Assuming user ID is attached to request by auth middleware
    
    const result = await updateExistingComment(id, updateData, authorId);
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Comment not found') {
      res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    } else {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to update comment'
      });
    }
  }
};

// Delete a comment
const deleteCommentHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const authorId = req.user.id; // Assuming user ID is attached to request by auth middleware
    
    const result = await deleteExistingComment(id, authorId);
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Comment not found') {
      res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    } else {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to delete comment'
      });
    }
  }
};

// Get replies to a comment
const getRepliesHandler = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { limit, offset } = req.query;
    
    const result = await getCommentReplies(
      commentId,
      parseInt(limit) || 10,
      parseInt(offset) || 0
    );
    
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Invalid comment ID') {
      res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    } else {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve replies'
      });
    }
  }
};

export {
  createCommentHandler,
  getCommentHandler,
  getArticleCommentsHandler,
  updateCommentHandler,
  deleteCommentHandler,
  getRepliesHandler
};