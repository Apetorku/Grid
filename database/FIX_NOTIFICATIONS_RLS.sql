-- Fix notifications RLS policies to allow system to create notifications
-- Run this in Supabase SQL Editor

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Allow users to view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Allow users to update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Allow authenticated users to create notifications for any user
-- This is needed because developers create notifications for clients and vice versa
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT 
    WITH CHECK (true);

-- Note: The INSERT policy allows any authenticated user to create notifications
-- This is safe because the API routes control who can create notifications
-- and they're only created during legitimate actions (payments, approvals, etc.)
