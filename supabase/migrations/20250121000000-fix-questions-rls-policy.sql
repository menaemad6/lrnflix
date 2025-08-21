-- Fix RLS policy for questions to allow teachers and admins to update any question
-- This is needed for the resolve functionality

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Students can update their own questions" ON public.questions;

-- Create a new policy that allows both students to update their own questions AND teachers/admins to update any question
CREATE POLICY "Users can update questions based on role" 
  ON public.questions 
  FOR UPDATE 
  USING (
    auth.uid() = student_id 
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );
