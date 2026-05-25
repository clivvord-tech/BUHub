-- Reposts and Pinned Posts Features
-- Run this in Supabase SQL Editor

-- ============================================
-- REPOSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reposts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tweet_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tweet_id)
);

-- Enable RLS
ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reposts
CREATE POLICY "Reposts are viewable by everyone"
  ON reposts FOR SELECT
  USING (true);

CREATE POLICY "Users can create reposts"
  ON reposts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reposts"
  ON reposts FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS reposts_user_id_idx ON reposts(user_id);
CREATE INDEX IF NOT EXISTS reposts_tweet_id_idx ON reposts(tweet_id);
CREATE INDEX IF NOT EXISTS reposts_created_at_idx ON reposts(created_at DESC);

-- ============================================
-- ADD PINNED COLUMN TO POSTS
-- ============================================
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

-- Index for pinned posts
CREATE INDEX IF NOT EXISTS posts_is_pinned_idx ON posts(is_pinned, user_id);

-- ============================================
-- NOTIFICATION FOR REPOSTS
-- ============================================
CREATE OR REPLACE FUNCTION create_repost_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
BEGIN
  -- Get the post owner
  SELECT user_id INTO post_owner_id FROM posts WHERE id = NEW.tweet_id;
  
  -- Don't notify if user reposts their own post
  IF post_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, actor_id, type, post_id)
    VALUES (post_owner_id, NEW.user_id, 'repost', NEW.tweet_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update notifications type check to include repost
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN ('like', 'comment', 'follow', 'repost'));

-- Trigger for repost notifications
CREATE TRIGGER on_repost_created
  AFTER INSERT ON reposts
  FOR EACH ROW
  EXECUTE FUNCTION create_repost_notification();

-- Verify
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'reposts';
