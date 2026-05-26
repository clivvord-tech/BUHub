# Follow System Fix - Quick Setup Guide

## 🚀 5-Minute Setup

### Step 1: Verify Current State (1 minute)

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Run the verification script:

```sql
-- Copy contents of supabase-follows-verify.sql
-- This will show you what's already set up
```

---

### Step 2: Run Safe Migration (2 minutes)

Since the table already exists, use the **SAFE** migration script:

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste from `supabase-follows-migration-safe.sql`
4. Click **Run**

This script will:
- ✅ Skip creating table if it exists
- ✅ Add missing constraints
- ✅ Recreate policies (drops old ones first)
- ✅ Add missing indexes
- ✅ Verify everything is correct

**OR** run this quick version:

**OR** run this quick version:

```sql
-- Drop and recreate policies
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON follows;
DROP POLICY IF EXISTS "Authenticated users can follow others" ON follows;
DROP POLICY IF EXISTS "Users can unfollow (delete their own follows)" ON follows;

CREATE POLICY "Follows are viewable by everyone"
  ON follows FOR SELECT USING (true);

CREATE POLICY "Authenticated users can follow others"
  ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow (delete their own follows)"
  ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Add constraints if missing
ALTER TABLE follows ADD CONSTRAINT IF NOT EXISTS follows_follower_id_following_id_key 
  UNIQUE(follower_id, following_id);

ALTER TABLE follows ADD CONSTRAINT IF NOT EXISTS follows_check 
  CHECK (follower_id != following_id);

-- Add indexes if missing
CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON follows(following_id);
CREATE INDEX IF NOT EXISTS follows_created_at_idx ON follows(created_at DESC);
```

---

### Step 3: Verify Files Updated (1 minute)

Check that these files were updated:

✅ `services/follow.ts` - Error handling added  
✅ `src/components/WhoToFollow.tsx` - State management fixed  
✅ `src/app/home/profile/[username]/page.tsx` - Error handling added  
✅ `supabase-schema.sql` - follows table added  

---

### Step 4: Test Follow System (2 minutes)

1. **Test "Who to Follow":**
   - Go to home page
   - Click "Follow" on a suggested user
   - Should show "Following" after click
   - Refresh page - should still show "Following"

2. **Test Profile Page:**
   - Visit another user's profile
   - Click "Follow"
   - Should show "Following"
   - Refresh page - should persist
   - Hover over "Following" - should show "Unfollow"
   - Click "Unfollow" - should work

3. **Test Edge Cases:**
   - Try following yourself - should not be possible
   - Try following same user twice - should show error

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Follow button changes to "Following" after click
2. ✅ State persists after page refresh
3. ✅ Follower count updates correctly
4. ✅ "Who to follow" suggestions reload after follow
5. ✅ No console errors

---

## 🐛 Quick Troubleshooting

### Problem: "Policy already exists" error
**Solution:** Use `supabase-follows-migration-safe.sql` instead - it drops old policies first

### Problem: "Table does not exist" error
**Solution:** The table exists but might have issues. Run `supabase-follows-verify.sql` to check

### Problem: "Constraint already exists" error  
**Solution:** This is fine! The constraint is already there. The migration script handles this.

### Problem: Follow button doesn't change
**Solution:** Check browser console for errors, verify RLS policies

### Problem: "Already following" error
**Solution:** This is correct! The duplicate check is working

### Problem: Can follow yourself
**Solution:** Re-run the CREATE TABLE SQL with CHECK constraint

---

## 📞 Need Help?

Check these files for detailed info:
- `FOLLOW-SYSTEM-FIX.md` - Complete documentation
- `supabase-follows-table.sql` - Database schema only
- Browser console - Error messages

---

**That's it! Your follow system should now work perfectly. 🎉**
