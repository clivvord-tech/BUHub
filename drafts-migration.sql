-- Post Drafts Feature
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  image_url TEXT,
  image_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own drafts"
  ON drafts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create drafts"
  ON drafts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drafts"
  ON drafts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drafts"
  ON drafts FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS drafts_user_id_idx ON drafts(user_id);
CREATE INDEX IF NOT EXISTS drafts_updated_at_idx ON drafts(updated_at DESC);

SELECT 'Drafts table created!' as status;
