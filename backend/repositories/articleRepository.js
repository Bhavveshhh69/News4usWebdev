// Article repository with ACID compliance
import { executeQuery, executeTransaction } from '../config/db-utils.js';

// Create a new article
const createArticle = async (articleData, authorId) => {
  const { title, summary, content, categoryId, tags = [], status = 'draft', isFeatured = false } = articleData;
  
  try {
    // Use a transaction to ensure ACID compliance
    const queries = [];
    
    // Insert the article
    const articleQuery = `
      INSERT INTO articles (title, summary, content, author_id, category_id, status, is_featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, title, summary, content, author_id, category_id, status, published_at, created_at, updated_at, views, is_featured
    `;
    
    const articleValues = [title, summary, content, authorId, categoryId, status, isFeatured];
    queries.push({ query: articleQuery, values: articleValues });
    
    // Execute the transaction
    const results = await executeTransaction(queries);
    const article = results[0].rows[0];
    
    // If tags are provided, associate them with the article
    if (tags && tags.length > 0) {
      await associateTagsWithArticle(article.id, tags);
    }
    
    return article;
  } catch (err) {
    throw err;
  }
};

// Associate tags with an article
const associateTagsWithArticle = async (articleId, tags) => {
  try {
    // First, get or create tags
    const tagIds = [];
    for (const tagName of tags) {
      // Check if tag exists
      let tagResult = await executeQuery('SELECT id FROM tags WHERE name = $1', [tagName]);
      
      let tagId;
      if (tagResult.rows.length > 0) {
        tagId = tagResult.rows[0].id;
      } else {
        // Create new tag
        const newTagResult = await executeQuery('INSERT INTO tags (name) VALUES ($1) RETURNING id', [tagName]);
        tagId = newTagResult.rows[0].id;
      }
      
      tagIds.push(tagId);
    }
    
    // Associate tags with article
    const associationQueries = [];
    for (const tagId of tagIds) {
      associationQueries.push({
        query: 'INSERT INTO article_tags (article_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        values: [articleId, tagId]
      });
    }
    
    if (associationQueries.length > 0) {
      await executeTransaction(associationQueries);
    }
    
    return tagIds;
  } catch (err) {
    throw err;
  }
};

// Get article by ID
const getArticleById = async (id) => {
  try {
    const query = `
      SELECT 
        a.id, a.title, a.summary, a.content, a.author_id, a.category_id, 
        a.status, a.published_at, a.created_at, a.updated_at, a.views, a.is_featured,
        u.name as author_name, u.email as author_email,
        c.name as category_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.id = $1 AND a.status != 'deleted'
    `;
    
    const values = [id];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    // Get associated tags
    const tagsQuery = `
      SELECT t.id, t.name
      FROM tags t
      JOIN article_tags at ON t.id = at.tag_id
      WHERE at.article_id = $1
    `;
    
    const tagsResult = await executeQuery(tagsQuery, [id]);
    const article = result.rows[0];
    article.tags = tagsResult.rows;
    
    return article;
  } catch (err) {
    throw err;
  }
};

// Get all articles with pagination
const getAllArticles = async (limit = 10, offset = 0, filters = {}) => {
  try {
    let query = `
      SELECT 
        a.id, a.title, a.summary, a.content, a.author_id, a.category_id, 
        a.status, a.published_at, a.created_at, a.updated_at, a.views, a.is_featured,
        u.name as author_name, u.email as author_email,
        c.name as category_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.status != 'deleted'
    `;
    
    const values = [];
    let valueIndex = 1;
    
    // Apply filters
    if (filters.categoryId) {
      query += ` AND a.category_id = $${valueIndex}`;
      values.push(filters.categoryId);
      valueIndex++;
    }
    
    if (filters.authorId) {
      query += ` AND a.author_id = $${valueIndex}`;
      values.push(filters.authorId);
      valueIndex++;
    }
    
    if (filters.status) {
      query += ` AND a.status = $${valueIndex}`;
      values.push(filters.status);
      valueIndex++;
    }
    
    if (filters.isFeatured !== undefined) {
      query += ` AND a.is_featured = $${valueIndex}`;
      values.push(filters.isFeatured);
      valueIndex++;
    }
    
    // Add ordering and pagination
    query += ` ORDER BY a.created_at DESC LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`;
    values.push(limit, offset);
    
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
    let countQuery = 'SELECT COUNT(*) as total FROM articles a WHERE a.status != \'deleted\'';
    const countValues = [];
    let countValueIndex = 1;
    
    if (filters.categoryId) {
      countQuery += ` AND a.category_id = $${countValueIndex}`;
      countValues.push(filters.categoryId);
      countValueIndex++;
    }
    
    if (filters.authorId) {
      countQuery += ` AND a.author_id = $${countValueIndex}`;
      countValues.push(filters.authorId);
      countValueIndex++;
    }
    
    if (filters.status) {
      countQuery += ` AND a.status = $${countValueIndex}`;
      countValues.push(filters.status);
      countValueIndex++;
    }
    
    if (filters.isFeatured !== undefined) {
      countQuery += ` AND a.is_featured = $${countValueIndex}`;
      countValues.push(filters.isFeatured);
      countValueIndex++;
    }
    
    const countResult = await executeQuery(countQuery, countValues);
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

// Update an article
const updateArticle = async (articleId, updateData, authorId) => {
  try {
    const fields = [];
    const values = [];
    let index = 1;
    
    // Map camelCase field names to snake_case column names
    const fieldMap = {
      'title': 'title',
      'summary': 'summary',
      'content': 'content',
      'categoryId': 'category_id',
      'status': 'status',
      'isFeatured': 'is_featured'
    };
    
    // Build dynamic query based on provided fields
    for (const [key, value] of Object.entries(updateData)) {
      // Skip fields that shouldn't be updated directly
      if (key !== 'id' && key !== 'author_id' && key !== 'created_at' && key !== 'authorId') {
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
    
    values.push(articleId, authorId); // Add articleId and authorId for WHERE clause
    const query = `
      UPDATE articles 
      SET ${fields.join(', ')}, updated_at = NOW() 
      WHERE id = $${index} AND author_id = $${index + 1}
      RETURNING id, title, summary, content, author_id, category_id, status, published_at, created_at, updated_at, views, is_featured
    `;
    
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Article not found or unauthorized');
    }
    
    const article = result.rows[0];
    
    // If tags are provided, update tag associations
    if (updateData.tags) {
      // First, remove all existing tag associations
      await executeQuery('DELETE FROM article_tags WHERE article_id = $1', [articleId]);
      
      // Then associate new tags
      if (updateData.tags.length > 0) {
        await associateTagsWithArticle(articleId, updateData.tags);
      }
    }
    
    // Get updated tags
    const tagsQuery = `
      SELECT t.id, t.name
      FROM tags t
      JOIN article_tags at ON t.id = at.tag_id
      WHERE at.article_id = $1
    `;
    
    const tagsResult = await executeQuery(tagsQuery, [articleId]);
    article.tags = tagsResult.rows;
    
    return article;
  } catch (err) {
    throw err;
  }
};

// Delete an article (soft delete)
const deleteArticle = async (articleId, authorId) => {
  try {
    const query = `
      UPDATE articles 
      SET status = 'deleted', updated_at = NOW() 
      WHERE id = $1 AND author_id = $2
      RETURNING id, title, status, updated_at
    `;
    
    const values = [articleId, authorId];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Article not found or unauthorized');
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Publish an article
const publishArticle = async (articleId, authorId) => {
  try {
    const query = `
      UPDATE articles 
      SET status = 'published', published_at = NOW(), updated_at = NOW() 
      WHERE id = $1 AND author_id = $2
      RETURNING id, title, status, published_at, updated_at
    `;
    
    const values = [articleId, authorId];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Article not found or unauthorized');
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Increment article view count
const incrementArticleViews = async (articleId) => {
  try {
    const query = `
      UPDATE articles 
      SET views = views + 1 
      WHERE id = $1
      RETURNING id, views
    `;
    
    const values = [articleId];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Article not found');
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Search articles by keyword
const searchArticles = async (keyword, limit = 10, offset = 0) => {
  try {
    const query = `
      SELECT 
        a.id, a.title, a.summary, a.content, a.author_id, a.category_id, 
        a.status, a.published_at, a.created_at, a.updated_at, a.views, a.is_featured,
        u.name as author_name, u.email as author_email,
        c.name as category_name,
        ts_rank(to_tsvector('english', a.title || ' ' || a.summary || ' ' || a.content), plainto_tsquery('english', $1)) as rank
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.status = 'published' 
      AND to_tsvector('english', a.title || ' ' || a.summary || ' ' || a.content) @@ plainto_tsquery('english', $1)
      ORDER BY rank DESC, a.published_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const values = [keyword, limit, offset];
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
      WHERE a.status = 'published' 
      AND to_tsvector('english', a.title || ' ' || a.summary || ' ' || a.content) @@ plainto_tsquery('english', $1)
    `;
    
    const countResult = await executeQuery(countQuery, [keyword]);
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
  createArticle,
  getArticleById,
  getAllArticles,
  updateArticle,
  deleteArticle,
  publishArticle,
  incrementArticleViews,
  searchArticles,
  associateTagsWithArticle
};