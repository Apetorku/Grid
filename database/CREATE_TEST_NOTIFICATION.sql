-- Create a test notification for the current user
-- Run this in Supabase SQL Editor after replacing YOUR_USER_ID

-- First, find your user ID
SELECT id, email, full_name FROM users LIMIT 10;

-- Then create a test notification (replace 'YOUR_USER_ID' with actual ID from above)
INSERT INTO notifications (user_id, title, message, type, is_read)
VALUES (
    'YOUR_USER_ID',  -- Replace with your actual user ID
    'Test Notification',
    'This is a test notification to verify the system is working.',
    'info',
    false
);

-- Verify it was created
SELECT * FROM notifications WHERE user_id = 'YOUR_USER_ID' ORDER BY created_at DESC LIMIT 5;
