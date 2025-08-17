
-- Create a table for teacher schedule tasks
CREATE TABLE public.teacher_schedule_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed')),
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_hours INTEGER,
  tags TEXT[],
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  order_index INTEGER NOT NULL DEFAULT 0
);

-- Add Row Level Security (RLS)
ALTER TABLE public.teacher_schedule_tasks ENABLE ROW LEVEL SECURITY;

-- Create policy that allows teachers to manage their own tasks
CREATE POLICY "Teachers can manage their own schedule tasks" 
  ON public.teacher_schedule_tasks 
  FOR ALL 
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_teacher_schedule_tasks_updated_at
  BEFORE UPDATE ON public.teacher_schedule_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for better performance
CREATE INDEX idx_teacher_schedule_tasks_teacher_id ON public.teacher_schedule_tasks(teacher_id);
CREATE INDEX idx_teacher_schedule_tasks_status ON public.teacher_schedule_tasks(status);
