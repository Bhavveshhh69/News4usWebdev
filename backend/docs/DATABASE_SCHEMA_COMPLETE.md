# Database Schema Documentation

## Overview
This document provides comprehensive documentation for the PostgreSQL database schema used in the NEWS4US application.

## Tables

### 1. users
Stores user authentication and profile information.

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | SERIAL | NO | nextval('users_id_seq') | Primary key |
| email | VARCHAR(255) | NO | NULL | User email address (unique) |
| password | VARCHAR(255) | NO | NULL | Hashed user password |
| name | VARCHAR(255) | NO | NULL | User full name |
| role | VARCHAR(50) | NO | 'user' | User role (user, admin, etc.) |
| created_at | TIMESTAMP WITH TIME ZONE | YES | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | YES | CURRENT_TIMESTAMP | Record last update timestamp |
| last_login | TIMESTAMP WITH TIME ZONE | YES | NULL | User last login timestamp |
| is_active | BOOLEAN | YES | true | User account status |

**Indexes:**
- users_pkey (PRIMARY KEY): CREATE UNIQUE INDEX users_pkey ON users USING btree (id)
- users_email_key (UNIQUE): CREATE UNIQUE INDEX users_email_key ON users USING btree (email)
- idx_users_email: CREATE INDEX idx_users_email ON users USING btree (email)
- idx_users_role: CREATE INDEX idx_users_role ON users USING btree (role)
- idx_users_created_at: CREATE INDEX idx_users_created_at ON users USING btree (created_at)
- idx_users_is_active: CREATE INDEX idx_users_is_active ON users USING btree (is_active)
- idx_users_role_active: CREATE INDEX idx_users_role_active ON users USING btree (role, is_active)
- idx_users_name: CREATE INDEX idx_users_name ON users USING btree (name)

**Constraints:**
- users_email_key: UNIQUE (email)

### 2. categories
Stores article categories.

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | SERIAL | NO | nextval('categories_id_seq') | Primary key |
| name | VARCHAR(100) | NO | NULL | Category name (unique) |
| description | TEXT | YES | NULL | Category description |
| created_at | TIMESTAMP WITH TIME ZONE | YES | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | YES | CURRENT_TIMESTAMP | Record last update timestamp |

**Indexes:**
- categories_pkey (PRIMARY KEY): CREATE UNIQUE INDEX categories_pkey ON categories USING btree (id)
- categories_name_key (UNIQUE): CREATE UNIQUE INDEX categories_name_key ON categories USING btree (name)

**Constraints:**
- categories_name_key: UNIQUE (name)

### 3. tags
Stores article tags.

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | SERIAL | NO | nextval('tags_id_seq') | Primary key |
| name | VARCHAR(50) | NO | NULL | Tag name (unique) |
| created_at | TIMESTAMP WITH TIME ZONE | YES | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | YES | CURRENT_TIMESTAMP | Record last update timestamp |

**Indexes:**
- tags_pkey (PRIMARY KEY): CREATE UNIQUE INDEX tags_pkey ON tags USING btree (id)
- tags_name_key (UNIQUE): CREATE UNIQUE INDEX tags_name_key ON tags USING btree (name)

**Constraints:**
- tags_name_key: UNIQUE (name)

### 4. articles
Stores news articles and their metadata.

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | SERIAL | NO | nextval('articles_id_seq') | Primary key |
| title | VARCHAR(255) | NO | NULL | Article title |
| summary | TEXT | YES | NULL | Article summary |
| content | TEXT | YES | NULL | Article content |
| author_id | INTEGER | YES | NULL | Foreign key to users.id |
| category_id | INTEGER | YES | NULL | Foreign key to categories.id |
| status | VARCHAR(20) | YES | 'draft' | Article status (draft, published, deleted) |
| published_at | TIMESTAMP WITH TIME ZONE | YES | NULL | Article publication timestamp |
| created_at | TIMESTAMP WITH TIME ZONE | YES | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | YES | CURRENT_TIMESTAMP | Record last update timestamp |
| views | INTEGER | YES | 0 | Article view count |
| is_featured | BOOLEAN | YES | false | Whether article is featured |
| comment_count | INTEGER | YES | 0 | Number of comments on article |
| searchable | TSVECTOR | YES | NULL | Full-text search vector |
| slug | VARCHAR(255) | YES | NULL | URL-friendly article identifier |

**Indexes:**
- articles_pkey (PRIMARY KEY): CREATE UNIQUE INDEX articles_pkey ON articles USING btree (id)
- idx_articles_author: CREATE INDEX idx_articles_author ON articles USING btree (author_id)
- idx_articles_category: CREATE INDEX idx_articles_category ON articles USING btree (category_id)
- idx_articles_status: CREATE INDEX idx_articles_status ON articles USING btree (status)
- idx_articles_published: CREATE INDEX idx_articles_published ON articles USING btree (published_at) WHERE status = 'published'
- idx_articles_featured: CREATE INDEX idx_articles_featured ON articles USING btree (is_featured)
- idx_articles_searchable: CREATE INDEX idx_articles_searchable ON articles USING gin (searchable)
- idx_articles_author_status_covering: CREATE INDEX idx_articles_author_status_covering ON articles USING btree (author_id, status) INCLUDE (id, title, published_at, views)
- idx_articles_slug: CREATE INDEX idx_articles_slug ON articles USING btree (slug)

**Foreign Key Constraints:**
- articles_author_id_fkey: FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
- articles_category_id_fkey: FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL

### 5. article_tags
Junction table for article-tag relationships.

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| article_id | INTEGER | NO | NULL | Foreign key to articles.id |
| tag_id | INTEGER | NO | NULL | Foreign key to tags.id |

**Indexes:**
- article_tags_pkey (PRIMARY KEY): CREATE UNIQUE INDEX article_tags_pkey ON article_tags USING btree (article_id, tag_id)
- article_tags_article_id_idx: CREATE INDEX article_tags_article_id_idx ON article_tags USING btree (article_id)
- article_tags_tag_id_idx: CREATE INDEX article_tags_tag_id_idx ON article_tags USING btree (tag_id)

**Foreign Key Constraints:**
- article_tags_article_id_fkey: FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
- article_tags_tag_id_fkey: FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE

### 6. media_assets
Stores uploaded media files.

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | SERIAL | NO | nextval('media_assets_id_seq') | Primary key |
| filename | VARCHAR(255) | NO | NULL | File name |
| original_name | VARCHAR(255) | NO | NULL | Original file name |
| mime_type | VARCHAR(100) | NO | NULL | MIME type |
| size | INTEGER | NO | NULL | File size in bytes |
| path | VARCHAR(500) | NO | NULL | File path |
| url | VARCHAR(500) | YES | NULL | File URL |
| alt_text | TEXT | YES | NULL | Alternative text |
| caption | TEXT | YES | NULL | File caption |
| uploaded_by | INTEGER | YES | NULL | Foreign key to users.id |
| created_at | TIMESTAMP WITH TIME ZONE | YES | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | YES | CURRENT_TIMESTAMP | Record last update timestamp |

**Indexes:**
- media_assets_pkey (PRIMARY KEY): CREATE UNIQUE INDEX media_assets_pkey ON media_assets USING btree (id)
- idx_media_filename: CREATE INDEX idx_media_filename ON media_assets USING btree (filename)
- idx_media_uploaded_by: CREATE INDEX idx_media_uploaded_by ON media_assets USING btree (uploaded_by)

**Foreign Key Constraints:**
- media_assets_uploaded_by_fkey: FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL

### 7. sessions
Stores user session information.

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | SERIAL | NO | nextval('sessions_id_seq') | Primary key |
| session_id | VARCHAR(128) | NO | NULL | Session identifier (unique) |
| user_id | INTEGER | YES | NULL | Foreign key to users.id |
| data | TEXT | YES | NULL | Session data |
| expires_at | TIMESTAMP WITH TIME ZONE | NO | NULL | Session expiration timestamp |
| created_at | TIMESTAMP WITH TIME ZONE | YES | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | YES | CURRENT_TIMESTAMP | Record last update timestamp |

**Indexes:**
- sessions_pkey (PRIMARY KEY): CREATE UNIQUE INDEX sessions_pkey ON sessions USING btree (id)
- sessions_session_id_key (UNIQUE): CREATE UNIQUE INDEX sessions_session_id_key ON sessions USING btree (session_id)
- idx_sessions_session_id: CREATE INDEX idx_sessions_session_id ON sessions USING btree (session_id)
- idx_sessions_user_id: CREATE INDEX idx_sessions_user_id ON sessions USING btree (user_id)
- idx_sessions_expires_at: CREATE INDEX idx_sessions_expires_at ON sessions USING btree (expires_at)

**Constraints:**
- sessions_session_id_key: UNIQUE (session_id)

**Foreign Key Constraints:**
- sessions_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

### 8. comments
Stores article comments with nested replies.

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | SERIAL | NO | nextval('comments_id_seq') | Primary key |
| content | TEXT | NO | NULL | Comment content |
| author_id | INTEGER | YES | NULL | Foreign key to users.id |
| article_id | INTEGER | YES | NULL | Foreign key to articles.id |
| parent_id | INTEGER | YES | NULL | Foreign key to comments.id (for replies) |
| is_deleted | BOOLEAN | YES | false | Comment deletion status |
| created_at | TIMESTAMP WITH TIME ZONE | YES | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | YES | CURRENT_TIMESTAMP | Record last update timestamp |

**Indexes:**
- comments_pkey (PRIMARY KEY): CREATE UNIQUE INDEX comments_pkey ON comments USING btree (id)
- idx_comments_article: CREATE INDEX idx_comments_article ON comments USING btree (article_id)
- idx_comments_author: CREATE INDEX idx_comments_author ON comments USING btree (author_id)
- idx_comments_parent: CREATE INDEX idx_comments_parent ON comments USING btree (parent_id)
- idx_comments_created_at: CREATE INDEX idx_comments_created_at ON comments USING btree (created_at)

**Foreign Key Constraints:**
- comments_author_id_fkey: FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
- comments_article_id_fkey: FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
- comments_parent_id_fkey: FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE

### 9. user_profiles
Stores extended user profile information.

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | SERIAL | NO | nextval('user_profiles_id_seq') | Primary key |
| user_id | INTEGER | YES | NULL | Foreign key to users.id |
| bio | TEXT | YES | NULL | User biography |
| website | VARCHAR(200) | YES | NULL | User website |
| location | VARCHAR(100) | YES | NULL | User location |
| avatar_url | VARCHAR(500) | YES | NULL | User avatar URL |
| social_links | JSONB | YES | NULL | User social media links |
| created_at | TIMESTAMP WITH TIME ZONE | YES | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | YES | CURRENT_TIMESTAMP | Record last update timestamp |

**Indexes:**
- user_profiles_pkey (PRIMARY KEY): CREATE UNIQUE INDEX user_profiles_pkey ON user_profiles USING btree (id)
- user_profiles_user_id_key (UNIQUE): CREATE UNIQUE INDEX user_profiles_user_id_key ON user_profiles USING btree (user_id)
- idx_user_profiles_user_id: CREATE INDEX idx_user_profiles_user_id ON user_profiles USING btree (user_id)
- idx_user_profiles_social_links: CREATE INDEX idx_user_profiles_social_links ON user_profiles USING gin (social_links)

**Constraints:**
- user_profiles_user_id_key: UNIQUE (user_id)

**Foreign Key Constraints:**
- user_profiles_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

### 10. user_preferences
Stores user-specific preferences.

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | SERIAL | NO | nextval('user_preferences_id_seq') | Primary key |
| user_id | INTEGER | YES | NULL | Foreign key to users.id |
| preferences | JSONB | YES | NULL | User preferences data |
| created_at | TIMESTAMP WITH TIME ZONE | YES | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | YES | CURRENT_TIMESTAMP | Record last update timestamp |

**Indexes:**
- user_preferences_pkey (PRIMARY KEY): CREATE UNIQUE INDEX user_preferences_pkey ON user_preferences USING btree (id)
- user_preferences_user_id_key (UNIQUE): CREATE UNIQUE INDEX user_preferences_user_id_key ON user_preferences USING btree (user_id)
- idx_user_preferences_user_id: CREATE INDEX idx_user_preferences_user_id ON user_preferences USING btree (user_id)
- idx_user_preferences_data: CREATE INDEX idx_user_preferences_data ON user_preferences USING gin (preferences)

**Constraints:**
- user_preferences_user_id_key: UNIQUE (user_id)

**Foreign Key Constraints:**
- user_preferences_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

### 11. user_favorites
Stores user bookmarked articles.

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | SERIAL | NO | nextval('user_favorites_id_seq') | Primary key |
| user_id | INTEGER | YES | NULL | Foreign key to users.id |
| article_id | INTEGER | YES | NULL | Foreign key to articles.id |
| created_at | TIMESTAMP WITH TIME ZONE | YES | CURRENT_TIMESTAMP | Record creation timestamp |

**Indexes:**
- user_favorites_pkey (PRIMARY KEY): CREATE UNIQUE INDEX user_favorites_pkey ON user_favorites USING btree (id)
- user_favorites_user_id_article_id_key (UNIQUE): CREATE UNIQUE INDEX user_favorites_user_id_article_id_key ON user_favorites USING btree (user_id, article_id)
- idx_user_favorites_user_id: CREATE INDEX idx_user_favorites_user_id ON user_favorites USING btree (user_id)
- idx_user_favorites_article_id: CREATE INDEX idx_user_favorites_article_id ON user_favorites USING btree (article_id)

**Constraints:**
- user_favorites_user_id_article_id_key: UNIQUE (user_id, article_id)

**Foreign Key Constraints:**
- user_favorites_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
- user_favorites_article_id_fkey: FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE

### 12. article_views
Stores article view tracking.

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | SERIAL | NO | nextval('article_views_id_seq') | Primary key |
| article_id | INTEGER | YES | NULL | Foreign key to articles.id |
| user_id | INTEGER | YES | NULL | Foreign key to users.id |
| created_at | TIMESTAMP WITH TIME ZONE | YES | CURRENT_TIMESTAMP | Record creation timestamp |

**Indexes:**
- article_views_pkey (PRIMARY KEY): CREATE UNIQUE INDEX article_views_pkey ON article_views USING btree (id)
- idx_article_views_article_id: CREATE INDEX idx_article_views_article_id ON article_views USING btree (article_id)
- idx_article_views_user_id: CREATE INDEX idx_article_views_user_id ON article_views USING btree (user_id)
- idx_article_views_created_at: CREATE INDEX idx_article_views_created_at ON article_views USING btree (created_at)

**Foreign Key Constraints:**
- article_views_article_id_fkey: FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
- article_views_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

### 13. notifications
Stores user notifications.

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | SERIAL | NO | nextval('notifications_id_seq') | Primary key |
| user_id | INTEGER | YES | NULL | Foreign key to users.id |
| type | VARCHAR(50) | NO | NULL | Notification type |
| title | VARCHAR(200) | NO | NULL | Notification title |
| message | TEXT | NO | NULL | Notification message |
| related_id | INTEGER | YES | NULL | Related record ID |
| related_type | VARCHAR(50) | YES | NULL | Related record type |
| is_read | BOOLEAN | YES | false | Notification read status |
| created_at | TIMESTAMP WITH TIME ZONE | YES | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | YES | CURRENT_TIMESTAMP | Record last update timestamp |

**Indexes:**
- notifications_pkey (PRIMARY KEY): CREATE UNIQUE INDEX notifications_pkey ON notifications USING btree (id)
- idx_notifications_user_id: CREATE INDEX idx_notifications_user_id ON notifications USING btree (user_id)
- idx_notifications_type: CREATE INDEX idx_notifications_type ON notifications USING btree (type)
- idx_notifications_is_read: CREATE INDEX idx_notifications_is_read ON notifications USING btree (is_read)
- idx_notifications_created_at: CREATE INDEX idx_notifications_created_at ON notifications USING btree (created_at)

**Foreign Key Constraints:**
- notifications_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

### 14. audit_log
Stores audit trail for data changes.

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | SERIAL | NO | nextval('audit_log_id_seq') | Primary key |
| table_name | VARCHAR(50) | NO | NULL | Name of table where operation occurred |
| operation | VARCHAR(10) | NO | NULL | Type of operation (INSERT, UPDATE, DELETE) |
| row_id | INTEGER | YES | NULL | ID of affected row |
| old_values | JSONB | YES | NULL | Previous values (for UPDATE/DELETE) |
| new_values | JSONB | YES | NULL | New values (for INSERT/UPDATE) |
| user_id | INTEGER | YES | NULL | ID of user performing operation |
| timestamp | TIMESTAMP WITH TIME ZONE | YES | CURRENT_TIMESTAMP | When operation occurred |
| transaction_id | BIGINT | YES | NULL | Database transaction ID |

**Indexes:**
- audit_log_pkey (PRIMARY KEY): CREATE UNIQUE INDEX audit_log_pkey ON audit_log USING btree (id)
- idx_audit_log_table_name: CREATE INDEX idx_audit_log_table_name ON audit_log USING btree (table_name)
- idx_audit_log_operation: CREATE INDEX idx_audit_log_operation ON audit_log USING btree (operation)
- idx_audit_log_user_id: CREATE INDEX idx_audit_log_user_id ON audit_log USING btree (user_id)
- idx_audit_log_timestamp: CREATE INDEX idx_audit_log_timestamp ON audit_log USING btree (timestamp)
- idx_audit_log_transaction_id: CREATE INDEX idx_audit_log_transaction_id ON audit_log USING btree (transaction_id)

## Materialized Views

### 1. article_analytics
Pre-computed analytics for published articles.

**Columns:**
| Column | Type | Description |
|--------|------|-------------|
| article_id | INTEGER | Article ID |
| title | VARCHAR(255) | Article title |
| published_at | TIMESTAMP WITH TIME ZONE | Publication timestamp |
| view_count | INTEGER | Number of views |
| comment_count | INTEGER | Number of comments |
| favorite_count | INTEGER | Number of favorites |
| category_name | VARCHAR(100) | Category name |

**Indexes:**
- idx_article_analytics_article_id: CREATE INDEX idx_article_analytics_article_id ON article_analytics USING btree (article_id)
- idx_article_analytics_published_at: CREATE INDEX idx_article_analytics_published_at ON article_analytics USING btree (published_at DESC)
- idx_article_analytics_view_count: CREATE INDEX idx_article_analytics_view_count ON article_analytics USING btree (view_count DESC)

### 2. user_engagement
Pre-computed user engagement metrics.

**Columns:**
| Column | Type | Description |
|--------|------|-------------|
| user_id | INTEGER | User ID |
| name | VARCHAR(255) | User name |
| email | VARCHAR(255) | User email |
| article_count | INTEGER | Number of articles published |
| comment_count | INTEGER | Number of comments made |
| favorite_count | INTEGER | Number of articles favorited |
| view_count | INTEGER | Number of articles viewed |
| engagement_score | INTEGER | Calculated engagement score |

**Indexes:**
- idx_user_engagement_user_id: CREATE INDEX idx_user_engagement_user_id ON user_engagement USING btree (user_id)
- idx_user_engagement_engagement_score: CREATE INDEX idx_user_engagement_engagement_score ON user_engagement USING btree (engagement_score DESC)

## Functions

### 1. update_article_searchable()
Updates the searchable tsvector column for full-text search.

**Definition:**
```sql
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
```

### 2. update_updated_at_column()
Updates the updated_at timestamp column.

**Definition:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### 3. refresh_article_analytics()
Refreshes the article_analytics materialized view.

**Definition:**
```sql
CREATE OR REPLACE FUNCTION refresh_article_analytics()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW article_analytics;
  RAISE NOTICE 'Article analytics materialized view refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql;
```

### 4. refresh_user_engagement()
Refreshes the user_engagement materialized view.

**Definition:**
```sql
CREATE OR REPLACE FUNCTION refresh_user_engagement()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW user_engagement;
  RAISE NOTICE 'User engagement materialized view refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql;
```

## Triggers

### 1. update_article_searchable_trigger
Updates the searchable column on articles table.

**Table:** articles
**Event:** BEFORE INSERT OR UPDATE
**Function:** update_article_searchable()

### 2. update_notifications_updated_at
Updates the updated_at column on notifications table.

**Table:** notifications
**Event:** BEFORE UPDATE
**Function:** update_updated_at_column()

### 3. articles_audit_trigger
Logs audit trail for articles table.

**Table:** articles
**Event:** AFTER INSERT OR UPDATE DELETE
**Function:** audit_trigger_func()

### 4. users_audit_trigger
Logs audit trail for users table.

**Table:** users
**Event:** AFTER INSERT OR UPDATE DELETE
**Function:** audit_trigger_func()

### 5. user_profiles_audit_trigger
Logs audit trail for user_profiles table.

**Table:** user_profiles
**Event:** AFTER INSERT OR UPDATE DELETE
**Function:** audit_trigger_func()

### 6. user_preferences_audit_trigger
Logs audit trail for user_preferences table.

**Table:** user_preferences
**Event:** AFTER INSERT OR UPDATE DELETE
**Function:** audit_trigger_func()

### 7. comments_audit_trigger
Logs audit trail for comments table.

**Table:** comments
**Event:** AFTER INSERT OR UPDATE DELETE
**Function:** audit_trigger_func()

### 8. media_assets_audit_trigger
Logs audit trail for media_assets table.

**Table:** media_assets
**Event:** AFTER INSERT OR UPDATE DELETE
**Function:** audit_trigger_func()

### 9. categories_audit_trigger
Logs audit trail for categories table.

**Table:** categories
**Event:** AFTER INSERT OR UPDATE DELETE
**Function:** audit_trigger_func()

## Roles

### 1. app_user
Application user with read/write access to application tables.

**Privileges:**
- SELECT, INSERT, UPDATE, DELETE on all application tables
- USAGE, SELECT on all sequences

### 2. read_only_user
Read-only user for analytics and reporting.

**Privileges:**
- SELECT on all tables

### 3. admin_user
Administrative user for schema changes and maintenance.

**Privileges:**
- ALL PRIVILEGES on all database objects

### 4. audit_user
Specialized user for audit logging operations.

**Privileges:**
- INSERT on audit_log table

## Security Features

### 1. Role-Based Access Control
- Four distinct database roles with appropriate privileges
- Default privileges set for future objects
- Principle of least privilege enforced

### 2. Audit Logging
- Comprehensive audit trail for all data changes
- Automatic logging through database triggers
- User context captured through session variables

### 3. SSL Encryption
- SSL support configured for secure connections
- Certificate-based authentication available

### 4. Password Security
- Strong password policies recommended
- Regular password rotation encouraged

## Performance Features

### 1. Connection Pooling
- Configurable connection pool sizing
- Keep-alive settings for persistent connections
- Timeout configurations for efficient resource usage

### 2. Advanced Indexing
- GIN indexes for JSONB and full-text search
- Partial indexes for common query filters
- Covering indexes for frequently accessed columns
- Expression indexes for computed values

### 3. Materialized Views
- Pre-computed analytics for improved query performance
- Concurrent refresh capabilities
- Indexes on materialized views for optimal access

### 4. Query Retry Logic
- Exponential backoff retry mechanism
- Circuit breaker pattern for failure prevention
- Configurable retry attempts and delays

## Conclusion

This comprehensive database schema documentation provides a detailed overview of all tables, indexes, constraints, functions, triggers, roles, and security features implemented in the NEWS4US PostgreSQL database. The schema is designed for optimal performance, security, and maintainability.