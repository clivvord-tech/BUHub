# Follow Not Persisting After Refresh - Troubleshooting Guide

## 🔍 THE PROBLEM

Follow button works temporarily, but after refresh or leaving the page, it reverts to "Follow" instead of "Following".

This means ONE of these is happening:
1. ❌ Follow is NOT being saved to database
2. ❌ Follow IS saved, but checkIfFollowing() is not reading it correctly
3. ❌ RLS policies are blocking the read
4. ❌ Race condition with user authentication

---

## 🧪 DIAGNOSTIC STEPS

### Step 1: Check Browser Console (CRITICAL)

After clicking "Follow", look for these logs:

```
[followUser] Current user: [user-id]
[followUser] Following: [target-user-id]
[followUser] Successfully inserted: [data]
```

**If you see:**
- ✅ "Successfully inserted" → Follow WAS saved
- ❌ Error message → Follow was NOT saved
- ❌ Nothing → Function not being called

### Step 2: Check Database Directly

Run this in Supabase SQL Editor:

```sql
-- Check if follow was actually saved
SELECT 
    f.*,
    follower.username as follower,
    following.username as following
FROM follows f
JOIN profiles follower ON f.follower_id = follower.id
JOIN profiles following ON f.following_id = following.id
ORDER BY f.created_at DESC
LIMIT 10;
```

**If you see your follow:**
- ✅ Follow IS in database → Problem is with checkIfFollowing()
- ❌ Follow NOT in database → Problem is with followUser()

### Step 3: Check Follow Status Query

After refresh, look for these logs:

```
[checkIfFollowing] Current user: [user-id]
[checkIfFollowing] Checking if following: [target-user-id]
[checkIfFollowing] Result - Following [target-user-id]: true/false
[checkIfFollowing] Data returned: [data or null]
```

**If you see:**
- ✅ "Result: true" → Query works, but UI not updating
- ❌ "Result: false" → Query not finding the follow
- ❌ "Data returned: null" → RLS might be blocking

---

## 🔧 FIXES BASED ON DIAGNOSIS

### FIX 1: Follow Not Being Saved

**Symptom:** No "Successfully inserted" log, or error in console

**Possible Causes:**
1. RLS INSERT policy blocking
2. Foreign key constraint failing
3. Authentication issue

**Solution:**

```sql
-- Check RLS INSERT policy
SELECT * FROM pg_policies 
WHERE tablename = 'follows' AND cmd = 'a';

-- Should show: WITH CHECK (auth.uid() = follower_id)

-- Test INSERT manually
INSERT INTO follows (follower_id, following_id)
VALUES (
    (SELECT id FROM profiles WHERE username = 'your_username'),
    (SELECT id FROM profiles WHERE username = 'target_username')
);
-- If this fails, check the error message
```

### FIX 2: Follow Saved But Not Read

**Symptom:** "Successfully inserted" log, but checkIfFollowing returns false

**Possible Causes:**
1. RLS SELECT policy blocking
2. Wrong user ID being used
3. Query not matching the data

**Solution:**

```sql
-- Check RLS SELECT policy
SELECT * FROM pg_policies 
WHERE tablename = 'follows' AND cmd = 'r';

-- Should show: USING (true) -- Everyone can read

-- Test SELECT manually
SELECT * FROM follows 
WHERE follower_id = (SELECT id FROM profiles WHERE username = 'your_username')
AND following_id = (SELECT id FROM profiles WHERE username = 'target_username');
-- Should return 1 row
```

### FIX 3: Race Condition with User Load

**Symptom:** Works sometimes, not others. Logs show "No user" or "Skipping follow check"

**Solution:** Already applied - added `currentUser?.id` to useEffect dependency

### FIX 4: RLS Policies Blocking

**Symptom:** "Data returned: null" even though follow exists in database

**Solution:**

```sql
-- Drop and recreate SELECT policy
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON follows;

CREATE POLICY "Follows are viewable by everyone"
  ON follows FOR SELECT
  USING (true);

-- Verify RLS is enabled
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
```

---

## 📋 COMPLETE DIAGNOSTIC CHECKLIST

Run through this checklist:

### Database Checks:
- [ ] Run `supabase-follows-persistence-debug.sql`
- [ ] Verify follows table exists
- [ ] Verify RLS is enabled
- [ ] Verify 3 policies exist (SELECT, INSERT, DELETE)
- [ ] Verify UNIQUE constraint exists
- [ ] Check if any follows exist in database

### Console Checks (After clicking Follow):
- [ ] See `[followUser] Current user: [id]`
- [ ] See `[followUser] Following: [id]`
- [ ] See `[followUser] Successfully inserted`
- [ ] See `Follow status after action: true`
- [ ] No error messages

### Console Checks (After refresh):
- [ ] See `Checking follow status for: [username]`
- [ ] See `Current user ID: [id]`
- [ ] See `Profile user ID: [id]`
- [ ] See `[checkIfFollowing] Result: true`
- [ ] See `Follow status result: true`

### UI Checks:
- [ ] Button changes to "Following" after click
- [ ] Button stays "Following" after refresh
- [ ] Follower count increases by 1
- [ ] No error alerts

---

## 🎯 MOST LIKELY CAUSES

Based on common issues:

### 1. RLS SELECT Policy Too Restrictive (80% of cases)

**Check:**
```sql
SELECT qual FROM pg_policies 
WHERE tablename = 'follows' AND cmd = 'r';
```

**Should be:** `true` (allows everyone to read)

**If it's:** `(auth.uid() = follower_id)` → This is WRONG, change to `true`

### 2. User Not Loaded When Check Runs (15% of cases)

**Already fixed** by adding `currentUser?.id` to useEffect dependency

### 3. Supabase Client Cache (5% of cases)

**Solution:** Clear browser cache completely:
```
Ctrl+Shift+Delete → Clear all → Restart browser
```

---

## 🚀 QUICK FIX SCRIPT

Run this in Supabase SQL Editor to fix most common issues:

```sql
-- Fix RLS policies
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON follows;
DROP POLICY IF EXISTS "Authenticated users can follow others" ON follows;
DROP POLICY IF EXISTS "Users can unfollow (delete their own follows)" ON follows;

CREATE POLICY "Follows are viewable by everyone"
  ON follows FOR SELECT USING (true);

CREATE POLICY "Authenticated users can follow others"
  ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow (delete their own follows)"
  ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Ensure RLS is enabled
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Verify
SELECT 
    policyname,
    CASE cmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'd' THEN 'DELETE'
    END as command,
    qual as using_clause
FROM pg_policies
WHERE tablename = 'follows';
```

---

## 📞 NEXT STEPS

1. **Clear browser cache** completely
2. **Open browser console** (F12)
3. **Go to a user's profile**
4. **Click "Follow"**
5. **Watch console logs** - copy them
6. **Refresh page**
7. **Watch console logs again** - copy them
8. **Run** `supabase-follows-persistence-debug.sql` in Supabase
9. **Compare** what you see with this guide

---

## ✅ SUCCESS INDICATORS

You'll know it's fixed when you see:

1. Console shows: `[followUser] Successfully inserted`
2. Console shows: `Follow status after action: true`
3. Button changes to "Following"
4. Refresh page
5. Console shows: `[checkIfFollowing] Result: true`
6. Button still shows "Following"
7. Database query shows the follow row

---

**The detailed logging is now in place. Follow the diagnostic steps above to identify the exact issue!**
