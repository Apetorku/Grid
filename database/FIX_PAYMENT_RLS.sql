-- Add RLS policies for payments table so they can be read/written

-- Check current policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'payments';

-- Allow users to view their own payments
CREATE POLICY "Users can view own payments as client" ON payments
    FOR SELECT 
    USING (auth.uid() = client_id);

CREATE POLICY "Users can view own payments as developer" ON payments
    FOR SELECT 
    USING (auth.uid() = developer_id);

-- Allow clients to create payments
CREATE POLICY "Clients can create payments" ON payments
    FOR INSERT 
    WITH CHECK (auth.uid() = client_id);

-- Allow system to update payments (use service role for this)
CREATE POLICY "Allow payment updates" ON payments
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- Verify
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'payments';
