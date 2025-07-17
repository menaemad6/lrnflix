
-- Create lesson_content table for transcriptions and summaries
CREATE TABLE public.lesson_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  transcription TEXT,
  summary TEXT,
  is_transcribed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lesson_id)
);

-- Add RLS policies for lesson_content
ALTER TABLE public.lesson_content ENABLE ROW LEVEL SECURITY;

-- Teachers can manage content for their own course lessons
CREATE POLICY "Teachers can manage lesson content for their courses" 
  ON public.lesson_content 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.courses c ON l.course_id = c.id
      WHERE l.id = lesson_id AND c.instructor_id = auth.uid()
    )
  );

-- Students can view lesson content for enrolled courses
CREATE POLICY "Students can view lesson content for enrolled courses" 
  ON public.lesson_content 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.courses c ON l.course_id = c.id
      JOIN public.enrollments e ON c.id = e.course_id
      WHERE l.id = lesson_id AND e.student_id = auth.uid()
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_lesson_content_updated_at
  BEFORE UPDATE ON public.lesson_content
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add indexes for better performance
CREATE INDEX idx_lesson_content_lesson_id ON public.lesson_content(lesson_id);
CREATE INDEX idx_lesson_content_transcribed ON public.lesson_content(is_transcribed);
