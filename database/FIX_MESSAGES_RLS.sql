-- Fix Messages RLS Policies

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view messages for their projects" ON messages;
DROP POLICY IF EXISTS "Users can send messages for their projects" ON messages;
DROP POLICY IF EXISTS "Users can insert messages for their projects" ON messages;
DROP POLICY IF EXISTS "Users can view their messages" ON messages;

-- Allow users to view messages where they are sender or receiver
CREATE POLICY "Users can view messages for their projects"
ON messages
FOR SELECT
TO authenticated
USING (
  auth.uid() = sender_id 
  OR auth.uid() = receiver_id
  OR EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = messages.project_id 
    AND (projects.client_id = auth.uid() OR projects.developer_id = auth.uid())
  )
);

-- Allow users to insert messages for projects they're part of
CREATE POLICY "Users can insert messages for their projects"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = messages.project_id 
    AND (projects.client_id = auth.uid() OR projects.developer_id = auth.uid())
  )
);

-- Allow users to update their own messages (for read status, etc)
CREATE POLICY "Users can update messages they received"
ON messages
FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);
