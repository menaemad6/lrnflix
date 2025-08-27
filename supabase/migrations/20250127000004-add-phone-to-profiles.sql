-- Add phone field to profiles table
ALTER TABLE public.profiles
ADD COLUMN phone_number VARCHAR(20);

-- Add comment for the new field
COMMENT ON COLUMN public.profiles.phone_number IS 'Phone number for user contact';
