-- Change total_xp column from INTEGER to JSONB for category-based XP tracking
ALTER TABLE public.profiles 
ALTER COLUMN total_xp TYPE JSONB USING '{}'::jsonb;

-- Set default value to empty JSON object
ALTER TABLE public.profiles 
ALTER COLUMN total_xp SET DEFAULT '{}'::jsonb;

-- Drop the old function since we don't need it anymore
DROP FUNCTION IF EXISTS public.update_profile_total_xp(UUID, INTEGER);

-- Drop the old index since we're changing the column type
DROP INDEX IF EXISTS idx_profiles_total_xp;
