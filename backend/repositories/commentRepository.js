// Comment repository with ACID compliance
import { executeQuery, executeTransaction } from '../config/db-utils.js';

// Create a new comment
const createComment = async (commentData, authorId) => {
  try {
    const { 
      content, 
      articleId, 
      parentId = null 
    } = commentData;
    
    // Use a transaction to ensure ACID compliance
    const queries = [];
    
    // Insert the comment
    const commentQuery = `
      INSERT INTO comments (content, author_id, article_id, parent_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, content, author_id, article_id, parent_id, created_at, updated_at
    `;
    
    const commentValues = [content, authorId, articleId, parentId];
    queries.push({ query: commentQuery, values: commentValues });
    
    // Update article's comment count
    const updateArticleQuery = `
      UPDATE articles 
      SET comment_count = comment_count + 1, updated_at = NOW()
      WHERE id = $1
    `;
    
    const updateArticleValues = [articleId];
    queries.push({ query: updateArticleQuery, values: updateArticleValues });
    
    // Execute the transaction
    const results = await executeTransaction(queries);
    const comment = results[0].rows[0];
    
    return comment;
  } catch (err) {
    throw err;
  }
};

// Get comment by ID
const getCommentById = async (id) => {
  try {
    const query = `
      SELECT 
        c.id, c.content, c.author_id, c.article_id, c.parent_id, c.created_at, c.updated_at,
        u.name as author_name,
        u.email as author_email
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.id = $1 AND c.is_deleted = false
    `;
    
    const values = [id];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Get all comments for an article with pagination
const getCommentsByArticle = async (articleId, limit = 10, offset = 0) => {
  try {
    const query = `
      SELECT 
        c.id, c.content, c.author_id, c.article_id, c.parent_id, c.created_at, c.updated_at,
        u.name as author_name,
        u.email as author_email
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.article_id = $1 AND c.is_deleted = false
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const values = [articleId, limit, offset];
    const result = await executeQuery(query, values);
    
    // Get total count for pagination
    const countQuery = 'SELECT COUNT(*) as total FROM comments WHERE article_id = $1 AND is_deleted = false';
    const countResult = await executeQuery(countQuery, [articleId]);
    const total = parseInt(countResult.rows[0].total, 10);
    
    return {
      comments: result.rows,
      total,
      limit,
      offset
    };
  } catch (err) {
    throw err;
  }
};

// Update a comment
const updateComment = async (commentId, updateData, authorId) => {
  try {
    const fields = [];
    const values = [];
    let index = 1;
    
    // Map camelCase field names to snake_case column names
    const fieldMap = {
      'content': 'content'
    };
    
    // Build dynamic query based on provided fields
    for (const [key, value] of Object.entries(updateData)) {
      // Skip fields that shouldn't be updated directly
      if (key !== 'id' && key !== 'author_id' && key !== 'article_id' && key !== 'parent_id' && key !== 'created_at') {
        // Map the field name if it exists in the fieldMap
        const columnName = fieldMap[key] || key;
        fields.push(`${columnName} = $${index}`);
        values.push(value);
        index++;
      }
    }
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    values.push(commentId, authorId); // Add commentId and authorId for WHERE clause
    const query = `
      UPDATE comments 
      SET ${fields.join(', ')}, updated_at = NOW() 
      WHERE id = $${index} AND author_id = $${index + 1} AND is_deleted = false
      RETURNING id, content, author_id, article_id, parent_id, created_at, updated_at
    `;
    
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Comment not found or unauthorized');
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Delete a comment (soft delete)
const deleteComment = async (commentId, authorId) => {
  try {
    // First, get the comment to find the article_id
    const commentQuery = 'SELECT article_id FROM comments WHERE id = $1 AND author_id = $2 AND is_deleted = false';
    const commentResult = await executeQuery(commentQuery, [commentId, authorId]);
    
    if (commentResult.rows.length === 0) {
      throw new Error('Comment not found or unauthorized');
    }
    
    const articleId = commentResult.rows[0].article_id;
    
    // Use a transaction to ensure ACID compliance
    const queries = [];
    
    // Soft delete the comment
    const deleteQuery = `
      UPDATE comments 
      SET is_deleted = true, updated_at = NOW() 
      WHERE id = $1 AND author_id = $2
      RETURNING id, content, author_id, article_id, parent_id
    `;
    
    const deleteValues = [commentId, authorId];
    queries.push({ query: deleteQuery, values: deleteValues });
    
    // Update article's comment count
    const updateArticleQuery = `
      UPDATE articles 
      SET comment_count = comment_count - 1, updated_at = NOW()
      WHERE id = $1
    `;
    
    const updateArticleValues = [articleId];
    queries.push({ query: updateArticleQuery, values: updateArticleValues });
    
    // Execute the transaction
    const results = await executeTransaction(queries);
    const comment = results[0].rows[0];
    
    return comment;
  } catch (err) {
    throw err;
  }
};

// Get replies to a comment
const getReplies = async (commentId, limit = 10, offset = 0) => {
  try {
    const query = `
      SELECT 
        c.id, c.content, c.author_id, c.article_id, c.parent_id, c.created_at, c.updated_at,
        u.name as author_name,
        u.email as author_email
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.parent_id = $1 AND c.is_deleted = false
      ORDER BY c.created_at ASC
      LIMIT $2 OFFSET $3
    `;
    
    const values = [commentId, limit, offset];
    const result = await executeQuery(query, values);
    
    // Get total count for pagination
    const countQuery = 'SELECT COUNT(*) as total FROM comments WHERE parent_id = $1 AND is_deleted = false';
    const countResult = await executeQuery(countQuery, [commentId]);
    const total = parseInt(countResult.rows[0].total, 10);
    
    return {
      comments: result.rows,
      total,
      limit,
      offset
    };
  } catch (err) {
    throw err;
  }
};

export {
  createComment,
  getCommentById,
  getCommentsByArticle,
  updateComment,
  deleteComment,
  getReplies
};