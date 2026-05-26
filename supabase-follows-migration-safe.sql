-- ============================================
-- FOLLOWS TABLE - SAFE MIGRATION (handles existing table)
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Check if table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'follows') THEN
        -- Create table only if it doesn't exist
        CREATE TABLE follows (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        RAISE NOTICE 'Table "follows" created';
    ELSE
        RAISE NOTICE 'Table "follows" already exists';
    END IF;
END $$;

-- Step 2: Add constraints if they don't exist
DO $$ 
BEGIN
    -- Add unique constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'follows_follower_id_following_id_key'
    ) THEN
        ALTER TABLE follows ADD CONSTRAINT follows_follower_id_following_id_key 
        UNIQUE(follower_id, following_id);
        RAISE NOTICE 'Added UNIQUE constraint';
    ELSE
        RAISE NOTICE 'UNIQUE constraint already exists';
    END IF;

    -- Add check constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'follows_check'
    ) THEN
        ALTER TABLE follows ADD CONSTRAINT follows_check 
        CHECK (follower_id != following_id);
        RAISE NOTICE 'Added CHECK constraint';
    ELSE
        RAISE NOTICE 'CHECK constraint already exists';
    END IF;
END $$;

-- Step 3: Enable RLS (safe to run multiple times)
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies (if any) and recreate them
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON follows;
DROP POLICY IF EXISTS "Authenticated users can follow others" ON follows;
DROP POLICY IF EXISTS "Users can unfollow (delete their own follows)" ON follows;

-- Create policies
CREATE POLICY "Follows are viewable by everyone"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can follow others"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow (delete their own follows)"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Step 5: Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON follows(following_id);
CREATE INDEX IF NOT EXISTS follows_created_at_idx ON follows(created_at DESC);

-- Step 6: Verify everything
SELECT 
    'Table exists' as check_type,
    EXISTS(SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'follows') as result
UNION ALL
SELECT 
    'RLS enabled',
    (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'follows')
UNION ALL
SELECT 
    'Policies count',
    (SELECT COUNT(*)::boolean FROM pg_policies WHERE schemaname = 'public' AND tablename = 'follows')
UNION ALL
SELECT 
    'Indexes count',
    (SELECT COUNT(*)::boolean FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'follows');

-- Show all policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'follows';

-- Show all indexes
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' AND tablename = 'follows';

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ Migration complete! The follows table is ready.';
END $$;
