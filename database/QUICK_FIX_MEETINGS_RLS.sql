-- Quick Fix: Add RLS policies for screen_sessions table
-- Run this in your Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their meetings" ON screen_sessions;
DROP POLICY IF EXISTS "Users can create meetings" ON screen_sessions;
DROP POLICY IF EXISTS "Users can update their meetings" ON screen_sessions;

-- Enable RLS on screen_sessions table
ALTER TABLE screen_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view meetings they are part of
CREATE POLICY "Users can view their meetings" ON screen_sessions
    FOR SELECT USING (
        auth.uid() = host_id OR auth.uid() = participant_id
    );

-- Users can create meetings
CREATE POLICY "Users can create meetings" ON screen_sessions
    FOR INSERT WITH CHECK (auth.uid() = host_id);

-- Users can update meetings they participate in
CREATE POLICY "Users can update their meetings" ON screen_sessions
    FOR UPDATE USING (
        auth.uid() = host_id OR auth.uid() = participant_id
    );
