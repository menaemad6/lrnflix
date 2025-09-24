
-- Add wallet field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN wallet INTEGER NOT NULL DEFAULT 0;

-- Add price field to courses table  
ALTER TABLE public.courses 
ADD COLUMN price INTEGER NOT NULL DEFAULT 0;

-- Create transactions table to track wallet transactions
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'course_purchase', 'refund')),
  description TEXT,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on wallet_transactions
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for wallet_transactions
CREATE POLICY "Users can view their own transactions" 
  ON public.wallet_transactions 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own transactions" 
  ON public.wallet_transactions 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Create function to handle course enrollment with payment
CREATE OR REPLACE FUNCTION public.enroll_with_payment(
  p_course_id UUID,
  p_discount_code TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  course_record RECORD;
  user_profile RECORD;
  discount_record RECORD;
  final_price INTEGER;
  discount_amount INTEGER := 0;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User profile not found');
  END IF;
  
  -- Get course details
  SELECT * INTO course_record 
  FROM public.courses 
  WHERE id = p_course_id AND status = 'published';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Course not found or not published');
  END IF;
  
  -- Check if already enrolled
  IF EXISTS(SELECT 1 FROM public.enrollments WHERE course_id = p_course_id AND student_id = auth.uid()) THEN
    RETURN json_build_object('success', false, 'error', 'Already enrolled in this course');
  END IF;
  
  final_price := course_record.price;
  
  -- Apply discount code if provided
  IF p_discount_code IS NOT NULL THEN
    SELECT * INTO discount_record 
    FROM public.course_codes 
    WHERE code = p_discount_code 
      AND course_id = p_course_id 
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
      AND (max_uses IS NULL OR current_uses < max_uses);
    
    IF FOUND THEN
      -- Calculate discount
      IF discount_record.discount_percentage IS NOT NULL THEN
        discount_amount := (course_record.price * discount_record.discount_percentage) / 100;
      ELSIF discount_record.discount_amount IS NOT NULL THEN
        discount_amount := discount_record.discount_amount;
      END IF;
      
      final_price := GREATEST(0, course_record.price - discount_amount);
      
      -- Update code usage
      UPDATE public.course_codes 
      SET current_uses = current_uses + 1 
      WHERE id = discount_record.id;
    ELSE
      RETURN json_build_object('success', false, 'error', 'Invalid or expired discount code');
    END IF;
  END IF;
  
  -- Check if user has enough money
  IF user_profile.wallet < final_price THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Insufficient funds', 
      'required', final_price,
      'available', user_profile.wallet
    );
  END IF;
  
  -- Deduct money from wallet
  UPDATE public.profiles 
  SET wallet = wallet - final_price 
  WHERE id = auth.uid();
  
  -- Create enrollment
  INSERT INTO public.enrollments (course_id, student_id, source) 
  VALUES (p_course_id, auth.uid(), 'wallet');
  
  -- Record transaction
  INSERT INTO public.wallet_transactions (
    user_id, 
    amount, 
    transaction_type, 
    description, 
    course_id
  ) VALUES (
    auth.uid(), 
    -final_price, 
    'course_purchase', 
    'Enrolled in course: ' || course_record.title, 
    p_course_id
  );
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Successfully enrolled in course',
    'amount_paid', final_price,
    'discount_applied', discount_amount
  );
END;
$$;

-- Create function to add money to wallet (for testing/admin purposes)
CREATE OR REPLACE FUNCTION public.add_wallet_funds(
  p_amount INTEGER,
  p_description TEXT DEFAULT 'Wallet top-up'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add money to wallet
  UPDATE public.profiles 
  SET wallet = wallet + p_amount 
  WHERE id = auth.uid();
  
  -- Record transaction
  INSERT INTO public.wallet_transactions (
    user_id, 
    amount, 
    transaction_type, 
    description
  ) VALUES (
    auth.uid(), 
    p_amount, 
    'credit', 
    p_description
  );
  
  RETURN json_build_object('success', true, 'message', 'Funds added successfully');
END;
$$;
