-- Fix Row Level Security policies for screen_sessions (meetings)

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their meetings" ON screen_sessions;
DROP POLICY IF EXISTS "Users can create meetings" ON screen_sessions;
DROP POLICY IF EXISTS "Users can update their meetings" ON screen_sessions;

-- Users can view meetings they are part of (as host or participant)
CREATE POLICY "Users can view their meetings" ON screen_sessions
    FOR SELECT USING (
        auth.uid() = host_id OR 
        auth.uid() = participant_id
    );

-- Users can create meetings for projects they are part of
CREATE POLICY "Users can create meetings" ON screen_sessions
    FOR INSERT WITH CHECK (
        auth.uid() = host_id AND
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = screen_sessions.project_id 
            AND (projects.client_id = auth.uid() OR projects.developer_id = auth.uid())
        )
    );

-- Users can update meetings they host
CREATE POLICY "Users can update their meetings" ON screen_sessions
    FOR UPDATE USING (
        auth.uid() = host_id OR 
        auth.uid() = participant_id
    );

-- Users can delete meetings they host
CREATE POLICY "Users can delete their meetings" ON screen_sessions
    FOR DELETE USING (
        auth.uid() = host_id
    );
