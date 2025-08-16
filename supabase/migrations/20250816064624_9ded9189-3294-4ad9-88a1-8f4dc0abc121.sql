
-- Add category/group field to multiplayer_quiz_questions table
ALTER TABLE public.multiplayer_quiz_questions 
ADD COLUMN category text NOT NULL DEFAULT 'General';

-- Create an index for better performance when filtering by category
CREATE INDEX idx_multiplayer_quiz_questions_category 
ON public.multiplayer_quiz_questions(category);

-- Update existing questions to have a default category
UPDATE public.multiplayer_quiz_questions 
SET category = 'General' 
WHERE category IS NULL;

-- Add category field to quiz_rooms table
ALTER TABLE public.quiz_rooms 
ADD COLUMN category text;

-- Create an index for better performance when filtering rooms by category
CREATE INDEX idx_quiz_rooms_category 
ON public.quiz_rooms(category);

-- Update existing rooms to have a default category
UPDATE public.quiz_rooms 
SET category = 'General' 
WHERE category IS NULL;
