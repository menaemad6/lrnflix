
-- Create a table to store platform-wide or user-defined assistant settings
CREATE TABLE public.ai_assistant_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL,  -- e.g. "daily_minutes_limit", "minutes_price"
  setting_value text NOT NULL, -- can store numeric as text
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  -- in the future, can be extended per user/org via user_id/org_id
  CONSTRAINT unique_setting_key UNIQUE (setting_key)
);

-- Add RLS (Row Level Security)
ALTER TABLE public.ai_assistant_settings ENABLE ROW LEVEL SECURITY;

-- Allow only admin/teacher role to manage (SELECT/UPDATE/INSERT/DELETE) settings
-- For demo, allow all authenticated users to SELECT for now
CREATE POLICY "Allow select ai_assistant_settings for all" ON public.ai_assistant_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow insert/update/delete only by admins (you can adjust: teacher or admin)
CREATE POLICY "Allow manage ai_assistant_settings for admin" ON public.ai_assistant_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'teacher')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'teacher')
    )
  );
