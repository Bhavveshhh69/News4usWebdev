-- Create materialized views for performance optimization

-- Materialized view for article analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS article_analytics AS
SELECT 
  a.id as article_id,
  a.title,
  a.published_at,
  COALESCE(av.view_count, 0) as view_count,
  COALESCE(c.comment_count, 0) as comment_count,
  COALESCE(uf.favorite_count, 0) as favorite_count,
  COALESCE(cat.name, 'Uncategorized') as category_name
FROM articles a
LEFT JOIN (
  SELECT article_id, COUNT(*) as view_count
  FROM article_views
  GROUP BY article_id
) av ON a.id = av.article_id
LEFT JOIN (
  SELECT article_id, COUNT(*) as comment_count
  FROM comments
  WHERE is_deleted = false
  GROUP BY article_id
) c ON a.id = c.article_id
LEFT JOIN (
  SELECT article_id, COUNT(*) as favorite_count
  FROM user_favorites
  GROUP BY article_id
) uf ON a.id = uf.article_id
LEFT JOIN categories cat ON a.category_id = cat.id
WHERE a.status = 'published';

-- Create indexes on materialized view
CREATE INDEX IF NOT EXISTS idx_article_analytics_article_id ON article_analytics (article_id);
CREATE INDEX IF NOT EXISTS idx_article_analytics_published_at ON article_analytics (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_article_analytics_view_count ON article_analytics (view_count DESC);

-- Add comment to materialized view
COMMENT ON MATERIALIZED VIEW article_analytics IS 'Pre-computed analytics for published articles';

-- Materialized view for user engagement metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS user_engagement AS
SELECT 
  u.id as user_id,
  u.name,
  u.email,
  COALESCE(a.article_count, 0) as article_count,
  COALESCE(c.comment_count, 0) as comment_count,
  COALESCE(uf.favorite_count, 0) as favorite_count,
  COALESCE(av.view_count, 0) as view_count,
  (COALESCE(a.article_count, 0) * 10 + 
   COALESCE(c.comment_count, 0) * 5 + 
   COALESCE(uf.favorite_count, 0) * 2 + 
   COALESCE(av.view_count, 0) * 1) as engagement_score
FROM users u
LEFT JOIN (
  SELECT author_id, COUNT(*) as article_count
  FROM articles
  WHERE status = 'published'
  GROUP BY author_id
) a ON u.id = a.author_id
LEFT JOIN (
  SELECT author_id, COUNT(*) as comment_count
  FROM comments
  WHERE is_deleted = false
  GROUP BY author_id
) c ON u.id = c.author_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as favorite_count
  FROM user_favorites
  GROUP BY user_id
) uf ON u.id = uf.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as view_count
  FROM article_views
  GROUP BY user_id
) av ON u.id = av.user_id
WHERE u.is_active = true;

-- Create indexes on materialized view
CREATE INDEX IF NOT EXISTS idx_user_engagement_user_id ON user_engagement (user_id);
CREATE INDEX IF NOT EXISTS idx_user_engagement_engagement_score ON user_engagement (engagement_score DESC);

-- Add comment to materialized view
COMMENT ON MATERIALIZED VIEW user_engagement IS 'Pre-computed user engagement metrics';

-- Refresh functions for materialized views
CREATE OR REPLACE FUNCTION refresh_article_analytics()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW article_analytics;
  RAISE NOTICE 'Article analytics materialized view refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refresh_user_engagement()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW user_engagement;
  RAISE NOTICE 'User engagement materialized view refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Add comments to refresh functions
COMMENT ON FUNCTION refresh_article_analytics IS 'Refresh article_analytics materialized view';
COMMENT ON FUNCTION refresh_user_engagement IS 'Refresh user_engagement materialized view';

-- Display materialized views
-- SELECT matviewname, matviewowner, matviewdefinition 
-- FROM pg_matviews 
-- WHERE matviewname IN ('article_analytics', 'user_engagement');