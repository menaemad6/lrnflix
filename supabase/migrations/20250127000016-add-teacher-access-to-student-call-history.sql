-- Add RLS policy for teachers to view student call history for their courses
-- This allows teachers to see AI assistant usage data for students in their courses

-- Create policy for teachers to view student call history for their courses
CREATE POLICY "Teachers can view student call history for their courses" 
  ON public.student_call_history 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.courses c ON l.course_id = c.id
      WHERE l.id = lesson_id AND c.instructor_id = auth.uid()
    )
  );

-- Add index for better performance on teacher queries
CREATE INDEX IF NOT EXISTS idx_student_call_history_lesson_id ON public.student_call_history(lesson_id);
