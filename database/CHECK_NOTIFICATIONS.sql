-- Check if notifications table has any data
-- Run this in Supabase SQL Editor to see if notifications exist

SELECT 
    n.*,
    u.email as user_email,
    u.full_name as user_name
FROM notifications n
LEFT JOIN users u ON n.user_id = u.id
ORDER BY n.created_at DESC
LIMIT 20;

-- Check RLS policies on notifications table
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
WHERE tablename = 'notifications';

-- Count total notifications
SELECT COUNT(*) as total_notifications FROM notifications;

-- Check if table exists and has RLS enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'notifications';
