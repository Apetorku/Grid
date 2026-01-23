-- Ensure payments table has proper RLS policies for clients and developers
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Clients can view own payments" ON payments;
DROP POLICY IF EXISTS "Developers can view project payments" ON payments;
DROP POLICY IF EXISTS "Clients can create payments" ON payments;
DROP POLICY IF EXISTS "Clients can update own payments" ON payments;
DROP POLICY IF EXISTS "System can update payments" ON payments;

-- Allow clients to view their own payments
CREATE POLICY "Clients can view own payments" ON payments
    FOR SELECT 
    USING (
        auth.uid() = client_id
    );

-- Allow developers to view payments for their projects
CREATE POLICY "Developers can view project payments" ON payments
    FOR SELECT 
    USING (
        auth.uid() = developer_id
    );

-- Allow clients to create payments
CREATE POLICY "Clients can create payments" ON payments
    FOR INSERT 
    WITH CHECK (
        auth.uid() = client_id
    );

-- Allow authenticated users to update payments (needed for payment verification)
CREATE POLICY "System can update payments" ON payments
    FOR UPDATE 
    USING (
        auth.uid() = client_id OR auth.uid() = developer_id
    );
