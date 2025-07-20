
-- Add is_code_visible column to groups table
ALTER TABLE groups
ADD COLUMN IF NOT EXISTS is_code_visible BOOLEAN NOT NULL DEFAULT TRUE;

-- Add is_members_visible column to groups table  
ALTER TABLE groups
ADD COLUMN IF NOT EXISTS is_members_visible BOOLEAN NOT NULL DEFAULT TRUE;
