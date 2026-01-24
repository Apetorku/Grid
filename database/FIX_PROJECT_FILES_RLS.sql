-- Add RLS policies for project_files table

-- Policy: Users can view files for their projects (client or developer)
CREATE POLICY "Users can view project files"
  ON project_files FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE client_id = auth.uid() OR developer_id = auth.uid()
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
