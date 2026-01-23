-- Fix RLS so clients can see ALL their projects regardless of status

-- Check current client policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'projects' 
AND policyname LIKE '%Client%';

-- The existing policy should work, but let's make sure it's correct
DROP POLICY IF EXISTS "Clients can view own projects" ON projects;

CREATE POLICY "Clients can view own projects" ON projects
    FOR SELECT 
    USING (auth.uid() = client_id);

-- Verify
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'projects' 
AND policyname = 'Clients can view own projects';
