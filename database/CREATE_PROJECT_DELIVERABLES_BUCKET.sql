-- Create storage bucket for project deliverables
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-deliverables', 'project-deliverables', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Authenticated users can upload deliverables
CREATE POLICY "Authenticated users can upload deliverables"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-deliverables');

-- Policy: Anyone can view deliverables (public bucket)
CREATE POLICY "Anyone can view deliverables"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-deliverables');

-- Policy: Users can delete their own deliverables
CREATE POLICY "Users can delete own deliverables"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-deliverables' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
