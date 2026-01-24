-- Create project_deliverables table
CREATE TABLE IF NOT EXISTS project_deliverables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE project_deliverables ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view deliverables for their projects
CREATE POLICY "Users can view project deliverables"
  ON project_deliverables FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE client_id = auth.uid() OR developer_id = auth.uid()
    )
  );

-- Policy: Developers can upload deliverables for their projects
CREATE POLICY "Developers can upload deliverables"
  ON project_deliverables FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid() AND
    project_id IN (
      SELECT id FROM projects WHERE developer_id = auth.uid()
    )
  );

-- Policy: Uploaders can delete their deliverables
CREATE POLICY "Uploaders can delete deliverables"
  ON project_deliverables FOR DELETE
  USING (uploaded_by = auth.uid());

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_deliverables_project_id ON project_deliverables(project_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_uploaded_by ON project_deliverables(uploaded_by);
