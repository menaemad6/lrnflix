
-- Add missing fields to quiz_rooms table
ALTER TABLE public.quiz_rooms 
ADD COLUMN IF NOT EXISTS room_code TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Create index for faster room code lookups
CREATE INDEX IF NOT EXISTS idx_quiz_rooms_room_code ON public.quiz_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_quiz_rooms_public_status ON public.quiz_rooms(is_public, status);
