// Tag repository with ACID compliance
import { executeQuery } from '../config/db-utils.js';

// Create a new tag
const createTag = async (tagData) => {
  try {
    const { name } = tagData;
    
    const query = `
      INSERT INTO tags (name)
      VALUES ($1)
      RETURNING id, name, created_at, updated_at
    `;
    
    const values = [name];
    const result = await executeQuery(query, values);
    
    return result.rows[0];
  } catch (err) {
    // Handle duplicate name error
    if (err.code === '23505') {
      throw new Error('Tag with this name already exists');
    }
    throw err;
  }
};

// Get tag by ID
const getTagById = async (id) => {
  try {
    const query = 'SELECT id, name, created_at, updated_at FROM tags WHERE id = $1';
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

// Get tag by name
const getTagByName = async (name) => {
  try {
    const query = 'SELECT id, name, created_at, updated_at FROM tags WHERE name = $1';
    const values = [name];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Get all tags
const getAllTags = async (limit = 100, offset = 0) => {
  try {
    const query = `
      SELECT id, name, created_at, updated_at 
      FROM tags 
      ORDER BY name 
      LIMIT $1 OFFSET $2
    `;
    
    const values = [limit, offset];
    const result = await executeQuery(query, values);
    
    // Get article counts for each tag
    const tags = result.rows;
    for (const tag of tags) {
      const countQuery = `
        SELECT COUNT(*) as article_count 
        FROM article_tags at 
        JOIN articles a ON at.article_id = a.id 
        WHERE at.tag_id = $1 AND a.status = $2
      `;
      const countResult = await executeQuery(countQuery, [tag.id, 'published']);
      tag.article_count = parseInt(countResult.rows[0].article_count, 10);
    }
    
    return tags;
  } catch (err) {
    throw err;
  }
};

// Update a tag
const updateTag = async (tagId, updateData) => {
  try {
    const fields = [];
    const values = [];
    let index = 1;
    
    // Build dynamic query based on provided fields
    for (const [key, value] of Object.entries(updateData)) {
      if (key !== 'id' && key !== 'created_at') { // Don't allow ID or created_at updates
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }
    }
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    values.push(tagId); // Add tagId for WHERE clause
    const query = `
      UPDATE tags 
      SET ${fields.join(', ')}, updated_at = NOW() 
      WHERE id = $${index}
      RETURNING id, name, updated_at
    `;
    
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Tag not found');
    }
    
    return result.rows[0];
  } catch (err) {
    // Handle duplicate name error
    if (err.code === '23505') {
      throw new Error('Tag with this name already exists');
    }
    throw err;
  }
};

// Delete a tag
const deleteTag = async (tagId) => {
  try {
    // Check if tag has associated articles
    const checkQuery = 'SELECT COUNT(*) as article_count FROM article_tags WHERE tag_id = $1';
    const checkResult = await executeQuery(checkQuery, [tagId]);
    const articleCount = parseInt(checkResult.rows[0].article_count, 10);
    
    if (articleCount > 0) {
      throw new Error('Cannot delete tag with associated articles');
    }
    
    // Delete the tag
    const query = 'DELETE FROM tags WHERE id = $1 RETURNING id, name';
    const values = [tagId];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Tag not found');
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Get articles by tag
const getArticlesByTag = async (tagId, limit = 10, offset = 0) => {
  try {
    const query = `
      SELECT 
        a.id, a.title, a.summary, a.content, a.author_id, a.category_id, 
        a.status, a.published_at, a.created_at, a.updated_at, a.views, a.is_featured,
        u.name as author_name, u.email as author_email,
        c.name as category_name
      FROM articles a
      JOIN article_tags at ON a.id = at.article_id
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE at.tag_id = $1 AND a.status = 'published'
      ORDER BY a.published_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const values = [tagId, limit, offset];
    const result = await executeQuery(query, values);
    
    // Get tags for each article
    const articles = result.rows;
    for (const article of articles) {
      const tagsQuery = `
        SELECT t.id, t.name
        FROM tags t
        JOIN article_tags at ON t.id = at.tag_id
        WHERE at.article_id = $1
      `;
      
      const tagsResult = await executeQuery(tagsQuery, [article.id]);
      article.tags = tagsResult.rows;
    }
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM articles a
      JOIN article_tags at ON a.id = at.article_id
      WHERE at.tag_id = $1 AND a.status = 'published'
    `;
    
    const countResult = await executeQuery(countQuery, [tagId]);
    const total = parseInt(countResult.rows[0].total, 10);
    
    return {
      articles,
      total,
      limit,
      offset
    };
  } catch (err) {
    throw err;
  }
};

export {
  createTag,
  getTagById,
  getTagByName,
  getAllTags,
  updateTag,
  deleteTag,
  getArticlesByTag
};