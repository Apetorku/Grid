-- Create storage bucket for project requirement files
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

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
