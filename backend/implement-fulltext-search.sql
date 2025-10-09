-- Implement full-text search for articles

-- Add searchable column to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS searchable tsvector;

-- Update searchable column with weighted terms
UPDATE articles 
SET searchable = 
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(content, '')), 'C');

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_articles_searchable ON articles USING GIN (searchable);

-- Create trigger to update searchable column on insert/update
CREATE OR REPLACE FUNCTION update_article_searchable()
RETURNS TRIGGER AS $$
BEGIN
  NEW.searchable := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.summary, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_article_searchable_trigger ON articles;
CREATE TRIGGER update_article_searchable_trigger
BEFORE INSERT OR UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION update_article_searchable();

-- Add comment to function
COMMENT ON FUNCTION update_article_searchable IS 'Update searchable tsvector column for full-text search';

-- Partial index for active users
CREATE INDEX IF NOT EXISTS idx_users_active_email ON users (email) WHERE is_active = true;

-- Partial index for published articles
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles (published_at DESC) WHERE status = 'published';

-- Covering index for common article queries
CREATE INDEX IF NOT EXISTS idx_articles_author_status_covering 
ON articles (author_id, status) 
INCLUDE (id, title, published_at, views);

-- Covering index for user authentication
CREATE INDEX IF NOT EXISTS idx_users_auth_covering 
ON users (email, password) 
INCLUDE (id, name, role, is_active);

-- Expression index for article slugs (if needed)
ALTER TABLE articles ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
UPDATE articles SET slug = LOWER(REPLACE(REPLACE(title, ' ', '-'), '''', '')) WHERE slug IS NULL;
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles (slug);

-- Add indexes on JSONB columns
CREATE INDEX IF NOT EXISTS idx_user_profiles_social_links ON user_profiles USING GIN (social_links);
CREATE INDEX IF NOT EXISTS idx_user_preferences_data ON user_preferences USING GIN (preferences);

-- Specialized indexes for common JSON paths
CREATE INDEX IF NOT EXISTS idx_user_profiles_twitter ON user_profiles 
USING GIN ((social_links -> 'twitter'));

CREATE INDEX IF NOT EXISTS idx_user_profiles_linkedin ON user_profiles 
USING GIN ((social_links -> 'linkedin'));

CREATE INDEX IF NOT EXISTS idx_user_preferences_theme ON user_preferences 
USING GIN ((preferences -> 'theme'));

CREATE INDEX IF NOT EXISTS idx_user_preferences_notifications ON user_preferences 
USING GIN ((preferences -> 'notifications'));

-- Display indexes on articles table
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'articles' 
ORDER BY indexname;

-- Display indexes on users table
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'users' 
ORDER BY indexname;