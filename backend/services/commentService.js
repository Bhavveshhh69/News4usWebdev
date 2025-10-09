// Comment service with ACID compliance
import { 
  createComment,
  getCommentById,
  getCommentsByArticle,
  updateComment,
  deleteComment,
  getReplies
} from '../repositories/commentRepository.js';

import { getArticleById } from '../repositories/articleRepository.js';
import { findUserById } from '../repositories/userRepository.js';

// Create a new comment
const createNewComment = async (commentData, authorId) => {
  try {
    // Validate required fields
    if (!commentData.content || !commentData.articleId) {
      throw new Error('Content and article ID are required');
    }
    
    // Validate content length
    if (commentData.content.trim().length === 0) {
      throw new Error('Comment content cannot be empty');
    }
    
    if (commentData.content.length > 1000) {
      throw new Error('Comment content must be less than 1000 characters');
    }
    
    // Validate user exists
    const user = await findUserById(authorId);
    if (!user) {
      throw new Error('Invalid user ID');
    }
    
    // Validate article exists
    const article = await getArticleById(commentData.articleId);
    if (!article) {
      throw new Error('Invalid article ID');
    }
    
    // Validate parent comment if provided
    if (commentData.parentId) {
      const parentComment = await getCommentById(commentData.parentId);
      if (!parentComment) {
        throw new Error('Invalid parent comment ID');
      }
      
      // Ensure parent comment belongs to the same article
      if (parentComment.article_id !== commentData.articleId) {
        throw new Error('Parent comment must belong to the same article');
      }
    }
    
    // Create the comment
    const comment = await createComment(commentData, authorId);
    
    return {
      success: true,
      comment,
      message: 'Comment created successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get comment by ID
const getComment = async (id) => {
  try {
    const comment = await getCommentById(id);
    
    if (!comment) {
      throw new Error('Comment not found');
    }
    
    return {
      success: true,
      comment,
      message: 'Comment retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get all comments for an article with pagination
const getArticleComments = async (articleId, limit = 10, offset = 0) => {
  try {
    // Validate limit and offset
    if (limit < 1 || limit > 100) {
      limit = 10;
    }
    
    if (offset < 0) {
      offset = 0;
    }
    
    // Validate article exists
    const article = await getArticleById(articleId);
    if (!article) {
      throw new Error('Invalid article ID');
    }
    
    const result = await getCommentsByArticle(articleId, limit, offset);
    
    return {
      success: true,
      ...result,
      message: 'Comments retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Update a comment
const updateExistingComment = async (commentId, updateData, authorId) => {
  try {
    // Validate user exists
    const user = await findUserById(authorId);
    if (!user) {
      throw new Error('Invalid user ID');
    }
    
    // Validate content if provided
    if (updateData.content) {
      if (updateData.content.trim().length === 0) {
        throw new Error('Comment content cannot be empty');
      }
      
      if (updateData.content.length > 1000) {
        throw new Error('Comment content must be less than 1000 characters');
      }
    }
    
    // Update the comment
    const comment = await updateComment(commentId, updateData, authorId);
    
    return {
      success: true,
      comment,
      message: 'Comment updated successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Delete a comment
const deleteExistingComment = async (commentId, authorId) => {
  try {
    const result = await deleteComment(commentId, authorId);
    
    return {
      success: true,
      result,
      message: 'Comment deleted successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get replies to a comment
const getCommentReplies = async (commentId, limit = 10, offset = 0) => {
  try {
    // Validate limit and offset
    if (limit < 1 || limit > 100) {
      limit = 10;
    }
    
    if (offset < 0) {
      offset = 0;
    }
    
    // Validate comment exists
    const comment = await getCommentById(commentId);
    if (!comment) {
      throw new Error('Invalid comment ID');
    }
    
    const result = await getReplies(commentId, limit, offset);
    
    return {
      success: true,
      ...result,
      message: 'Replies retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

export {
  createNewComment,
  getComment,
  getArticleComments,
  updateExistingComment,
  deleteExistingComment,
  getCommentReplies
};