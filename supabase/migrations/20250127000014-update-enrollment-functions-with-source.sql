-- Update enrollment functions to include source tracking

-- Update the enroll_with_payment function to set source = 'wallet'
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
  
  -- Initialize final price
  final_price := course_record.price;
  
  -- Apply discount if provided
  IF p_discount_code IS NOT NULL AND p_discount_code != '' THEN
    SELECT * INTO discount_record 
    FROM public.course_codes 
    WHERE course_id = p_course_id 
      AND code = p_discount_code 
      AND status = 'active'
      AND (usage_limit IS NULL OR usage_count < usage_limit);
    
    IF FOUND THEN
      IF discount_record.discount_percentage IS NOT NULL THEN
        discount_amount := ROUND((course_record.price * discount_record.discount_percentage) / 100);
      ELSIF discount_record.discount_amount IS NOT NULL THEN
        discount_amount := discount_record.discount_amount;
      END IF;
      
      final_price := GREATEST(0, course_record.price - discount_amount);
      
      -- Update usage count
      UPDATE public.course_codes 
      SET usage_count = usage_count + 1 
      WHERE id = discount_record.id;
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
  
  -- Create enrollment with source = 'wallet'
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

-- Update the enroll_chapter_with_payment function to set source = 'chapter_purchase'
CREATE OR REPLACE FUNCTION public.enroll_chapter_with_payment(p_chapter_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  chapter_record RECORD;
  user_profile RECORD;
  course_record RECORD;
  course_object RECORD;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User profile not found');
  END IF;
  
  -- Get chapter details
  SELECT * INTO chapter_record 
  FROM public.chapters 
  WHERE id = p_chapter_id AND status = 'published';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Chapter not found or not published');
  END IF;
  
  -- Check if already enrolled in chapter
  IF EXISTS(SELECT 1 FROM public.chapter_enrollments WHERE chapter_id = p_chapter_id AND student_id = auth.uid()) THEN
    RETURN json_build_object('success', false, 'error', 'Already enrolled in this chapter');
  END IF;
  
  -- Check if user has enough money
  IF user_profile.wallet < chapter_record.price THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Insufficient funds', 
      'required', chapter_record.price,
      'available', user_profile.wallet
    );
  END IF;
  
  -- Deduct money from wallet
  UPDATE public.profiles 
  SET wallet = wallet - chapter_record.price 
  WHERE id = auth.uid();
  
  -- Create chapter enrollment
  INSERT INTO public.chapter_enrollments (chapter_id, student_id) 
  VALUES (p_chapter_id, auth.uid());
  
  -- Enroll in all courses in the chapter with source = 'chapter_purchase'
  FOR course_record IN 
    SELECT id FROM public.courses 
    WHERE chapter_id = p_chapter_id AND status = 'published'
  LOOP
    -- Check if not already enrolled in course
    IF NOT EXISTS(SELECT 1 FROM public.enrollments WHERE course_id = course_record.id AND student_id = auth.uid()) THEN
      INSERT INTO public.enrollments (course_id, student_id, source) 
      VALUES (course_record.id, auth.uid(), 'chapter_purchase');
    END IF;
  END LOOP;
  
  -- Enroll in courses from chapter_objects (if object_type is 'course')
  FOR course_object IN 
    SELECT object_id FROM public.chapter_objects 
    WHERE chapter_id = p_chapter_id AND object_type = 'course' AND object_id IS NOT NULL
  LOOP
    -- Check if course exists and is published
    IF EXISTS(SELECT 1 FROM public.courses WHERE id = course_object.object_id AND status = 'published') THEN
      -- Check if not already enrolled in course
      IF NOT EXISTS(SELECT 1 FROM public.enrollments WHERE course_id = course_object.object_id AND student_id = auth.uid()) THEN
        INSERT INTO public.enrollments (course_id, student_id, source) 
        VALUES (course_object.object_id, auth.uid(), 'chapter_purchase');
      END IF;
    END IF;
  END LOOP;
  
  -- Record transaction
  INSERT INTO public.wallet_transactions (
    user_id, 
    amount, 
    transaction_type, 
    description
  ) VALUES (
    auth.uid(), 
    -chapter_record.price, 
    'chapter_purchase', 
    'Enrolled in chapter: ' || chapter_record.title
  );
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Successfully enrolled in chapter',
    'amount_paid', chapter_record.price
  );
END;
$$;
