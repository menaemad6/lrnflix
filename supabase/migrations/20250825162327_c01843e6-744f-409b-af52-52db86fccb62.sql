
-- Create attachments table
CREATE TABLE public.attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL,
  chapter_id UUID NULL,
  title TEXT NOT NULL,
  description TEXT NULL,
  attachment_url TEXT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  view_limit INTEGER NULL,
  device_limit INTEGER NULL,
  size BIGINT NULL,
  type TEXT NOT NULL DEFAULT 'pdf',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add trigger for order_index
CREATE OR REPLACE FUNCTION public.set_attachment_order_index()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_index IS NULL OR NEW.order_index = 0 THEN
    SELECT COALESCE(MAX(order_index), 0) + 1 
    INTO NEW.order_index 
    FROM attachments 
    WHERE course_id = NEW.course_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_attachment_order_index_trigger
  BEFORE INSERT ON public.attachments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_attachment_order_index();

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at_attachments
  BEFORE UPDATE ON public.attachments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view attachments for published courses
CREATE POLICY "Anyone can view attachments for published courses"
  ON public.attachments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = attachments.course_id 
      AND courses.status = 'published'
    ) OR get_current_user_role() = ANY(ARRAY['teacher'::user_role, 'admin'::user_role])
  );

-- Teachers can manage attachments for their courses
CREATE POLICY "Teachers can manage attachments for their courses"
  ON public.attachments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = attachments.course_id 
      AND courses.instructor_id = auth.uid()
    ) OR get_current_user_role() = 'admin'::user_role
  );

-- Teachers can reorder attachments in their courses
CREATE POLICY "Teachers can reorder attachments in their courses"
  ON public.attachments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = attachments.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );
