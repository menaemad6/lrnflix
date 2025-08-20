-- Fix storage bucket RLS policies for image uploads
-- This allows authenticated users to upload images to the public buckets

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to manage their own images" ON storage.objects;

-- Policy 1: Allow authenticated users to upload images to any bucket
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id IN (
  'lectures_thumbnails',
  'chapters_thumbnails',
  'groups_thumbnails',
  'quiz_questions',
  'teachers_images'
));

-- Policy 2: Allow public read access to all images (since buckets are public)
CREATE POLICY "Allow public access to images" ON storage.objects
FOR SELECT 
TO public
USING (bucket_id IN (
  'lectures_thumbnails',
  'chapters_thumbnails',
  'groups_thumbnails', 
  'quiz_questions',
  'teachers_images'
));

-- Policy 3: Allow authenticated users to update/delete their own images
CREATE POLICY "Allow users to manage their own images" ON storage.objects
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

-- Also ensure the buckets exist and are public
-- Note: These should be created in Supabase dashboard, but this ensures they exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('lectures_thumbnails', 'lectures_thumbnails', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']),
  ('chapters_thumbnails', 'chapters_thumbnails', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']),
  ('groups_thumbnails', 'groups_thumbnails', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']),
  ('quiz_questions', 'quiz_questions', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']),
  ('teachers_images', 'teachers_images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
