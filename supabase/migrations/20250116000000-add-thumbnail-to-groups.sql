-- Add thumbnail field to groups table
ALTER TABLE groups ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN groups.thumbnail_url IS 'URL to the group thumbnail image stored in Supabase storage';
