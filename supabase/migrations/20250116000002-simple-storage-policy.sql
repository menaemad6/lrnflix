-- Simple storage policy - more permissive approach
-- This is a backup solution if the detailed policies don't work

-- Drop the complex policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to manage their own images" ON storage.objects;

-- Create a simple, permissive policy for all storage operations
CREATE POLICY "Allow all storage operations for image buckets" ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id IN (
  'lectures_thumbnails',
  'chapters_thumbnails',
  'groups_thumbnails',
  'quiz_questions',
  'teachers_images'
))
WITH CHECK (bucket_id IN (
  'lectures_thumbnails',
  'chapters_thumbnails',
  'groups_thumbnails',
  'quiz_questions',
  'teachers_images'
));

-- Also create a public read policy
CREATE POLICY "Public read access to images" ON storage.objects
FOR SELECT
TO public
USING (bucket_id IN (
  'lectures_thumbnails',
  'chapters_thumbnails',
  'groups_thumbnails',
  'quiz_questions',
  'teachers_images'
));
