# Schema Optimization Plan

## Current Schema Analysis

Based on our Phase 1 assessment, the current schema includes:
- 13 tables with proper relationships
- Appropriate use of foreign key constraints
- Basic indexing strategy implemented
- Use of JSONB for flexible data structures (user_preferences, user_profiles)
- Timestamp fields for audit trails
- Proper data types for each column

## Proposed Schema Optimizations

### 1. Materialized Views for Complex Reporting

#### Current Issues:
- Complex reporting queries join multiple tables
- Analytics queries impact OLTP performance
- No caching for frequently accessed aggregated data

#### Proposed Solution:
Create materialized views for common reporting queries to improve performance.

#### Implementation Plan:
1. Identify frequently used complex queries
2. Create materialized views for these queries
3. Implement refresh strategies
4. Update application to use materialized views for reporting

#### Materialized Views to Create:

```sql
-- Materialized view for article analytics
CREATE MATERIALIZED VIEW article_analytics AS
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
CREATE INDEX idx_article_analytics_article_id ON article_analytics (article_id);
CREATE INDEX idx_article_analytics_published_at ON article_analytics (published_at DESC);
CREATE INDEX idx_article_analytics_view_count ON article_analytics (view_count DESC);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_article_analytics()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY article_analytics;
END;
$$ LANGUAGE plpgsql;
```

```sql
-- Materialized view for user engagement metrics
CREATE MATERIALIZED VIEW user_engagement AS
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
CREATE INDEX idx_user_engagement_user_id ON user_engagement (user_id);
CREATE INDEX idx_user_engagement_engagement_score ON user_engagement (engagement_score DESC);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_user_engagement()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_engagement;
END;
$$ LANGUAGE plpgsql;
```

### 2. Partitioning Strategy for Large Tables

#### Current Issues:
- article_views table will grow rapidly
- No partitioning for time-series data
- Query performance will degrade as table size increases

#### Proposed Solution:
Implement table partitioning for time-series data to improve query performance and maintenance.

#### Implementation Plan:
1. Create partitioned versions of large tables
2. Implement data migration strategy
3. Update application to use partitioned tables
4. Set up automated partition management

#### Partitioning Implementation:

```sql
-- Create partitioned table for article_views
CREATE TABLE article_views_partitioned (
  id BIGSERIAL,
  article_id INTEGER NOT NULL,
  user_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create initial partitions
CREATE TABLE article_views_2025_10 PARTITION OF article_views_partitioned
FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

CREATE TABLE article_views_2025_11 PARTITION OF article_views_partitioned
FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

CREATE TABLE article_views_2025_12 PARTITION OF article_views_partitioned
FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- Create indexes on partitioned table
CREATE INDEX idx_article_views_partitioned_article_id ON article_views_partitioned (article_id);
CREATE INDEX idx_article_views_partitioned_user_id ON article_views_partitioned (user_id);
CREATE INDEX idx_article_views_partitioned_created_at ON article_views_partitioned (created_at);

-- Migration procedure to move existing data
CREATE OR REPLACE FUNCTION migrate_article_views()
RETURNS VOID AS $$
BEGIN
  INSERT INTO article_views_partitioned (id, article_id, user_id, created_at)
  SELECT id, article_id, user_id, created_at
  FROM article_views;
  
  -- After verification, drop the old table
  -- DROP TABLE article_views;
END;
$$ LANGUAGE plpgsql;
```

### 3. Advanced Indexing Strategies

#### Current Issues:
- Basic indexing strategy
- No full-text search capabilities
- Limited use of specialized index types

#### Proposed Solution:
Implement advanced indexing strategies to improve query performance.

#### Implementation Plan:
1. Add full-text search indexes
2. Create partial indexes for common filters
3. Implement covering indexes for frequently accessed columns
4. Add expression indexes for computed values

#### Advanced Indexing Implementation:

```sql
-- Full-text search for articles
ALTER TABLE articles ADD COLUMN IF NOT EXISTS searchable tsvector;

-- Update searchable column with weighted terms
UPDATE articles 
SET searchable = 
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(content, '')), 'C');

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_articles_searchable ON articles USING GIN (searchable);

-- Trigger to update searchable column on insert/update
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

CREATE TRIGGER update_article_searchable_trigger
BEFORE INSERT OR UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION update_article_searchable();

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
```

### 4. JSONB Optimization

#### Current Issues:
- JSONB columns in user_profiles and user_preferences
- No indexing on JSONB data
- Limited querying capabilities

#### Proposed Solution:
Add indexes and optimize queries for JSONB data.

#### Implementation Plan:
1. Add GIN indexes on JSONB columns
2. Create specialized indexes for common JSON paths
3. Optimize queries that access JSONB data

#### JSONB Optimization Implementation:

```sql
-- GIN indexes on JSONB columns
CREATE INDEX IF NOT EXISTS idx_user_profiles_social_links ON user_profiles USING GIN (social_links);
CREATE INDEX IF NOT EXISTS idx_user_preferences_data ON user_preferences USING GIN (preferences);

-- Specialized indexes for common JSON paths
-- For user_profiles.social_links, create an index on specific platforms
CREATE INDEX IF NOT EXISTS idx_user_profiles_twitter ON user_profiles 
USING GIN ((social_links -> 'twitter'));

CREATE INDEX IF NOT EXISTS idx_user_profiles_linkedin ON user_profiles 
USING GIN ((social_links -> 'linkedin'));

-- For user_preferences, create indexes on common preference keys
CREATE INDEX IF NOT EXISTS idx_user_preferences_theme ON user_preferences 
USING GIN ((preferences -> 'theme'));

CREATE INDEX IF NOT EXISTS idx_user_preferences_notifications ON user_preferences 
USING GIN ((preferences -> 'notifications'));
```

## Implementation Timeline

### Week 1: Materialized Views
- Create article_analytics materialized view
- Create user_engagement materialized view
- Implement refresh functions
- Test materialized view performance

### Week 2: Partitioning Strategy
- Create partitioned tables
- Implement data migration procedures
- Test partitioned table performance
- Validate data integrity

### Week 3: Advanced Indexing
- Implement full-text search indexes
- Create partial indexes
- Add covering indexes
- Test query performance improvements

### Week 4: JSONB Optimization and Final Testing
- Add indexes on JSONB columns
- Optimize JSONB queries
- Comprehensive performance testing
- Document all optimizations

## Testing Plan

### Materialized View Testing:
- [ ] Materialized views return correct data
- [ ] Refresh functions work correctly
- [ ] Query performance is improved
- [ ] Concurrent refresh works without blocking

### Partitioning Testing:
- [ ] Data is correctly partitioned
- [ ] Queries use appropriate partitions
- [ ] Partition creation/deletion works
- [ ] Performance is improved for large datasets

### Indexing Testing:
- [ ] Full-text search returns relevant results
- [ ] Partial indexes are used for filtered queries
- [ ] Covering indexes eliminate table lookups
- [ ] Query execution plans show index usage

### JSONB Testing:
- [ ] JSONB indexes are used for queries
- [ ] Query performance is improved for JSON data
- [ ] Data integrity is maintained
- [ ] Complex JSON queries work correctly

## Monitoring and Alerting

### Performance Metrics to Monitor:
- Query execution time improvements
- Index usage statistics
- Materialized view refresh times
- Partition pruning effectiveness

### Alerting Thresholds:
- Query performance degradation > 10%
- Index scan ratio < 80%
- Materialized view refresh time > 5 minutes
- Partition pruning not occurring for partitioned tables

## Rollback Plan

If schema optimizations cause issues:
1. Drop materialized views
2. Revert to original table structures
3. Remove advanced indexes
4. Disable JSONB optimizations
5. Validate system functionality
6. Implement fixes and re-deploy

## Success Criteria

Schema optimizations will be considered successful when:
- Query performance is improved by at least 25%
- Materialized views reduce reporting query times by 50%
- Partitioning improves large table query performance by 40%
- Full-text search provides relevant results quickly
- JSONB queries are optimized
- All tests pass successfully
- System performance is improved overall