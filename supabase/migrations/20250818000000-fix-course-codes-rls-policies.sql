-- Fix RLS policies for course_codes table
-- This allows students to read discount codes for validation

-- First, check if RLS is enabled on course_codes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'course_codes'
  ) THEN
    RAISE EXCEPTION 'Table course_codes does not exist';
  END IF;
END $$;

-- Enable RLS on course_codes if not already enabled
ALTER TABLE public.course_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Everyone can view course codes" ON public.course_codes;
DROP POLICY IF EXISTS "Teachers can manage course codes" ON public.course_codes;
DROP POLICY IF EXISTS "Students can view course codes" ON public.course_codes;

-- Policy 1: Allow everyone to view course codes (for discount validation)
CREATE POLICY "Everyone can view course codes"
  ON public.course_codes
  FOR SELECT
  USING (true);

-- Policy 2: Allow teachers to create course codes for their courses
CREATE POLICY "Teachers can create course codes"
  ON public.course_codes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id 
      AND instructor_id = auth.uid()
    )
  );

-- Policy 3: Allow teachers to update course codes for their courses
CREATE POLICY "Teachers can update course codes"
  ON public.course_codes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id 
      AND instructor_id = auth.uid()
    )
  );

-- Policy 4: Allow teachers to delete course codes for their courses
CREATE POLICY "Teachers can delete course codes"
  ON public.course_codes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id 
      AND instructor_id = auth.uid()
    )
  );

-- Add comment explaining the policies
COMMENT ON POLICY "Everyone can view course codes" ON public.course_codes IS
  'Allows students to read discount codes for validation during purchase';

COMMENT ON POLICY "Teachers can manage course codes" ON public.course_codes IS
  'Allows teachers to create, update, and delete discount codes for their own courses';
