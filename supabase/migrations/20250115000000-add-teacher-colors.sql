-- Add colors column to teachers table for tenant customization
ALTER TABLE public.teachers 
ADD COLUMN colors JSONB DEFAULT '{
  "primary": "#10b981",
  "secondary": null,
  "accent": null
}'::jsonb;

-- Add comment explaining the colors column
COMMENT ON COLUMN public.teachers.colors IS 'JSONB object containing custom color scheme for tenant customization. Format: {"primary": "#hex", "secondary": "#hex", "accent": "#hex"}. If secondary/accent are null, they will be calculated automatically from primary.';

-- Create index for better performance on colors queries
CREATE INDEX idx_teachers_colors ON public.teachers USING GIN (colors);

-- Update existing teachers to have default colors
UPDATE public.teachers 
SET colors = '{"primary": "#10b981", "secondary": null, "accent": null}'::jsonb 
WHERE colors IS NULL;
