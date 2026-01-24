-- ============================================
-- Complete Fix for Project Files System
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- 1. Create project-files storage bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Add storage bucket policies
-- ============================================

-- Policy: Authenticated users can upload project files
CREATE POLICY "Authenticated users can upload project files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-files');

-- Policy: Anyone can view project files (public bucket)
CREATE POLICY "Anyone can view project files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-files');

-- Policy: Users can delete their own project files
CREATE POLICY "Users can delete own project files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Add RLS policies for project_files table
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view project files" ON project_files;
DROP POLICY IF EXISTS "Users can upload project files" ON project_files;
DROP POLICY IF EXISTS "Users can delete own project files" ON project_files;

-- Policy: Users can view files for their projects (client or assigned developer)
-- Plus developers can view files for pending_review projects
CREATE POLICY "Users can view project files"
  ON project_files FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE client_id = auth.uid() 
         OR developer_id = auth.uid()
         OR (status = 'pending_review' AND auth.uid() IN (SELECT id FROM users WHERE role = 'developer'))
    )
  );

-- Policy: Users can upload files to their projects
CREATE POLICY "Users can upload project files"
  ON project_files FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid() AND
    project_id IN (
      SELECT id FROM projects 
      WHERE client_id = auth.uid() OR developer_id = auth.uid()
    )
  );

-- Policy: Users can delete their own uploaded files
CREATE POLICY "Users can delete own project files"
  ON project_files FOR DELETE
  USING (uploaded_by = auth.uid());

-- ============================================
-- DONE! Project files system is now ready
-- ============================================
