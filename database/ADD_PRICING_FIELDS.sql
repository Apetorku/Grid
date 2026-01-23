-- Add new columns for group pricing model

-- Add number_of_people column
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS number_of_people INTEGER DEFAULT 1;

-- Add needs_documentation column
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS needs_documentation BOOLEAN DEFAULT false;

-- Add comments for clarity
COMMENT ON COLUMN projects.number_of_people IS 'Number of people in the group/team';
COMMENT ON COLUMN projects.needs_documentation IS 'Whether documentation needs to be created';

-- Verify columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name IN ('number_of_people', 'needs_documentation');
