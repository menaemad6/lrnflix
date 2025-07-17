
-- Enable RLS on tables if not already enabled
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- Add missing policies for groups table
CREATE POLICY "Users can update their own groups" 
  ON public.groups 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Add policies for profiles table to allow fetching member profiles
CREATE POLICY "Users can view profiles of group members" 
  ON public.profiles 
  FOR SELECT 
  USING (
    auth.uid() = id OR 
    EXISTS(
      SELECT 1 FROM public.group_members gm
      JOIN public.groups g ON g.id = gm.group_id
      WHERE gm.student_id = profiles.id 
      AND (g.created_by = auth.uid() OR gm.student_id = auth.uid())
    )
  );

-- Allow users to view their own profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);
