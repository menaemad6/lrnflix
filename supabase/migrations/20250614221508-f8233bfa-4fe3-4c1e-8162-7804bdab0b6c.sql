
-- Enable RLS on groups table if not already enabled
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Policy for teachers to view groups they created
CREATE POLICY "Teachers can view their own groups" 
  ON public.groups 
  FOR SELECT 
  USING (auth.uid() = created_by);

-- Policy for teachers to create groups
CREATE POLICY "Teachers can create groups" 
  ON public.groups 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Policy for teachers to update their own groups
CREATE POLICY "Teachers can update their own groups" 
  ON public.groups 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Policy for teachers to delete their own groups
CREATE POLICY "Teachers can delete their own groups" 
  ON public.groups 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- Enable RLS on group_members table
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Policy for teachers to view members of their groups
CREATE POLICY "Teachers can view members of their groups" 
  ON public.group_members 
  FOR SELECT 
  USING (EXISTS(
    SELECT 1 FROM public.groups 
    WHERE groups.id = group_members.group_id 
    AND groups.created_by = auth.uid()
  ));

-- Policy for teachers to add members to their groups
CREATE POLICY "Teachers can add members to their groups" 
  ON public.group_members 
  FOR INSERT 
  WITH CHECK (EXISTS(
    SELECT 1 FROM public.groups 
    WHERE groups.id = group_members.group_id 
    AND groups.created_by = auth.uid()
  ));

-- Policy for teachers to remove members from their groups
CREATE POLICY "Teachers can remove members from their groups" 
  ON public.group_members 
  FOR DELETE 
  USING (EXISTS(
    SELECT 1 FROM public.groups 
    WHERE groups.id = group_members.group_id 
    AND groups.created_by = auth.uid()
  ));

-- Policy for students to view groups they're members of
CREATE POLICY "Students can view groups they belong to" 
  ON public.groups 
  FOR SELECT 
  USING (
    id IN (
      SELECT group_id FROM public.group_members 
      WHERE student_id = auth.uid()
    ) OR is_public = true
  );

-- Policy for students to view their own memberships
CREATE POLICY "Students can view their own group memberships" 
  ON public.group_members 
  FOR SELECT 
  USING (student_id = auth.uid());

-- Enable RLS on group_messages table
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- Policy for group members to view messages in their groups
CREATE POLICY "Group members can view messages in their groups" 
  ON public.group_messages 
  FOR SELECT 
  USING (
    EXISTS(
      SELECT 1 FROM public.group_members 
      WHERE group_members.group_id = group_messages.group_id 
      AND group_members.student_id = auth.uid()
    ) OR 
    EXISTS(
      SELECT 1 FROM public.groups 
      WHERE groups.id = group_messages.group_id 
      AND groups.created_by = auth.uid()
    )
  );

-- Policy for group members to send messages in their groups
CREATE POLICY "Group members can send messages in their groups" 
  ON public.group_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND (
      EXISTS(
        SELECT 1 FROM public.group_members 
        WHERE group_members.group_id = group_messages.group_id 
        AND group_members.student_id = auth.uid()
      ) OR 
      EXISTS(
        SELECT 1 FROM public.groups 
        WHERE groups.id = group_messages.group_id 
        AND groups.created_by = auth.uid()
      )
    )
  );
