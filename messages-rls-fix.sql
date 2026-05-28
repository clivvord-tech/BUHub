-- Fix RLS recursion for messages/conversation_participants
-- Creates helper functions (SECURITY DEFINER) to check conversation membership
-- and updates policies to use them to avoid self-referential subqueries.

-- Helper: check if a user is a participant in a conversation
CREATE OR REPLACE FUNCTION is_conversation_participant(conv_id UUID, uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = conv_id AND user_id = uid
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Helper: check if a conversation currently has any participants
CREATE OR REPLACE FUNCTION conversation_has_participants(conv_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = conv_id
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Replace policies that referenced conversation_participants using self-joins
-- Drop & recreate conversation policies
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (
    is_conversation_participant(conversations.id, auth.uid()::uuid)
  );

DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (
    is_conversation_participant(conversations.id, auth.uid()::uuid)
  );

-- Conversation participants policies
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;
CREATE POLICY "Users can view participants of their conversations"
  ON conversation_participants FOR SELECT
  USING (
    is_conversation_participant(conversation_participants.conversation_id, auth.uid()::uuid)
  );

DROP POLICY IF EXISTS "Users can add participants to their conversations" ON conversation_participants;
CREATE POLICY "Users can add participants to their conversations"
  ON conversation_participants FOR INSERT
  WITH CHECK (
    is_conversation_participant(conversation_participants.conversation_id, auth.uid()::uuid)
    OR NOT conversation_has_participants(conversation_participants.conversation_id)
  );

DROP POLICY IF EXISTS "Users can update their own participant record" ON conversation_participants;
CREATE POLICY "Users can update their own participant record"
  ON conversation_participants FOR UPDATE
  USING (user_id = auth.uid());

-- Messages policies (select/insert) using helper
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    is_conversation_participant(messages.conversation_id, auth.uid()::uuid)
  );

DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;
CREATE POLICY "Users can send messages to their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()::uuid
    AND is_conversation_participant(messages.conversation_id, auth.uid()::uuid)
  );

-- Typing indicators
DROP POLICY IF EXISTS "Users can view typing indicators in their conversations" ON typing_indicators;
CREATE POLICY "Users can view typing indicators in their conversations"
  ON typing_indicators FOR SELECT
  USING (
    is_conversation_participant(typing_indicators.conversation_id, auth.uid()::uuid)
  );

-- Storage objects policy that referenced conversation_participants - update to use helper
DROP POLICY IF EXISTS "Message images are accessible to conversation participants" ON storage.objects;
CREATE POLICY "Message images are accessible to conversation participants"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'messages'
    AND EXISTS (
      SELECT 1 FROM messages m
      WHERE m.image_path = storage.objects.name
      AND is_conversation_participant(m.conversation_id, auth.uid()::uuid)
    )
  );

-- Note: After applying this migration, ensure the function owner has sufficient privileges
-- (the migration should be run by a privileged role such as the DB owner or Supabase service role)
