-- Check all RLS policies on projects table
SELECT 
    policyname, 
    cmd as operation,
    qual as using_condition,
    with_check
FROM pg_policies 
WHERE tablename = 'projects'
ORDER BY cmd, policyname;

-- The issue: Developers might not have permission to UPDATE projects
-- Let's check if this policy exists:

-- This should exist:
-- CREATE POLICY "Developers can update assigned projects" ON projects
--     FOR UPDATE USING (auth.uid() = developer_id);

-- But this WON'T work for accepting a NEW project because developer_id is NULL!
-- We need a policy that allows developers to UPDATE projects where status = 'pending_review'

-- Fix: Allow developers to accept pending projects
DROP POLICY IF EXISTS "Developers can accept pending projects" ON projects;

CREATE POLICY "Developers can accept pending projects" ON projects
    FOR UPDATE
    USING (
        -- Can update if: assigned to them OR pending review
        auth.uid() = developer_id OR status = 'pending_review'
    )
    WITH CHECK (
        -- After update, must be assigned to them
        auth.uid() = developer_id
    );

-- Verify the fix
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'projects' 
AND cmd = 'UPDATE';
