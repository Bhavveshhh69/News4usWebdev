// Media repository with ACID compliance
import { executeQuery, executeTransaction } from '../config/db-utils.js';

// Create a new media asset
const createMediaAsset = async (mediaData, uploadedBy) => {
  try {
    const { 
      filename, 
      originalName, 
      mimeType, 
      size, 
      path, 
      url, 
      altText, 
      caption 
    } = mediaData;
    
    const query = `
      INSERT INTO media_assets (
        filename, 
        original_name, 
        mime_type, 
        size, 
        path, 
        url, 
        alt_text, 
        caption, 
        uploaded_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, filename, original_name, mime_type, size, path, url, alt_text, caption, uploaded_by, created_at, updated_at
    `;
    
    const values = [filename, originalName, mimeType, size, path, url, altText, caption, uploadedBy];
    const result = await executeQuery(query, values);
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Get media asset by ID
const getMediaAssetById = async (id) => {
  try {
    const query = `
      SELECT 
        m.id, m.filename, m.original_name, m.mime_type, m.size, m.path, m.url, m.alt_text, m.caption, m.uploaded_by, m.created_at, m.updated_at,
        u.name as uploaded_by_name,
        u.email as uploaded_by_email
      FROM media_assets m
      LEFT JOIN users u ON m.uploaded_by = u.id
      WHERE m.id = $1
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

// Get all media assets with pagination
const getAllMediaAssets = async (limit = 10, offset = 0, filters = {}) => {
  try {
    let query = `
      SELECT 
        m.id, m.filename, m.original_name, m.mime_type, m.size, m.path, m.url, m.alt_text, m.caption, m.uploaded_by, m.created_at, m.updated_at,
        u.name as uploaded_by_name,
        u.email as uploaded_by_email
      FROM media_assets m
      LEFT JOIN users u ON m.uploaded_by = u.id
    `;
    
    const values = [];
    let whereClause = '';
    let valueIndex = 1;
    
    // Apply filters
    if (filters.uploadedBy) {
      whereClause += ` AND m.uploaded_by = $${valueIndex}`;
      values.push(filters.uploadedBy);
      valueIndex++;
    }
    
    if (filters.mimeType) {
      whereClause += ` AND m.mime_type = $${valueIndex}`;
      values.push(filters.mimeType);
      valueIndex++;
    }
    
    if (filters.filename) {
      whereClause += ` AND m.filename ILIKE $${valueIndex}`;
      values.push(`%${filters.filename}%`);
      valueIndex++;
    }
    
    if (whereClause) {
      query += ' WHERE ' + whereClause.substring(5); // Remove the first ' AND'
    }
    
    query += ' ORDER BY m.created_at DESC';
    query += ` LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`;
    values.push(limit, offset);
    
    const result = await executeQuery(query, values);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM media_assets m';
    if (whereClause) {
      countQuery += ' WHERE ' + whereClause.substring(5);
    }
    
    const countValues = values.slice(0, valueIndex - 1);
    const countResult = await executeQuery(countQuery, countValues);
    const total = parseInt(countResult.rows[0].total, 10);
    
    return {
      mediaAssets: result.rows,
      total,
      limit,
      offset
    };
  } catch (err) {
    throw err;
  }
};

// Update a media asset
const updateMediaAsset = async (mediaId, updateData, uploadedBy) => {
  try {
    const fields = [];
    const values = [];
    let index = 1;
    
    // Map camelCase field names to snake_case column names
    const fieldMap = {
      'filename': 'filename',
      'originalName': 'original_name',
      'mimeType': 'mime_type',
      'size': 'size',
      'path': 'path',
      'url': 'url',
      'altText': 'alt_text',
      'caption': 'caption'
    };
    
    // Build dynamic query based on provided fields
    for (const [key, value] of Object.entries(updateData)) {
      // Skip fields that shouldn't be updated directly
      if (key !== 'id' && key !== 'uploaded_by' && key !== 'created_at') {
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
    
    values.push(mediaId, uploadedBy); // Add mediaId and uploadedBy for WHERE clause
    const query = `
      UPDATE media_assets 
      SET ${fields.join(', ')}, updated_at = NOW() 
      WHERE id = $${index} AND uploaded_by = $${index + 1}
      RETURNING id, filename, original_name, mime_type, size, path, url, alt_text, caption, uploaded_by, created_at, updated_at
    `;
    
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Media asset not found or unauthorized');
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Delete a media asset
const deleteMediaAsset = async (mediaId, uploadedBy) => {
  try {
    const query = `
      DELETE FROM media_assets 
      WHERE id = $1 AND uploaded_by = $2
      RETURNING id, filename, original_name
    `;
    
    const values = [mediaId, uploadedBy];
    const result = await executeQuery(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Media asset not found or unauthorized');
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Get media assets by user
const getMediaAssetsByUser = async (userId, limit = 10, offset = 0) => {
  try {
    const query = `
      SELECT 
        m.id, m.filename, m.original_name, m.mime_type, m.size, m.path, m.url, m.alt_text, m.caption, m.uploaded_by, m.created_at, m.updated_at
      FROM media_assets m
      WHERE m.uploaded_by = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const values = [userId, limit, offset];
    const result = await executeQuery(query, values);
    
    // Get total count for pagination
    const countQuery = 'SELECT COUNT(*) as total FROM media_assets m WHERE m.uploaded_by = $1';
    const countResult = await executeQuery(countQuery, [userId]);
    const total = parseInt(countResult.rows[0].total, 10);
    
    return {
      mediaAssets: result.rows,
      total,
      limit,
      offset
    };
  } catch (err) {
    throw err;
  }
};

export {
  createMediaAsset,
  getMediaAssetById,
  getAllMediaAssets,
  updateMediaAsset,
  deleteMediaAsset,
  getMediaAssetsByUser
};