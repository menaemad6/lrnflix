
-- Create table to track student call history
CREATE TABLE public.student_call_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  call_duration_minutes integer NOT NULL DEFAULT 0,
  call_started_at timestamp with time zone NOT NULL DEFAULT now(),
  call_ended_at timestamp with time zone,
  call_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_call_history ENABLE ROW LEVEL SECURITY;

-- Create policy for students to view their own call history
CREATE POLICY "Students can view their own call history" 
  ON public.student_call_history 
  FOR SELECT 
  USING (auth.uid() = student_id);

-- Create policy for students to insert their own call history
CREATE POLICY "Students can insert their own call history" 
  ON public.student_call_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = student_id);

-- Create policy for students to update their own call history
CREATE POLICY "Students can update their own call history" 
  ON public.student_call_history 
  FOR UPDATE 
  USING (auth.uid() = student_id);

-- Add default AI assistant settings if they don't exist
INSERT INTO public.ai_assistant_settings (setting_key, setting_value) 
VALUES ('daily_minutes_limit', '30') 
ON CONFLICT (setting_key) DO NOTHING;

-- Create index for better performance on date queries
CREATE INDEX idx_student_call_history_student_date ON public.student_call_history(student_id, call_date);
