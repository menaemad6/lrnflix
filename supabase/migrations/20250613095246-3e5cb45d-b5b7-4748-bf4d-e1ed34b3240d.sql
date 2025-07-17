
-- Create lesson_views table to track when students view lessons
CREATE TABLE public.lesson_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL,
  student_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  view_duration INTEGER DEFAULT 0, -- in seconds
  completed BOOLEAN DEFAULT false
);

-- Add RLS policies for lesson_views
ALTER TABLE public.lesson_views ENABLE ROW LEVEL SECURITY;

-- Students can view their own lesson views
CREATE POLICY "Students can view their own lesson views" 
  ON public.lesson_views 
  FOR SELECT 
  USING (auth.uid() = student_id);

-- Students can insert their own lesson views
CREATE POLICY "Students can insert their own lesson views" 
  ON public.lesson_views 
  FOR INSERT 
  WITH CHECK (auth.uid() = student_id);

-- Teachers can view lesson views for their courses
CREATE POLICY "Teachers can view lesson views for their courses" 
  ON public.lesson_views 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.courses c ON l.course_id = c.id
      WHERE l.id = lesson_id AND c.instructor_id = auth.uid()
    )
  );

-- Add view_limit column to lessons table
ALTER TABLE public.lessons 
ADD COLUMN view_limit INTEGER DEFAULT NULL;

-- Add indexes for better performance
CREATE INDEX idx_lesson_views_lesson_id ON public.lesson_views(lesson_id);
CREATE INDEX idx_lesson_views_student_id ON public.lesson_views(student_id);
CREATE INDEX idx_lesson_views_viewed_at ON public.lesson_views(viewed_at);
