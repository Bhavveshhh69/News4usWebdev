// Audit repository for storing audit events
import { appUserPool } from '../config/database.js';

// Log an audit event
const logAuditEvent = async (eventData) => {
  try {
    const query = `
      INSERT INTO app_audit_log (user_id, action, target_type, target_id, details, ip_address, user_agent, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id
    `;
    
    const values = [
      eventData.user_id || null,
      eventData.action,
      eventData.target_type || null,
      eventData.target_id || null,
      JSON.stringify(eventData.details || {}),
      eventData.ip_address || null,
      eventData.user_agent || null
    ];
    
    // Use the app user pool for audit logging (audit_user pool has permission issues)
    const client = await appUserPool.connect();
    try {
      const result = await client.query(query, values);
      return result.rows[0].id;
    } finally {
      client.release();
    }
  } catch (err) {
    throw err;
  }
};

// Get audit events with filtering
const getAuditEvents = async (limit = 50, offset = 0, filters = {}) => {
  try {
    let query = `
      SELECT id, user_id, action, target_type, target_id, details, ip_address, user_agent, created_at
      FROM app_audit_log
    `;
    
    const conditions = [];
    const values = [];
    let index = 1;
    
    if (filters.userId) {
      conditions.push(`user_id = $${index}`);
      values.push(filters.userId);
      index++;
    }
    
    if (filters.action) {
      conditions.push(`action = $${index}`);
      values.push(filters.action);
      index++;
    }
    
    if (filters.targetType) {
      conditions.push(`target_type = $${index}`);
      values.push(filters.targetType);
      index++;
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${index} OFFSET $${index + 1}`;
    values.push(limit, offset);
    
    // Use read-only pool for reading audit events
    const client = await readOnlyUserPool.connect();
    try {
      const result = await client.query(query, values);
      return result.rows;
    } finally {
      client.release();
    }
  } catch (err) {
    throw err;
  }
};

export {
  logAuditEvent,
  getAuditEvents
};