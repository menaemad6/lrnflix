-- Add source column to enrollments table to track enrollment method
ALTER TABLE public.enrollments 
ADD COLUMN source TEXT NOT NULL DEFAULT 'unknown';

-- Add check constraint to ensure valid source values
ALTER TABLE public.enrollments 
ADD CONSTRAINT enrollments_source_check 
CHECK (source IN ('wallet', 'invoice', 'chapter_purchase', 'enrollment_code', 'direct', 'unknown'));

-- Create index for better performance on source queries
CREATE INDEX idx_enrollments_source ON public.enrollments(source);

-- Update existing enrollments to have a default source
-- This is a best-effort update since we can't determine the original source
UPDATE public.enrollments 
SET source = 'unknown' 
WHERE source = 'unknown';
