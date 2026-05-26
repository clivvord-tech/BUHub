-- ============================================
-- FOLLOWS DEBUG SCRIPT
-- Run this to diagnose follow issues
-- ============================================

-- 1. Show all follows in the database
SELECT 
    f.id,
    f.follower_id,
    follower.username as follower_username,
    follower.name as follower_name,
    f.following_id,
    following.username as following_username,
    following.name as following_name,
    f.created_at
FROM follows f
LEFT JOIN profiles follower ON f.follower_id = follower.id
LEFT JOIN profiles following ON f.following_id = following.id
ORDER BY f.created_at DESC
LIMIT 20;

-- 2. Count follows per user
SELECT 
    p.username,
    p.name,
    COUNT(DISTINCT f1.following_id) as following_count,
    COUNT(DISTINCT f2.follower_id) as followers_count
FROM profiles p
LEFT JOIN follows f1 ON p.id = f1.follower_id
LEFT JOIN follows f2 ON p.id = f2.following_id
GROUP BY p.id, p.username, p.name
ORDER BY followers_count DESC;

-- 3. Check for duplicate follows (should be 0)
SELECT 
    follower_id,
    following_id,
    COUNT(*) as count
FROM follows
GROUP BY follower_id, following_id
HAVING COUNT(*) > 1;

-- 4. Check for self-follows (should be 0)
SELECT 
    f.id,
    p.username,
    p.name
FROM follows f
JOIN profiles p ON f.follower_id = p.id
WHERE f.follower_id = f.following_id;

-- 5. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'follows';

-- 6. Test query as if you're a specific user
-- Replace 'YOUR_USER_ID' with actual user ID
DO $$
DECLARE
    test_user_id UUID := 'YOUR_USER_ID'; -- Replace this
    test_following_id UUID := 'TARGET_USER_ID'; -- Replace this
    follow_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM follows 
        WHERE follower_id = test_user_id 
        AND following_id = test_following_id
    ) INTO follow_exists;
    
    RAISE NOTICE 'Follow exists: %', follow_exists;
END $$;

-- 7. Show recent follow activity
SELECT 
    'Follow' as action,
    follower.username as user,
    following.username as target,
    f.created_at
FROM follows f
JOIN profiles follower ON f.follower_id = follower.id
JOIN profiles following ON f.following_id = following.id
ORDER BY f.created_at DESC
LIMIT 10;

-- 8. Check if table has correct structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'follows'
ORDER BY ordinal_position;

-- 9. Check constraints
SELECT 
    conname as constraint_name,
    contype as type,
    CASE contype
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 'c' THEN 'CHECK'
        WHEN 'f' THEN 'FOREIGN KEY'
    END as description
FROM pg_constraint
WHERE conrelid = 'follows'::regclass;

-- 10. Test insert (will fail if already exists due to UNIQUE constraint)
-- Uncomment and replace IDs to test
/*
INSERT INTO follows (follower_id, following_id)
VALUES ('YOUR_USER_ID', 'TARGET_USER_ID');
*/
