
-- Add order_index column to quizzes table for proper ordering
ALTER TABLE public.quizzes 
ADD COLUMN order_index integer NOT NULL DEFAULT 0;

-- Create a function to set the order_index for new quizzes
CREATE OR REPLACE FUNCTION public.set_quiz_order_index()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.order_index IS NULL OR NEW.order_index = 0 THEN
    SELECT COALESCE(MAX(order_index), 0) + 1 
    INTO NEW.order_index 
    FROM quizzes 
    WHERE course_id = NEW.course_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger to automatically set order_index for new quizzes
CREATE TRIGGER set_quiz_order_index_trigger
  BEFORE INSERT ON public.quizzes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_quiz_order_index();

-- Update existing quizzes to have proper order_index based on creation date
UPDATE public.quizzes 
SET order_index = subquery.row_number
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY course_id ORDER BY created_at) as row_number
  FROM public.quizzes
) as subquery
WHERE quizzes.id = subquery.id;
