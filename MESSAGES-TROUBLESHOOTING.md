# Direct Messages - Troubleshooting Guide

## 🔍 Common Issues & Solutions

### Issue 1: Messages Link Shows "Coming Soon"

**Symptom:** Sidebar still shows "Messages" with "Soon" badge

**Solution:**
```bash
# The LeftSidebar.tsx was updated
# If you still see "Soon", clear browser cache:
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# Or restart dev server:
npm run dev
```

---

### Issue 2: "Table does not exist" Error

**Symptom:** Console shows `relation "conversations" does not exist`

**Solution:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy entire `messages-migration.sql`
3. Paste and click "Run"
4. Verify tables created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages', 'conversation_participants', 'typing_indicators');
```
Should return 4 rows.

---

### Issue 3: Messages Not Appearing in Real-time

**Symptom:** Have to refresh page to see new messages

**Solution:**
1. Enable Realtime Replication:
   - Supabase Dashboard → Database → Replication
   - Find `messages` table → Toggle ON
   - Find `typing_indicators` table → Toggle ON
   - Find `conversations` table → Toggle ON
   - Find `conversation_participants` table → Toggle ON

2. Check Realtime is enabled for your project:
   - Supabase Dashboard → Settings → API
   - Verify "Realtime" is enabled

3. Check browser console for WebSocket errors

---

### Issue 4: "Not authenticated" Error

**Symptom:** All actions fail with authentication error

**Solution:**
1. Verify you're logged in:
   - Check if you can see your profile in sidebar
   - Try logging out and back in

2. Check environment variables:
```bash
# .env.local should have:
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

3. Restart dev server:
```bash
npm run dev
```

---

### Issue 5: Images Not Uploading

**Symptom:** Image upload fails or images don't display

**Solution:**
1. Create storage bucket:
   - Supabase Dashboard → Storage
   - Click "Create bucket"
   - Name: `messages`
   - Toggle "Public bucket" to ON
   - Click "Create bucket"

2. Verify storage policies exist:
```sql
-- Run in Supabase SQL Editor
SELECT policyname 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%messages%';
```

3. If policies missing, re-run storage section from `messages-migration.sql`

---

### Issue 6: Typing Indicator Stuck

**Symptom:** "typing..." never disappears

**Solution:**
1. Check `typing_indicators` table exists:
```sql
SELECT * FROM typing_indicators LIMIT 1;
```

2. Enable Realtime for `typing_indicators`:
   - Dashboard → Database → Replication
   - Toggle ON for `typing_indicators`

3. Clear stuck indicators:
```sql
UPDATE typing_indicators SET is_typing = false;
```

---

### Issue 7: Unread Count Not Updating

**Symptom:** Badge shows wrong number or doesn't update

**Solution:**
1. Check `conversation_participants` table:
```sql
SELECT * FROM conversation_participants WHERE user_id = 'your_user_id';
```

2. Manually reset read timestamp:
```sql
UPDATE conversation_participants 
SET last_read_at = NOW() 
WHERE conversation_id = 'conversation_id' 
AND user_id = 'your_user_id';
```

3. Refresh the page

---

### Issue 8: Can't Find Users in Search

**Symptom:** Search returns no results

**Solution:**
1. Verify other users exist:
```sql
SELECT id, username, name FROM profiles LIMIT 10;
```

2. Check search is case-insensitive:
   - Try typing lowercase
   - Try typing just first name

3. Verify you're not searching for yourself:
   - Search excludes current user

---

### Issue 9: Conversation Not Created

**Symptom:** Clicking user in search doesn't create conversation

**Solution:**
1. Check `get_or_create_conversation` function exists:
```sql
SELECT proname FROM pg_proc WHERE proname = 'get_or_create_conversation';
```

2. If missing, re-run function section from `messages-migration.sql`

3. Check browser console for errors

4. Test function manually:
```sql
SELECT get_or_create_conversation(
  'user1_id'::uuid,
  'user2_id'::uuid
);
```

---

### Issue 10: RLS Policy Blocking Access

**Symptom:** "Row level security policy violation" error

**Solution:**
1. Verify you're a participant:
```sql
SELECT * FROM conversation_participants 
WHERE conversation_id = 'conversation_id' 
AND user_id = 'your_user_id';
```

2. Check RLS policies exist:
```sql
SELECT policyname, tablename 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'messages', 'conversation_participants');
```

3. If policies missing, re-run RLS section from `messages-migration.sql`

---

### Issue 11: Date/Time Not Formatting

**Symptom:** Timestamps show as raw dates or error

**Solution:**
1. Install date-fns:
```bash
npm install date-fns
```

2. Restart dev server:
```bash
npm run dev
```

3. Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### Issue 12: Mobile Layout Broken

**Symptom:** Chat doesn't go full screen on mobile

**Solution:**
1. Check Tailwind classes in `MessagesClient.tsx`:
   - Conversation list should have: `hidden md:flex` when chat open
   - Chat window should have: `flex` when selected

2. Test responsive breakpoints:
   - Open DevTools
   - Toggle device toolbar
   - Resize to mobile width

3. Clear browser cache and refresh

---

### Issue 13: Messages Not Scrolling to Bottom

**Symptom:** New messages appear but don't auto-scroll

**Solution:**
1. Check `messagesEndRef` exists in `ChatWindow.tsx`

2. Verify `scrollToBottom()` is called in `useEffect`

3. Try manual scroll:
   - Scroll to bottom manually
   - Send a message
   - Should auto-scroll now

---

### Issue 14: Image Preview Not Showing

**Symptom:** Selected image doesn't show preview before sending

**Solution:**
1. Check file input accepts images:
```tsx
accept="image/*"
```

2. Verify FileReader is working:
   - Check browser console for errors
   - Try different image format (jpg, png)

3. Check image size:
   - Very large images may take time to preview
   - Try smaller image

---

### Issue 15: Owner Badge Not Showing

**Symptom:** Gold star (★) doesn't appear for owner

**Solution:**
1. Verify user is marked as owner:
```sql
SELECT id, email, is_owner FROM profiles WHERE email = 'clivvord@gmail.com';
```

2. Check badge rendering in components:
   - `ConversationList.tsx`
   - `ChatWindow.tsx`
   - `NewMessageModal.tsx`

3. Ensure `is_owner` field is selected in queries

---

## 🔧 Debug Checklist

Run through this checklist when troubleshooting:

```
□ Database tables exist (4 tables)
□ RLS policies exist (check pg_policies)
□ Storage bucket 'messages' exists and is public
□ Realtime replication enabled for all tables
□ User is authenticated (check auth.getUser())
□ Environment variables are correct
□ date-fns is installed
□ Dev server is running
□ Browser cache is cleared
□ No console errors
□ Supabase project is active
```

---

## 🐛 Debug SQL Queries

### Check All Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%conversation%' OR table_name LIKE '%message%';
```

### Check Your Conversations
```sql
SELECT c.id, c.created_at, 
       (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count
FROM conversations c
INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
WHERE cp.user_id = 'your_user_id';
```

### Check Messages in Conversation
```sql
SELECT m.*, p.name, p.username
FROM messages m
INNER JOIN profiles p ON m.sender_id = p.id
WHERE m.conversation_id = 'conversation_id'
ORDER BY m.created_at DESC
LIMIT 20;
```

### Check Unread Messages
```sql
SELECT COUNT(*) as unread_count
FROM messages m
INNER JOIN conversation_participants cp 
  ON m.conversation_id = cp.conversation_id
WHERE cp.user_id = 'your_user_id'
  AND m.sender_id != 'your_user_id'
  AND m.created_at > cp.last_read_at;
```

### Check RLS Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('conversations', 'messages', 'conversation_participants', 'typing_indicators')
ORDER BY tablename, policyname;
```

### Check Storage Policies
```sql
SELECT policyname, definition
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%messages%';
```

---

## 🔍 Browser Console Debug

### Enable Verbose Logging

Add to `ChatWindow.tsx`:
```tsx
useEffect(() => {
  console.log('Messages:', messages);
  console.log('Conversation ID:', conversationId);
  console.log('Other User:', otherUser);
}, [messages, conversationId, otherUser]);
```

Add to `MessagesClient.tsx`:
```tsx
useEffect(() => {
  console.log('Conversations:', conversations);
  console.log('Selected:', selectedConversationId);
}, [conversations, selectedConversationId]);
```

---

## 🚨 Emergency Reset

If nothing works, nuclear option:

### 1. Drop All Tables
```sql
DROP TABLE IF EXISTS typing_indicators CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP FUNCTION IF EXISTS get_or_create_conversation;
DROP FUNCTION IF EXISTS update_conversation_timestamp;
```

### 2. Delete Storage Bucket
- Supabase Dashboard → Storage
- Delete `messages` bucket

### 3. Re-run Migration
- Copy entire `messages-migration.sql`
- Run in SQL Editor

### 4. Recreate Storage Bucket
- Create `messages` bucket (Public)

### 5. Restart Everything
```bash
# Clear cache
rm -rf .next

# Reinstall
npm install

# Restart
npm run dev
```

---

## 📞 Still Having Issues?

1. **Check Supabase Status**
   - https://status.supabase.com

2. **Check Browser Console**
   - F12 → Console tab
   - Look for red errors

3. **Check Supabase Logs**
   - Dashboard → Logs → API Logs
   - Look for failed requests

4. **Check Network Tab**
   - F12 → Network tab
   - Look for failed requests
   - Check response bodies

5. **Test in Incognito**
   - Rules out cache/extension issues

6. **Try Different Browser**
   - Rules out browser-specific issues

---

## ✅ Verification Tests

After fixing issues, verify everything works:

```bash
# Test 1: Basic Navigation
□ Click "Messages" in sidebar
□ Page loads without errors

# Test 2: User Search
□ Click "New Message" button
□ Type username in search
□ User appears in results
□ Click user

# Test 3: Send Message
□ Type message
□ Click send
□ Message appears instantly

# Test 4: Real-time
□ Open in 2 browsers
□ Send from browser 1
□ Appears in browser 2

# Test 5: Typing Indicator
□ Type in browser 1
□ "typing..." shows in browser 2
□ Stops after 2 seconds

# Test 6: Images
□ Click image button
□ Select image
□ Preview shows
□ Send message
□ Image displays

# Test 7: Read Receipts
□ Send message
□ Open conversation
□ Unread count clears

# Test 8: Mobile
□ Resize to mobile
□ Conversation list full width
□ Select conversation
□ Chat full screen
□ Back button works
```

---

**If all else fails, start fresh with the Quick Start guide!**

See: [MESSAGES-QUICKSTART.md](./MESSAGES-QUICKSTART.md)
