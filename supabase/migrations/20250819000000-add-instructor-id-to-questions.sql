-- Add instructor_id column to questions table for tenant categorization
-- This allows questions to be associated with specific instructors/tenants

-- Add the instructor_id column
ALTER TABLE public.questions 
ADD COLUMN instructor_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL;

-- Create an index for better query performance when filtering by instructor_id
CREATE INDEX IF NOT EXISTS idx_questions_instructor_id ON public.questions(instructor_id);

-- Update existing questions to have NULL instructor_id (they will be treated as global questions)
-- This maintains backward compatibility
UPDATE public.questions SET instructor_id = NULL WHERE instructor_id IS NULL;

-- Add a comment to document the purpose of this column
COMMENT ON COLUMN public.questions.instructor_id IS 'References the teacher/instructor who owns this question. NULL means the question is global and not tied to any specific tenant.';
