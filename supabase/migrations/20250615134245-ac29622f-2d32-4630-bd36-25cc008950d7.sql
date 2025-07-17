
-- Add minutes column to profiles table for AI assistant usage tracking
ALTER TABLE public.profiles 
ADD COLUMN minutes INTEGER NOT NULL DEFAULT 0;

-- Add daily_free_minutes_used column to track daily usage
ALTER TABLE public.profiles 
ADD COLUMN daily_free_minutes_used INTEGER NOT NULL DEFAULT 0;

-- Add last_free_minutes_reset date to track when to reset daily free minutes
ALTER TABLE public.profiles 
ADD COLUMN last_free_minutes_reset DATE DEFAULT CURRENT_DATE;

-- Create a table to track minute purchases and usage
CREATE TABLE public.minute_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive for purchase, negative for usage
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'daily_reset')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on minute_transactions
ALTER TABLE public.minute_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for minute_transactions
CREATE POLICY "Users can view their own minute transactions" 
  ON public.minute_transactions 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own minute transactions" 
  ON public.minute_transactions 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Function to purchase minutes with wallet credits
CREATE OR REPLACE FUNCTION public.purchase_minutes(
  p_minutes INTEGER,
  p_cost_per_minute INTEGER DEFAULT 1 -- 1 credit per minute by default
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile RECORD;
  total_cost INTEGER;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User profile not found');
  END IF;
  
  total_cost := p_minutes * p_cost_per_minute;
  
  -- Check if user has enough credits
  IF user_profile.wallet < total_cost THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Insufficient credits', 
      'required', total_cost,
      'available', user_profile.wallet
    );
  END IF;
  
  -- Deduct credits from wallet
  UPDATE public.profiles 
  SET wallet = wallet - total_cost,
      minutes = minutes + p_minutes
  WHERE id = auth.uid();
  
  -- Record wallet transaction
  INSERT INTO public.wallet_transactions (
    user_id, 
    amount, 
    transaction_type, 
    description
  ) VALUES (
    auth.uid(), 
    -total_cost, 
    'debit', 
    'Purchased ' || p_minutes || ' assistant minutes'
  );
  
  -- Record minute transaction
  INSERT INTO public.minute_transactions (
    user_id, 
    amount, 
    transaction_type, 
    description
  ) VALUES (
    auth.uid(), 
    p_minutes, 
    'purchase', 
    'Purchased ' || p_minutes || ' minutes for ' || total_cost || ' credits'
  );
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Minutes purchased successfully',
    'minutes_purchased', p_minutes,
    'cost', total_cost
  );
END;
$$;
