-- Add total_xp field to profiles table for cumulative XP tracking
ALTER TABLE public.profiles 
ADD COLUMN total_xp INTEGER NOT NULL DEFAULT 0;

-- Create index for better performance on XP-based queries
CREATE INDEX idx_profiles_total_xp ON public.profiles(total_xp);

-- Create a function to update total_xp when XP is earned
CREATE OR REPLACE FUNCTION public.update_profile_total_xp(
  p_user_id UUID,
  p_xp_earned INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET total_xp = total_xp + p_xp_earned
  WHERE id = p_user_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.update_profile_total_xp(UUID, INTEGER) TO authenticated;
