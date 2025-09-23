-- Revert payment_data column from profiles table
-- This migration removes the payment_data column that was incorrectly added to profiles

-- Drop the index first
DROP INDEX IF EXISTS idx_profiles_payment_data;

-- Remove the payment_data column from profiles table
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS payment_data;
