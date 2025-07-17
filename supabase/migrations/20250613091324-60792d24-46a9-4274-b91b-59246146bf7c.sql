
-- Create wallet codes table
CREATE TABLE public.wallet_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  created_by UUID NOT NULL,
  used_by UUID,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for wallet codes
ALTER TABLE public.wallet_codes ENABLE ROW LEVEL SECURITY;

-- Teachers can view their own codes
CREATE POLICY "Teachers can view their own codes" 
  ON public.wallet_codes 
  FOR SELECT 
  USING (auth.uid() = created_by);

-- Teachers can create codes
CREATE POLICY "Teachers can create codes" 
  ON public.wallet_codes 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Teachers can update their own codes
CREATE POLICY "Teachers can update their own codes" 
  ON public.wallet_codes 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Students can view codes they used (for history)
CREATE POLICY "Students can view used codes" 
  ON public.wallet_codes 
  FOR SELECT 
  USING (auth.uid() = used_by);

-- Function to generate unique wallet code
CREATE OR REPLACE FUNCTION public.generate_wallet_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    code TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        code := upper(substring(md5(random()::text) from 1 for 12));
        SELECT EXISTS(SELECT 1 FROM public.wallet_codes WHERE code = code) INTO exists_check;
        IF NOT exists_check THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$;

-- Function to redeem wallet code
CREATE OR REPLACE FUNCTION public.redeem_wallet_code(p_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    code_record RECORD;
    user_profile RECORD;
BEGIN
    -- Get user profile
    SELECT * INTO user_profile 
    FROM public.profiles 
    WHERE id = auth.uid();
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'User profile not found');
    END IF;
    
    -- Find the code
    SELECT * INTO code_record 
    FROM public.wallet_codes 
    WHERE code = p_code 
      AND is_active = true
      AND used_by IS NULL
      AND (expires_at IS NULL OR expires_at > now());
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Invalid, expired, or already used code');
    END IF;
    
    -- Mark code as used
    UPDATE public.wallet_codes 
    SET used_by = auth.uid(), used_at = now(), is_active = false
    WHERE id = code_record.id;
    
    -- Add money to wallet
    UPDATE public.profiles 
    SET wallet = wallet + code_record.amount 
    WHERE id = auth.uid();
    
    -- Record transaction
    INSERT INTO public.wallet_transactions (
        user_id, 
        amount, 
        transaction_type, 
        description
    ) VALUES (
        auth.uid(), 
        code_record.amount, 
        'code_redemption', 
        'Redeemed wallet code: ' || p_code
    );
    
    RETURN json_build_object(
        'success', true, 
        'amount', code_record.amount,
        'message', 'Code redeemed successfully'
    );
END;
$$;

-- Add RLS policies for quizzes (check if they exist first)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quizzes' AND policyname = 'Everyone can view quizzes') THEN
        ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Everyone can view quizzes" 
          ON public.quizzes 
          FOR SELECT 
          USING (true);
    END IF;
END $$;

-- Teachers can create quizzes for their courses
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quizzes' AND policyname = 'Teachers can create quizzes') THEN
        CREATE POLICY "Teachers can create quizzes" 
          ON public.quizzes 
          FOR INSERT 
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM public.courses 
              WHERE courses.id = course_id 
              AND courses.instructor_id = auth.uid()
            )
          );
    END IF;
END $$;

-- Teachers can update their course quizzes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quizzes' AND policyname = 'Teachers can update their quizzes') THEN
        CREATE POLICY "Teachers can update their quizzes" 
          ON public.quizzes 
          FOR UPDATE 
          USING (
            EXISTS (
              SELECT 1 FROM public.courses 
              WHERE courses.id = course_id 
              AND courses.instructor_id = auth.uid()
            )
          );
    END IF;
END $$;

-- Teachers can delete their course quizzes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quizzes' AND policyname = 'Teachers can delete their quizzes') THEN
        CREATE POLICY "Teachers can delete their quizzes" 
          ON public.quizzes 
          FOR DELETE 
          USING (
            EXISTS (
              SELECT 1 FROM public.courses 
              WHERE courses.id = course_id 
              AND courses.instructor_id = auth.uid()
            )
          );
    END IF;
END $$;

-- Add RLS for quiz questions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quiz_questions' AND policyname = 'Everyone can view quiz questions') THEN
        ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Everyone can view quiz questions" 
          ON public.quiz_questions 
          FOR SELECT 
          USING (true);
    END IF;
END $$;

-- Teachers can manage quiz questions for their quizzes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quiz_questions' AND policyname = 'Teachers can manage quiz questions') THEN
        CREATE POLICY "Teachers can manage quiz questions" 
          ON public.quiz_questions 
          FOR ALL 
          USING (
            EXISTS (
              SELECT 1 FROM public.quizzes 
              JOIN public.courses ON courses.id = quizzes.course_id
              WHERE quizzes.id = quiz_id 
              AND courses.instructor_id = auth.uid()
            )
          );
    END IF;
END $$;

-- Add RLS for quiz attempts
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quiz_attempts' AND policyname = 'Students can view their own attempts') THEN
        ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Students can view their own attempts" 
          ON public.quiz_attempts 
          FOR SELECT 
          USING (auth.uid() = student_id);
    END IF;
END $$;

-- Students can create their own attempts
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quiz_attempts' AND policyname = 'Students can create attempts') THEN
        CREATE POLICY "Students can create attempts" 
          ON public.quiz_attempts 
          FOR INSERT 
          WITH CHECK (auth.uid() = student_id);
    END IF;
END $$;

-- Students can update their own attempts
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quiz_attempts' AND policyname = 'Students can update their own attempts') THEN
        CREATE POLICY "Students can update their own attempts" 
          ON public.quiz_attempts 
          FOR UPDATE 
          USING (auth.uid() = student_id);
    END IF;
END $$;

-- Teachers can view attempts for their course quizzes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quiz_attempts' AND policyname = 'Teachers can view quiz attempts') THEN
        CREATE POLICY "Teachers can view quiz attempts" 
          ON public.quiz_attempts 
          FOR SELECT 
          USING (
            EXISTS (
              SELECT 1 FROM public.quizzes 
              JOIN public.courses ON courses.id = quizzes.course_id
              WHERE quizzes.id = quiz_id 
              AND courses.instructor_id = auth.uid()
            )
          );
    END IF;
END $$;
