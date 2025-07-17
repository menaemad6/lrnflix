
-- Add a trigger to automatically set order_index for new lessons
CREATE OR REPLACE FUNCTION set_lesson_order_index()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_index IS NULL OR NEW.order_index = 0 THEN
    SELECT COALESCE(MAX(order_index), 0) + 1 
    INTO NEW.order_index 
    FROM lessons 
    WHERE course_id = NEW.course_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new lessons
DROP TRIGGER IF EXISTS trigger_set_lesson_order_index ON lessons;
CREATE TRIGGER trigger_set_lesson_order_index
  BEFORE INSERT ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION set_lesson_order_index();

-- Function to reorder lessons
CREATE OR REPLACE FUNCTION reorder_lessons(
  p_course_id UUID,
  p_lesson_orders JSONB
) RETURNS VOID AS $$
DECLARE
  lesson_order JSONB;
BEGIN
  -- Loop through the lesson orders and update each lesson
  FOR lesson_order IN SELECT * FROM jsonb_array_elements(p_lesson_orders)
  LOOP
    UPDATE lessons 
    SET order_index = (lesson_order->>'order_index')::INTEGER
    WHERE id = (lesson_order->>'id')::UUID 
    AND course_id = p_course_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policy for the reorder function
CREATE POLICY "Teachers can reorder lessons in their courses" 
  ON lessons 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = lessons.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );
