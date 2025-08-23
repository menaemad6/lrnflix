-- Add device tracking to lessons and lesson_views
-- Migration: 20250122000000-add-device-tracking-to-lessons.sql

-- Add device_limit column to lessons table
ALTER TABLE public.lessons 
ADD COLUMN device_limit INTEGER DEFAULT NULL;

-- Add device_type column to lesson_views table
ALTER TABLE public.lesson_views 
ADD COLUMN device_type TEXT NOT NULL DEFAULT 'unknown';

-- Add device_type index for better performance
CREATE INDEX idx_lesson_views_device_type ON public.lesson_views(device_type);

-- Add composite index for device-based queries
CREATE INDEX idx_lesson_views_lesson_device ON public.lesson_views(lesson_id, device_type);

-- Add comment explaining the device_type values
COMMENT ON COLUMN public.lesson_views.device_type IS 'Device type: mobile, tablet, desktop, unknown';

-- Add comment explaining the device_limit
COMMENT ON COLUMN public.lessons.device_limit IS 'Maximum number of different devices that can view this lesson (NULL = unlimited)';
