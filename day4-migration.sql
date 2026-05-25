-- Day 4 Features: Hashtags, Mentions, Analytics
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. HASHTAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag TEXT NOT NULL UNIQUE,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hashtags are viewable by everyone"
  ON hashtags FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS hashtags_tag_idx ON hashtags(tag);
CREATE INDEX IF NOT EXISTS hashtags_post_count_idx ON hashtags(post_count DESC);

-- ============================================
-- 2. POST HASHTAGS (many-to-many)
-- ============================================
CREATE TABLE IF NOT EXISTS post_hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, hashtag_id)
);

ALTER TABLE post_hashtags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Post hashtags are viewable by everyone"
  ON post_hashtags FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS post_hashtags_post_id_idx ON post_hashtags(post_id);
CREATE INDEX IF NOT EXISTS post_hashtags_hashtag_id_idx ON post_hashtags(hashtag_id);

-- ============================================
-- 3. MENTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentioner_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, mentioned_user_id)
);

ALTER TABLE mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentions are viewable by everyone"
  ON mentions FOR SELECT USING (true);

CREATE POLICY "Users can create mentions"
  ON mentions FOR INSERT WITH CHECK (auth.uid() = mentioner_user_id);

CREATE INDEX IF NOT EXISTS mentions_post_id_idx ON mentions(post_id);
CREATE INDEX IF NOT EXISTS mentions_mentioned_user_id_idx ON mentions(mentioned_user_id);

-- ============================================
-- 4. MENTION NOTIFICATIONS
-- ============================================
CREATE OR REPLACE FUNCTION create_mention_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, actor_id, type, post_id)
  VALUES (NEW.mentioned_user_id, NEW.mentioner_user_id, 'mention', NEW.post_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update notifications constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN ('like', 'comment', 'follow', 'repost', 'quote', 'mention'));

DROP TRIGGER IF EXISTS on_mention_created ON mentions;
CREATE TRIGGER on_mention_created
  AFTER INSERT ON mentions
  FOR EACH ROW
  EXECUTE FUNCTION create_mention_notification();

-- ============================================
-- 5. FUNCTION TO INCREMENT HASHTAG COUNT
-- ============================================
CREATE OR REPLACE FUNCTION increment_hashtag_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE hashtags 
  SET post_count = post_count + 1 
  WHERE id = NEW.hashtag_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_hashtag_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE hashtags 
  SET post_count = post_count - 1 
  WHERE id = OLD.hashtag_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_post_hashtag_created ON post_hashtags;
CREATE TRIGGER on_post_hashtag_created
  AFTER INSERT ON post_hashtags
  FOR EACH ROW
  EXECUTE FUNCTION increment_hashtag_count();

DROP TRIGGER IF EXISTS on_post_hashtag_deleted ON post_hashtags;
CREATE TRIGGER on_post_hashtag_deleted
  AFTER DELETE ON post_hashtags
  FOR EACH ROW
  EXECUTE FUNCTION decrement_hashtag_count();

-- ============================================
-- 6. VERIFICATION
-- ============================================
SELECT 'Day 4 migration complete!' as status;

SELECT 'New tables:' as info, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('hashtags', 'post_hashtags', 'mentions')
ORDER BY table_name;
