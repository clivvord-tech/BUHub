# FIXING CURRENT ISSUES

## Issue 1: "Failed to load posts"
**Cause:** The `is_pinned` column doesn't exist in the database yet.

**Fix:**
1. Go to Supabase Dashboard → SQL Editor
2. Open `complete-day2-migration.sql` 
3. Copy and paste the entire file
4. Click "Run" (or Ctrl+Enter)
5. Wait for "Setup complete!" message

## Issue 2: Bookmarks not persisting
**Cause:** Same as above - the `bookmarks` table doesn't exist yet.

**Fix:** Run the same migration above. It creates:
- ✅ `follows` table
- ✅ `bookmarks` table  
- ✅ `reposts` table
- ✅ `notifications` table (with repost type)
- ✅ `is_pinned` column on posts
- ✅ All RLS policies
- ✅ All notification triggers

## After Running Migration

Update `services/tweet.ts` to enable pinned posts ordering:

```typescript
// Change line 65-68 from:
.order("created_at", { ascending: false })

// To:
.order("is_pinned", { ascending: false })
.order("created_at", { ascending: false })
```

This will make pinned posts appear at the top of the feed.

## Test Everything

After migration:
1. ✅ Posts should load without errors
2. ✅ Bookmark a post → Leave page → Come back → Should still be bookmarked
3. ✅ Pin your own post → Should appear at top with "Pinned post" label
4. ✅ Repost someone's post → They get notification
5. ✅ Follow someone → They get notification
6. ✅ Check bookmarks page → Should show all bookmarked posts

## Quick Verification

Run this in Supabase SQL Editor to verify:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('follows', 'bookmarks', 'reposts', 'notifications');
```

Should return 4 rows.
