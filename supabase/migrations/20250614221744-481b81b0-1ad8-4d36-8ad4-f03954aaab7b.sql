
-- Drop the problematic policies first
DROP POLICY IF EXISTS "Teachers can view their own groups" ON public.groups;
DROP POLICY IF EXISTS "Students can view groups they belong to" ON public.groups;
DROP POLICY IF EXISTS "Teachers can view members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Teachers can add members to their groups" ON public.group_members;
DROP POLICY IF EXISTS "Teachers can remove members from their groups" ON public.group_members;
DROP POLICY IF EXISTS "Group members can view messages in their groups" ON public.group_messages;
DROP POLICY IF EXISTS "Group members can send messages in their groups" ON public.group_messages;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.is_group_creator(group_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.groups 
    WHERE groups.id = $1 AND created_by = $2
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_member(group_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = $1 AND student_id = $2
  );
$$;

-- Create safe policies using the security definer functions
CREATE POLICY "Teachers can view their own groups" 
  ON public.groups 
  FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Students can view groups they belong to" 
  ON public.groups 
  FOR SELECT 
  USING (
    public.is_group_member(id, auth.uid()) OR is_public = true
  );

CREATE POLICY "Teachers can view members of their groups" 
  ON public.group_members 
  FOR SELECT 
  USING (public.is_group_creator(group_id, auth.uid()));

CREATE POLICY "Teachers can add members to their groups" 
  ON public.group_members 
  FOR INSERT 
  WITH CHECK (public.is_group_creator(group_id, auth.uid()));

CREATE POLICY "Teachers can remove members from their groups" 
  ON public.group_members 
  FOR DELETE 
  USING (public.is_group_creator(group_id, auth.uid()));

CREATE POLICY "Group members can view messages in their groups" 
  ON public.group_messages 
  FOR SELECT 
  USING (
    public.is_group_member(group_id, auth.uid()) OR 
    public.is_group_creator(group_id, auth.uid())
  );

CREATE POLICY "Group members can send messages in their groups" 
  ON public.group_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND (
      public.is_group_member(group_id, auth.uid()) OR 
      public.is_group_creator(group_id, auth.uid())
    )
  );
