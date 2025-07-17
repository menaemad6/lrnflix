-- Add instructor_id to chapters table
ALTER TABLE public.chapters 
ADD COLUMN instructor_id UUID REFERENCES public.profiles(id);

-- Create chapter_objects table (same structure as group_objects)
CREATE TABLE public.chapter_objects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    object_id UUID NULL,
    object_data JSONB NULL,
    shared_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
    object_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NULL
);

-- Enable RLS on chapter_objects
ALTER TABLE public.chapter_objects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chapter_objects (similar to group_objects)
CREATE POLICY "Instructors can share objects" 
ON public.chapter_objects 
FOR INSERT 
WITH CHECK (
    shared_by = auth.uid() AND 
    EXISTS (
        SELECT 1 FROM public.chapters 
        WHERE chapters.id = chapter_objects.chapter_id 
        AND chapters.instructor_id = auth.uid()
    )
);

CREATE POLICY "Students can view chapter objects for enrolled chapters" 
ON public.chapter_objects 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.chapter_enrollments 
        WHERE chapter_enrollments.chapter_id = chapter_objects.chapter_id 
        AND chapter_enrollments.student_id = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM public.chapters 
        WHERE chapters.id = chapter_objects.chapter_id 
        AND chapters.instructor_id = auth.uid()
    )
);

CREATE POLICY "Instructors can update their chapter objects" 
ON public.chapter_objects 
FOR UPDATE 
USING (
    shared_by = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.chapters 
        WHERE chapters.id = chapter_objects.chapter_id 
        AND chapters.instructor_id = auth.uid()
    )
);

CREATE POLICY "Instructors can delete their chapter objects" 
ON public.chapter_objects 
FOR DELETE 
USING (
    shared_by = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.chapters 
        WHERE chapters.id = chapter_objects.chapter_id 
        AND chapters.instructor_id = auth.uid()
    )
);

-- Update the enroll_chapter_with_payment function to handle course auto-enrollment
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
  
  -- Enroll in all courses in the chapter
  FOR course_record IN 
    SELECT id FROM public.courses 
    WHERE chapter_id = p_chapter_id AND status = 'published'
  LOOP
    -- Check if not already enrolled in course
    IF NOT EXISTS(SELECT 1 FROM public.enrollments WHERE course_id = course_record.id AND student_id = auth.uid()) THEN
      INSERT INTO public.enrollments (course_id, student_id) 
      VALUES (course_record.id, auth.uid());
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
        INSERT INTO public.enrollments (course_id, student_id) 
        VALUES (course_object.object_id, auth.uid());
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