-- ============================================
-- FOLLOW SYSTEM - COMPREHENSIVE TEST
-- Run this in Supabase SQL Editor to verify everything works
-- ============================================

-- TEST 1: Verify table exists and has correct structure
SELECT 
    '=== TEST 1: Table Structure ===' as test,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'follows'
ORDER BY ordinal_position;

-- Expected: id, follower_id, following_id, created_at

-- TEST 2: Verify RLS is enabled
SELECT 
    '=== TEST 2: RLS Status ===' as test,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'follows';

-- Expected: ✅ ENABLED

-- TEST 3: Verify RLS policies exist
SELECT 
    '=== TEST 3: RLS Policies ===' as test,
    policyname as policy_name,
    CASE cmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
    END as command
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'follows'
ORDER BY cmd;

-- Expected: 3 policies (SELECT, INSERT, DELETE)

-- TEST 4: Verify constraints exist
SELECT 
    '=== TEST 4: Constraints ===' as test,
    conname as constraint_name,
    CASE contype
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 'c' THEN 'CHECK'
        WHEN 'f' THEN 'FOREIGN KEY'
    END as constraint_type
FROM pg_constraint
WHERE conrelid = 'follows'::regclass
ORDER BY contype;

-- Expected: PRIMARY KEY, 2 FOREIGN KEYs, UNIQUE, CHECK

-- TEST 5: Verify indexes exist
SELECT 
    '=== TEST 5: Indexes ===' as test,
    indexname as index_name
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'follows'
ORDER BY indexname;

-- Expected: At least 3 indexes

-- TEST 6: Count existing follows
SELECT 
    '=== TEST 6: Data Count ===' as test,
    COUNT(*) as total_follows,
    COUNT(DISTINCT follower_id) as unique_followers,
    COUNT(DISTINCT following_id) as unique_following
FROM follows;

-- TEST 7: Check for data integrity issues
SELECT 
    '=== TEST 7: Data Integrity ===' as test,
    'Duplicates' as check_type,
    COUNT(*) as issue_count
FROM (
    SELECT follower_id, following_id, COUNT(*) 
    FROM follows 
    GROUP BY follower_id, following_id 
    HAVING COUNT(*) > 1
) duplicates
UNION ALL
SELECT 
    '=== TEST 7: Data Integrity ===' as test,
    'Self-follows' as check_type,
    COUNT(*) as issue_count
FROM follows
WHERE follower_id = following_id;

-- Expected: Both should be 0

-- TEST 8: Sample data with user info
SELECT 
    '=== TEST 8: Sample Data ===' as test,
    f.id,
    follower.username as follower,
    following.username as following,
    f.created_at
FROM follows f
LEFT JOIN profiles follower ON f.follower_id = follower.id
LEFT JOIN profiles following ON f.following_id = following.id
ORDER BY f.created_at DESC
LIMIT 5;

-- TEST 9: Test query performance (should be fast with indexes)
EXPLAIN ANALYZE
SELECT * FROM follows 
WHERE follower_id = (SELECT id FROM profiles LIMIT 1)
AND following_id = (SELECT id FROM profiles OFFSET 1 LIMIT 1);

-- TEST 10: Verify foreign key relationships work
SELECT 
    '=== TEST 10: Foreign Keys ===' as test,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'follows' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- Expected: 2 foreign keys (follower_id → profiles.id, following_id → profiles.id)

-- SUMMARY
SELECT 
    '=== SUMMARY ===' as summary,
    CASE 
        WHEN EXISTS(SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'follows')
        THEN '✅ Table exists'
        ELSE '❌ Table missing'
    END as check_1,
    CASE 
        WHEN (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'follows')
        THEN '✅ RLS enabled'
        ELSE '❌ RLS disabled'
    END as check_2,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'follows') >= 3
        THEN '✅ Policies exist'
        ELSE '❌ Missing policies'
    END as check_3,
    CASE 
        WHEN EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid = 'follows'::regclass AND contype = 'u')
        THEN '✅ UNIQUE constraint'
        ELSE '❌ Missing UNIQUE'
    END as check_4,
    CASE 
        WHEN EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid = 'follows'::regclass AND contype = 'c')
        THEN '✅ CHECK constraint'
        ELSE '❌ Missing CHECK'
    END as check_5;

-- If all checks pass, the database is correctly configured!
