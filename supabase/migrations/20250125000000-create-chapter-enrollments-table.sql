-- Create the missing chapter_enrollments table
CREATE TABLE public.chapter_enrollments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(chapter_id, student_id)
);

-- Enable RLS on chapter_enrollments
ALTER TABLE public.chapter_enrollments ENABLE ROW LEVEL SECURITY;




CREATE POLICY "System can insert chapter enrollments" 
ON public.chapter_enrollments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update chapter enrollments" 
ON public.chapter_enrollments 
FOR UPDATE 
USING (true);

CREATE POLICY "System can delete chapter enrollments" 
ON public.chapter_enrollments 
FOR DELETE 
USING (true);

-- Create index for better performance
CREATE INDEX idx_chapter_enrollments_chapter_id ON public.chapter_enrollments(chapter_id);
CREATE INDEX idx_chapter_enrollments_student_id ON public.chapter_enrollments(student_id);
CREATE INDEX idx_chapter_enrollments_enrolled_at ON public.chapter_enrollments(enrolled_at);
