-- Fix the enroll_chapter_with_payment function to properly set source = 'chapter_purchase'
CREATE OR REPLACE FUNCTION public.enroll_chapter_with_payment(p_chapter_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
  
  -- Enroll in courses from chapter_objects (if object_type is 'course') with source = 'chapter_purchase'
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
$function$;
