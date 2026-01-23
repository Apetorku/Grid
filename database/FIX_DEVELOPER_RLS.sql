-- Fix RLS policies so developers can see all pending projects

-- First, check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'projects';

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Developers can view assigned projects" ON projects;

-- Recreate with better rules
-- Developers can view:
-- 1. Projects assigned to them (any status)
-- 2. Projects pending review (available to accept)
CREATE POLICY "Developers can view assigned or pending projects" ON projects
    FOR SELECT 
    USING (
        auth.uid() = developer_id 
        OR status = 'pending_review'
    );

-- Verify the new policy
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'projects' 
AND policyname LIKE '%Developer%';
