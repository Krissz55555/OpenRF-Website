PRAGMA foreign_keys = ON;

ALTER TABLE posts ADD COLUMN is_pinned INTEGER NOT NULL DEFAULT 0 CHECK (is_pinned IN (0,1));
ALTER TABLE posts ADD COLUMN is_locked INTEGER NOT NULL DEFAULT 0 CHECK (is_locked IN (0,1));

CREATE INDEX IF NOT EXISTS idx_posts_moderation_order
ON posts(is_hidden, is_pinned DESC, featured DESC, created_at DESC);
