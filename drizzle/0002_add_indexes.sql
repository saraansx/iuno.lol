-- Add missing indexes for performance
-- Run against your MySQL database: mysql -u admin1 -p iunolol < drizzle/0002_add_indexes.sql

-- 1. profile_views: speed up the daily cleanup cron (DELETE WHERE view_date < ...)
CREATE INDEX IF NOT EXISTS view_date_idx ON profile_views (view_date);

-- 2. profile_comments: speed up dashboard "given" comments query (WHERE author_id = ?)
CREATE INDEX IF NOT EXISTS author_id_idx ON profile_comments (author_id);

-- 3. profile_comments: speed up threaded reply deletion (WHERE reply_to_id = ?)
CREATE INDEX IF NOT EXISTS reply_to_id_idx ON profile_comments (reply_to_id);

-- 4. profile_comments: speed up the main comment feed sort (WHERE profile_id = ? ORDER BY is_pinned, created_at)
CREATE INDEX IF NOT EXISTS profile_date_idx ON profile_comments (profile_id, created_at);

-- 5. users: speed up the lazy cleanup of expired unverified accounts during registration
CREATE INDEX IF NOT EXISTS unverified_cleanup_idx ON users (email_verified, created_at);
