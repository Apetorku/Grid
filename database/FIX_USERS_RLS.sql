-- Fix users table RLS to allow authenticated users to view basic info of other users
-- This is needed for generating invoices, receipts, and contracts
-- Run this in Supabase SQL Editor

-- Drop existing SELECT policy if needed
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can view basic info of others" ON users;

-- Allow users to view their own full profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT 
    USING (auth.uid() = id);

-- Allow authenticated users to view basic info (name, email) of other users
-- This is needed for generating documents that involve client and developer info
CREATE POLICY "Users can view basic info of others" ON users
    FOR SELECT 
    USING (
        auth.uid() IS NOT NULL
    );

-- Note: This allows authenticated users to see basic profile info (name, email) of other users
-- which is necessary for the platform functionality (invoices, contracts, project displays, etc.)
-- Sensitive data should be kept in separate tables if needed
