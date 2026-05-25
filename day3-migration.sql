-- Day 3 Features: View Counts, Quote Tweets, Settings
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. ADD VIEW COUNT TO POSTS
-- ============================================
ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS posts_view_count_idx ON posts(view_count DESC);

-- ============================================
-- 2. POST VIEWS TABLE (track who viewed what)
-- ============================================
CREATE TABLE IF NOT EXISTS post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view post views"
  ON post_views FOR SELECT USING (true);

CREATE POLICY "Anyone can create post views"
  ON post_views FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS post_views_post_id_idx ON post_views(post_id);
CREATE INDEX IF NOT EXISTS post_views_user_id_idx ON post_views(user_id);

-- ============================================
-- 3. QUOTE TWEETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quote_tweets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  original_tweet_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  quote_tweet_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, original_tweet_id, quote_tweet_id)
);

ALTER TABLE quote_tweets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quote tweets are viewable by everyone"
  ON quote_tweets FOR SELECT USING (true);

CREATE POLICY "Users can create quote tweets"
  ON quote_tweets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quote tweets"
  ON quote_tweets FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS quote_tweets_original_id_idx ON quote_tweets(original_tweet_id);
CREATE INDEX IF NOT EXISTS quote_tweets_quote_id_idx ON quote_tweets(quote_tweet_id);

-- ============================================
-- 4. USER SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  likes_public BOOLEAN DEFAULT true,
  allow_dms_from TEXT DEFAULT 'everyone' CHECK (allow_dms_from IN ('everyone', 'following', 'none')),
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5. FUNCTION TO INCREMENT VIEW COUNT
-- ============================================
CREATE OR REPLACE FUNCTION increment_post_view(p_post_id UUID, p_user_id UUID DEFAULT NULL, p_ip TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
  -- Insert view record (will fail silently if duplicate)
  INSERT INTO post_views (post_id, user_id, ip_address)
  VALUES (p_post_id, p_user_id, p_ip)
  ON CONFLICT (post_id, user_id) DO NOTHING;
  
  -- Increment view count
  UPDATE posts 
  SET view_count = view_count + 1 
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. NOTIFICATION FOR QUOTE TWEETS
-- ============================================
CREATE OR REPLACE FUNCTION create_quote_tweet_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
BEGIN
  SELECT user_id INTO post_owner_id FROM posts WHERE id = NEW.original_tweet_id;
  
  IF post_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, actor_id, type, post_id)
    VALUES (post_owner_id, NEW.user_id, 'quote', NEW.quote_tweet_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update notifications constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN ('like', 'comment', 'follow', 'repost', 'quote'));

DROP TRIGGER IF EXISTS on_quote_tweet_created ON quote_tweets;
CREATE TRIGGER on_quote_tweet_created
  AFTER INSERT ON quote_tweets
  FOR EACH ROW
  EXECUTE FUNCTION create_quote_tweet_notification();

-- ============================================
-- 7. VERIFICATION
-- ============================================
SELECT 'Day 3 migration complete!' as status;

SELECT 'New tables:' as info, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('post_views', 'quote_tweets', 'user_settings')
ORDER BY table_name;

SELECT 'New columns:' as info, column_name 
FROM information_schema.columns 
WHERE table_name = 'posts' AND column_name = 'view_count';
