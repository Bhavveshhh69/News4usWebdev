// YouTube repository with ACID compliance
import { executeQuery, executeTransaction } from '../config/db-utils.js';

export const upsertChannel = async ({ externalId, name, url }) => {
  const query = `
    INSERT INTO youtube_channels (external_id, name, url)
    VALUES ($1, $2, $3)
    ON CONFLICT (external_id) DO UPDATE SET
      name = EXCLUDED.name,
      url = EXCLUDED.url,
      updated_at = NOW()
    RETURNING *
  `;
  const result = await executeQuery(query, [externalId ?? null, name, url ?? null]);
  return result.rows[0];
};

export const upsertVideo = async ({ videoId, title, url, thumbnailUrl, publishedAt, channel }) => {
  let channelId = null;
  if (channel && (channel.externalId || channel.name)) {
    const ch = await upsertChannel(channel);
    channelId = ch?.id ?? null;
  }

  const query = `
    INSERT INTO youtube_videos (video_id, channel_id, title, url, thumbnail_url, published_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (video_id) DO UPDATE SET
      channel_id = COALESCE(EXCLUDED.channel_id, youtube_videos.channel_id),
      title = EXCLUDED.title,
      url = EXCLUDED.url,
      thumbnail_url = COALESCE(EXCLUDED.thumbnail_url, youtube_videos.thumbnail_url),
      published_at = COALESCE(EXCLUDED.published_at, youtube_videos.published_at),
      updated_at = NOW()
    RETURNING *
  `;
  const values = [videoId, channelId, title, url, thumbnailUrl ?? null, publishedAt ?? null];
  const result = await executeQuery(query, values);
  return result.rows[0];
};

export const listVideos = async ({ limit = 20, offset = 0 } = {}) => {
  const query = `
    SELECT v.*, c.name AS channel_name
    FROM youtube_videos v
    LEFT JOIN youtube_channels c ON v.channel_id = c.id
    ORDER BY COALESCE(v.published_at, v.created_at) DESC
    LIMIT $1 OFFSET $2
  `;
  const result = await executeQuery(query, [limit, offset], 'read');
  const count = await executeQuery('SELECT COUNT(*)::int AS total FROM youtube_videos', [], 'read');
  return { videos: result.rows, total: count.rows[0].total, limit, offset };
};

export const getVideo = async (id) => {
  const result = await executeQuery('SELECT * FROM youtube_videos WHERE id = $1', [id], 'read');
  return result.rows[0] ?? null;
};

export const updateVideo = async (id, { title, isMiniPlayer }) => {
  const result = await executeQuery(
    `UPDATE youtube_videos SET
       title = COALESCE($2, title),
       is_mini_player = COALESCE($3, is_mini_player),
       updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, title ?? null, typeof isMiniPlayer === 'boolean' ? isMiniPlayer : null]
  );
  return result.rows[0] ?? null;
};

export const deleteVideo = async (id) => {
  const result = await executeQuery('DELETE FROM youtube_videos WHERE id = $1 RETURNING id', [id]);
  return result.rows[0]?.id ?? null;
};