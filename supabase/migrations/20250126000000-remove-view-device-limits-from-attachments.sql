-- Remove view_limit and device_limit columns from attachments table
ALTER TABLE public.attachments DROP COLUMN IF EXISTS view_limit;
ALTER TABLE public.attachments DROP COLUMN IF EXISTS device_limit;

-- Update the attachments table structure
-- The table will now have these columns:
-- id, course_id, chapter_id, title, description, attachment_url, 
-- order_index, size, type, created_at, updated_at
