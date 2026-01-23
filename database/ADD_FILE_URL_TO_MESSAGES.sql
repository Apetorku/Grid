-- Add file_url column to messages table

ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN messages.file_url IS 'Public URL of attached file from Supabase Storage';
