-- Add question_image field to quiz_questions table
ALTER TABLE public.quiz_questions 
ADD COLUMN question_image text;

-- Add comment for documentation
COMMENT ON COLUMN public.quiz_questions.question_image IS 'URL or path to the question image in storage';

-- Enable RLS on the new column
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
