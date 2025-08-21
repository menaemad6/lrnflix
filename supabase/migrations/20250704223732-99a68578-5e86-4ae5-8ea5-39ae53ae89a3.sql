
-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  allow_student_answers BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'resolved'))
);

-- Create answers table
CREATE TABLE public.question_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_accepted BOOLEAN DEFAULT false
);

-- Add Row Level Security (RLS)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for questions
CREATE POLICY "Anyone can view questions" 
  ON public.questions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Students can create questions" 
  ON public.questions 
  FOR INSERT 
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own questions" 
  ON public.questions 
  FOR UPDATE 
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers and admins can update any question" 
  ON public.questions 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Students can delete their own questions" 
  ON public.questions 
  FOR DELETE 
  USING (auth.uid() = student_id);

-- RLS Policies for answers
CREATE POLICY "Anyone can view answers" 
  ON public.question_answers 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create answers based on question settings" 
  ON public.question_answers 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.questions 
      WHERE id = question_id 
      AND (
        allow_student_answers = true 
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('teacher', 'admin')
      )
    )
  );

CREATE POLICY "Users can update their own answers" 
  ON public.question_answers 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own answers" 
  ON public.question_answers 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_questions_updated_at 
  BEFORE UPDATE ON public.questions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_answers_updated_at 
  BEFORE UPDATE ON public.question_answers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
