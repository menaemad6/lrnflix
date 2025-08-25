-- Add storage policies for course_attachments bucket to fix PDF upload RLS errors
-- This allows authenticated users to upload and manage PDF attachments

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for course_attachments if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload course attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to course attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to manage course attachments" ON storage.objects;

-- Policy 1: Allow authenticated users to upload PDFs to course_attachments bucket
CREATE POLICY "Allow authenticated users to upload course attachments" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'course_attachments');

-- Policy 2: Allow public read access to course attachments (since bucket should be public)
CREATE POLICY "Allow public access to course attachments" ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'course_attachments');

-- Policy 3: Allow authenticated users to update/delete course attachments
CREATE POLICY "Allow users to manage course attachments" ON storage.objects
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

-- Alternative: If you want to be more restrictive and only allow course instructors to upload
-- Uncomment the following policies and comment out the above ones:

-- DROP POLICY IF EXISTS "Allow course instructors to upload attachments" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow course instructors to manage attachments" ON storage.objects;

-- CREATE POLICY "Allow course instructors to upload attachments" ON storage.objects
-- FOR INSERT 
-- TO authenticated
-- WITH CHECK (
--   bucket_id = 'course_attachments' 
--   AND EXISTS (
--     SELECT 1 FROM courses c 
--     WHERE c.instructor_id = auth.uid() 
--     AND c.id::text = (storage.foldername(name))[1]
--   )
-- );

-- CREATE POLICY "Allow course instructors to manage attachments" ON storage.objects
-- FOR ALL
-- TO authenticated
-- USING (
--   bucket_id = 'course_attachments'
--   AND EXISTS (
--     SELECT 1 FROM courses c 
--     WHERE c.instructor_id = auth.uid() 
--     AND c.id::text = (storage.foldername(name))[1]
--   )
-- )
-- WITH CHECK (
--   bucket_id = 'course_attachments'
--   AND EXISTS (
--     SELECT 1 FROM courses c 
--     WHERE c.instructor_id = auth.uid() 
--     AND c.id::text = (storage.foldername(name))[1]
--   )
-- );
