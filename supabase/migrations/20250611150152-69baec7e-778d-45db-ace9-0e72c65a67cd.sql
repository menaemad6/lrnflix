
-- Drop the constraint if it exists and recreate it properly
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_instructor_id_fkey;

-- Add the foreign key constraint between courses and profiles
ALTER TABLE public.courses 
ADD CONSTRAINT courses_instructor_id_fkey 
FOREIGN KEY (instructor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
