-- SAFE DAY 2 MIGRATION - Only adds what's missing
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. ADD MISSING TABLES
-- ============================================

-- Bookmarks table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookmarks') THEN
    CREATE TABLE bookmarks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      tweet_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, tweet_id)
    );
    
    ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own bookmarks"
      ON bookmarks FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can create bookmarks"
      ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete their own bookmarks"
      ON bookmarks FOR DELETE USING (auth.uid() = user_id);
    
    CREATE INDEX bookmarks_user_id_idx ON bookmarks(user_id);
    CREATE INDEX bookmarks_tweet_id_idx ON bookmarks(tweet_id);
    
    RAISE NOTICE 'Bookmarks table created';
  ELSE
    RAISE NOTICE 'Bookmarks table already exists';
  END IF;
END $$;

-- Reposts table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reposts') THEN
    CREATE TABLE reposts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      tweet_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, tweet_id)
    );
    
    ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Reposts are viewable by everyone"
      ON reposts FOR SELECT USING (true);
    
    CREATE POLICY "Users can create reposts"
      ON reposts FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete their own reposts"
      ON reposts FOR DELETE USING (auth.uid() = user_id);
    
    CREATE INDEX reposts_user_id_idx ON reposts(user_id);
    CREATE INDEX reposts_tweet_id_idx ON reposts(tweet_id);
    
    RAISE NOTICE 'Reposts table created';
  ELSE
    RAISE NOTICE 'Reposts table already exists';
  END IF;
END $$;

-- ============================================
-- 2. ADD PINNED COLUMN TO POSTS
-- ============================================
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'posts_is_pinned_idx'
  ) THEN
    CREATE INDEX posts_is_pinned_idx ON posts(is_pinned, user_id);
    RAISE NOTICE 'Index posts_is_pinned_idx created';
  ELSE
    RAISE NOTICE 'Index posts_is_pinned_idx already exists';
  END IF;
END $$;

-- ============================================
-- 3. UPDATE NOTIFICATIONS TYPE CONSTRAINT
-- ============================================
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN ('like', 'comment', 'follow', 'repost'));

-- ============================================
-- 4. REPOST NOTIFICATION FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION create_repost_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
BEGIN
  SELECT user_id INTO post_owner_id FROM posts WHERE id = NEW.tweet_id;
  IF post_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, actor_id, type, post_id)
    VALUES (post_owner_id, NEW.user_id, 'repost', NEW.tweet_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. REPOST TRIGGER
-- ============================================
DROP TRIGGER IF EXISTS on_repost_created ON reposts;
CREATE TRIGGER on_repost_created
  AFTER INSERT ON reposts
  FOR EACH ROW
  EXECUTE FUNCTION create_repost_notification();

-- ============================================
-- 6. VERIFICATION
-- ============================================
SELECT 'Migration complete!' as status;

SELECT 'Tables:' as info, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('follows', 'bookmarks', 'reposts', 'notifications')
ORDER BY table_name;

SELECT 'is_pinned column:' as info, column_name 
FROM information_schema.columns 
WHERE table_name = 'posts' AND column_name = 'is_pinned';
