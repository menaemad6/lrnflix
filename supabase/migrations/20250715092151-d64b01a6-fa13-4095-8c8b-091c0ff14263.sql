
-- Create teachers table for multi-tenant LMS system
CREATE TABLE public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT,
  specialization TEXT,
  experience_years INTEGER,
  profile_image_url TEXT,
  cover_image_url TEXT,
  website_url TEXT,
  social_links JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for teachers table
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Teachers can manage their own profile
CREATE POLICY "Teachers can manage their own profile" 
  ON public.teachers 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Anyone can view active teacher profiles
CREATE POLICY "Anyone can view active teacher profiles" 
  ON public.teachers 
  FOR SELECT 
  USING (is_active = true);

-- Add trigger for updated_at
CREATE TRIGGER update_teachers_updated_at
  BEFORE UPDATE ON public.teachers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add index for better performance on slug lookups
CREATE INDEX idx_teachers_slug ON public.teachers(slug);
CREATE INDEX idx_teachers_user_id ON public.teachers(user_id);
