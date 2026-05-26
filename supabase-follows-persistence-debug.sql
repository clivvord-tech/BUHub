-- ============================================
-- FOLLOW PERSISTENCE DEBUG
-- Run this to check if follows are actually being saved
-- ============================================

-- 1. Check if ANY follows exist in the database
SELECT 
    '=== Step 1: Check if follows exist ===' as step,
    COUNT(*) as total_follows
FROM follows;

-- 2. Show the most recent follows
SELECT 
    '=== Step 2: Recent follows ===' as step,
    f.id,
    f.follower_id,
    f.following_id,
    f.created_at,
    follower.username as follower_username,
    following.username as following_username
FROM follows f
LEFT JOIN profiles follower ON f.follower_id = follower.id
LEFT JOIN profiles following ON f.following_id = following.id
ORDER BY f.created_at DESC
LIMIT 10;

-- 3. Check if RLS policies are blocking reads
-- This simulates what the app does when checking follow status
SELECT 
    '=== Step 3: Test SELECT policy ===' as step,
    COUNT(*) as can_read_follows
FROM follows;

-- 4. Check if there are any follows for a specific user
-- Replace 'YOUR_USERNAME' with an actual username
SELECT 
    '=== Step 4: Follows for specific user ===' as step,
    f.*,
    follower.username as follower,
    following.username as following
FROM follows f
JOIN profiles follower ON f.follower_id = follower.id
JOIN profiles following ON f.following_id = following.id
WHERE follower.username = 'YOUR_USERNAME' -- Replace this
   OR following.username = 'YOUR_USERNAME'; -- Replace this

-- 5. Test if INSERT is working
-- This will try to insert a test follow (will fail if already exists)
-- Uncomment and replace IDs to test
/*
INSERT INTO follows (follower_id, following_id)
VALUES (
    (SELECT id FROM profiles WHERE username = 'user1'), -- Replace
    (SELECT id FROM profiles WHERE username = 'user2')  -- Replace
);
*/

-- 6. Check RLS policies in detail
SELECT 
    '=== Step 6: RLS Policy Details ===' as step,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_clause,
    with_check as with_check_clause
FROM pg_policies
WHERE tablename = 'follows';

-- 7. Check if auth.uid() is working in RLS context
-- This tests if the RLS policies can see the current user
SELECT 
    '=== Step 7: Auth Context Test ===' as step,
    current_user as postgres_user,
    current_setting('request.jwt.claims', true) as jwt_claims;

-- 8. Verify foreign key constraints aren't blocking
SELECT 
    '=== Step 8: Foreign Key Constraints ===' as step,
    conname as constraint_name,
    contype as type,
    confupdtype as on_update,
    confdeltype as on_delete
FROM pg_constraint
WHERE conrelid = 'follows'::regclass
  AND contype = 'f';
