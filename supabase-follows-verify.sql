-- ============================================
-- FOLLOWS TABLE - VERIFICATION SCRIPT
-- Run this to check the current state of your follows table
-- ============================================

-- 1. Check if table exists
SELECT 
    CASE 
        WHEN EXISTS(SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'follows')
        THEN '✅ Table exists'
        ELSE '❌ Table does NOT exist'
    END as table_status;

-- 2. Check table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'follows'
ORDER BY ordinal_position;

-- 3. Check constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    CASE contype
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 'c' THEN 'CHECK'
        WHEN 'f' THEN 'FOREIGN KEY'
    END as type_description
FROM pg_constraint
WHERE conrelid = 'follows'::regclass;

-- 4. Check RLS status
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS is ENABLED'
        ELSE '❌ RLS is DISABLED'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'follows';

-- 5. Check RLS policies
SELECT 
    policyname as policy_name,
    CASE cmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
    END as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'follows';

-- 6. Check indexes
SELECT 
    indexname as index_name,
    indexdef as index_definition
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'follows';

-- 7. Count existing follows
SELECT 
    COUNT(*) as total_follows,
    COUNT(DISTINCT follower_id) as unique_followers,
    COUNT(DISTINCT following_id) as unique_following
FROM follows;

-- 8. Sample data (first 5 rows)
SELECT 
    id,
    follower_id,
    following_id,
    created_at
FROM follows
ORDER BY created_at DESC
LIMIT 5;

-- 9. Check for duplicate follows (should be 0)
SELECT 
    follower_id,
    following_id,
    COUNT(*) as duplicate_count
FROM follows
GROUP BY follower_id, following_id
HAVING COUNT(*) > 1;

-- 10. Check for self-follows (should be 0)
SELECT 
    COUNT(*) as self_follows_count
FROM follows
WHERE follower_id = following_id;

-- Summary
SELECT 
    '=== VERIFICATION SUMMARY ===' as summary;

SELECT 
    CASE 
        WHEN EXISTS(SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'follows')
        THEN '✅'
        ELSE '❌'
    END || ' Table exists' as check_1;

SELECT 
    CASE 
        WHEN (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'follows')
        THEN '✅'
        ELSE '❌'
    END || ' RLS enabled' as check_2;

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'follows') >= 3
        THEN '✅'
        ELSE '❌'
    END || ' Policies exist (need 3+)' as check_3;

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'follows') >= 3
        THEN '✅'
        ELSE '❌'
    END || ' Indexes exist (need 3+)' as check_4;

SELECT 
    CASE 
        WHEN EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid = 'follows'::regclass AND contype = 'u')
        THEN '✅'
        ELSE '❌'
    END || ' UNIQUE constraint exists' as check_5;

SELECT 
    CASE 
        WHEN EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid = 'follows'::regclass AND contype = 'c')
        THEN '✅'
        ELSE '❌'
    END || ' CHECK constraint exists' as check_6;
