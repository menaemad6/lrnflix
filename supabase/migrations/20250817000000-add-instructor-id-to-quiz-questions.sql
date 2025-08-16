-- Add instructor_id to multiplayer_quiz_questions table
ALTER TABLE public.multiplayer_quiz_questions
ADD COLUMN instructor_id UUID REFERENCES public.profiles(id);

-- Enable RLS on the table if it's not already enabled
ALTER TABLE public.multiplayer_quiz_questions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow all access to multiplayer quiz questions" ON public.multiplayer_quiz_questions;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.multiplayer_quiz_questions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.multiplayer_quiz_questions;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.multiplayer_quiz_questions;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.multiplayer_quiz_questions;
DROP POLICY IF EXISTS "Allow read access to everyone for multiplayer quiz questions" ON public.multiplayer_quiz_questions;
DROP POLICY IF EXISTS "Allow instructors to insert their own multiplayer quiz questions" ON public.multiplayer_quiz_questions;
DROP POLICY IF EXISTS "Allow instructors to update their own multiplayer quiz questions" ON public.multiplayer_quiz_questions;
DROP POLICY IF EXISTS "Allow instructors to delete their own multiplayer quiz questions" ON public.multiplayer_quiz_questions;


-- RLS Policies for multiplayer_quiz_questions

-- 1. Allow students and instructors to read all questions (for gameplay)
CREATE POLICY "Allow read access to everyone for multiplayer quiz questions"
ON public.multiplayer_quiz_questions
FOR SELECT
USING (true);

-- 2. Allow instructors to insert questions for themselves
CREATE POLICY "Allow instructors to insert their own multiplayer quiz questions"
ON public.multiplayer_quiz_questions
FOR INSERT
WITH CHECK (
  auth.uid() = instructor_id AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
);

-- 3. Allow instructors to update their own questions
CREATE POLICY "Allow instructors to update their own multiplayer quiz questions"
ON public.multiplayer_quiz_questions
FOR UPDATE
USING (
  auth.uid() = instructor_id AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
);

-- 4. Allow instructors to delete their own questions
CREATE POLICY "Allow instructors to delete their own multiplayer quiz questions"
ON public.multiplayer_quiz_questions
FOR DELETE
USING (
  auth.uid() = instructor_id AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
);
