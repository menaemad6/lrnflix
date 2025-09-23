-- Update RLS policies to allow admin access

-- Add admin access to all tables that might need admin management

-- Update profiles policies for admin access
DROP POLICY IF EXISTS "Admin can manage all profiles" ON public.profiles;
CREATE POLICY "Admin can manage all profiles"
  ON public.profiles
  FOR ALL
  USING (get_current_user_role() = 'admin'::user_role);

-- Update invoices policies for admin access
DROP POLICY IF EXISTS "Admin can manage all invoices" ON public.invoices;
CREATE POLICY "Admin can manage all invoices"
  ON public.invoices
  FOR ALL
  USING (get_current_user_role() = 'admin'::user_role);

-- Update courses policies for admin access  
DROP POLICY IF EXISTS "Admin can manage all courses" ON public.courses;
CREATE POLICY "Admin can manage all courses"
  ON public.courses
  FOR ALL
  USING (get_current_user_role() = 'admin'::user_role);

-- Update enrollments policies for admin access
DROP POLICY IF EXISTS "Admin can manage all enrollments" ON public.enrollments;
CREATE POLICY "Admin can manage all enrollments"
  ON public.enrollments
  FOR ALL
  USING (get_current_user_role() = 'admin'::user_role);

-- Update chapters policies for admin access
DROP POLICY IF EXISTS "Admin can manage all chapters" ON public.chapters;
CREATE POLICY "Admin can manage all chapters"
  ON public.chapters
  FOR ALL
  USING (get_current_user_role() = 'admin'::user_role);

-- Update lessons policies for admin access
DROP POLICY IF EXISTS "Admin can manage all lessons" ON public.lessons;
CREATE POLICY "Admin can manage all lessons"
  ON public.lessons
  FOR ALL
  USING (get_current_user_role() = 'admin'::user_role);

-- Update quizzes policies for admin access
DROP POLICY IF EXISTS "Admin can manage all quizzes" ON public.quizzes;
CREATE POLICY "Admin can manage all quizzes"
  ON public.quizzes
  FOR ALL
  USING (get_current_user_role() = 'admin'::user_role);

-- Update attachments policies for admin access
DROP POLICY IF EXISTS "Admin can manage all attachments" ON public.attachments;
CREATE POLICY "Admin can manage all attachments"
  ON public.attachments
  FOR ALL
  USING (get_current_user_role() = 'admin'::user_role);

-- Update groups policies for admin access
DROP POLICY IF EXISTS "Admin can manage all groups" ON public.groups;
CREATE POLICY "Admin can manage all groups"
  ON public.groups
  FOR ALL
  USING (get_current_user_role() = 'admin'::user_role);

-- Update discussions policies for admin access
DROP POLICY IF EXISTS "Admin can manage all discussions" ON public.discussions;
CREATE POLICY "Admin can manage all discussions"
  ON public.discussions
  FOR ALL
  USING (get_current_user_role() = 'admin'::user_role);

-- Update wallet_transactions policies for admin access
DROP POLICY IF EXISTS "Admin can manage all wallet_transactions" ON public.wallet_transactions;
CREATE POLICY "Admin can manage all wallet_transactions"
  ON public.wallet_transactions
  FOR ALL
  USING (get_current_user_role() = 'admin'::user_role);

-- Update minute_transactions policies for admin access
DROP POLICY IF EXISTS "Admin can manage all minute_transactions" ON public.minute_transactions;
CREATE POLICY "Admin can manage all minute_transactions"
  ON public.minute_transactions
  FOR ALL
  USING (get_current_user_role() = 'admin'::user_role);