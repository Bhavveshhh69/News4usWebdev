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
- idx_notifications_is_read: CREATE INDEX