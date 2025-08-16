-- Fix matchmaking schema and add missing fields

-- Add category field to matchmaking_queue
ALTER TABLE public.matchmaking_queue 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';

-- Add missing fields to quiz_rooms table
ALTER TABLE public.quiz_rooms 
ADD COLUMN IF NOT EXISTS room_code TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General',
ADD COLUMN IF NOT EXISTS shuffled_questions TEXT[];

-- Add unique constraint on room_code
ALTER TABLE public.quiz_rooms 
ADD CONSTRAINT unique_room_code UNIQUE (room_code);

-- Update the existing quiz_rooms table structure to match the GameRoom interface
-- This ensures compatibility with the frontend code
