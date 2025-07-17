
-- Create table for storing Google OAuth tokens per teacher
CREATE TABLE public.google_oauth_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create table for storing live lectures/meetings
CREATE TABLE public.live_lectures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  google_event_id TEXT,
  meet_link TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.google_oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_lectures ENABLE ROW LEVEL SECURITY;

-- RLS policies for google_oauth_tokens
CREATE POLICY "Users can manage their own OAuth tokens" 
  ON public.google_oauth_tokens 
  FOR ALL 
  USING (auth.uid() = user_id);

-- RLS policies for live_lectures
CREATE POLICY "Teachers can manage their course lectures" 
  ON public.live_lectures 
  FOR ALL 
  USING (
    auth.uid() = teacher_id OR 
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = live_lectures.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Students can view lectures for enrolled courses" 
  ON public.live_lectures 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments 
      WHERE enrollments.course_id = live_lectures.course_id 
      AND enrollments.student_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX idx_google_oauth_tokens_user_id ON public.google_oauth_tokens(user_id);
CREATE INDEX idx_live_lectures_course_id ON public.live_lectures(course_id);
CREATE INDEX idx_live_lectures_teacher_id ON public.live_lectures(teacher_id);
CREATE INDEX idx_live_lectures_start_time ON public.live_lectures(start_time);
