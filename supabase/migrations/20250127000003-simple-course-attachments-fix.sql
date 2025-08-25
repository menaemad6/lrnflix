-- Simple fix for course_attachments storage bucket RLS policies
-- This addresses the "new row violates row-level security policy" error when uploading PDFs

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for course_attachments if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload course attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to course attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to manage course attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow course instructors to upload attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow course instructors to manage attachments" ON storage.objects;

-- Simple policy: Allow any authenticated user to upload to course_attachments bucket
-- This is the quickest fix for the immediate problem
CREATE POLICY "Allow authenticated users to upload to course_attachments" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'course_attachments');

-- Allow public read access to course attachments
CREATE POLICY "Allow public read access to course_attachments" ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'course_attachments');

-- Allow authenticated users to manage course attachments
CREATE POLICY "Allow authenticated users to manage course_attachments" ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'course_attachments')
WITH CHECK (bucket_id = 'course_attachments');

-- Ensure the course_attachments bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('course_attachments', 'course_attachments', true, 52428800, ARRAY['application/pdf', 'application/octet-stream'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
