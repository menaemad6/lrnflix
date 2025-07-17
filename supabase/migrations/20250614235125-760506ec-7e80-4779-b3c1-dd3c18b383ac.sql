
-- Update the check constraint to allow educational content types
ALTER TABLE public.group_objects 
DROP CONSTRAINT IF EXISTS group_objects_object_type_check;

-- Add the updated constraint with all supported object types
ALTER TABLE public.group_objects 
ADD CONSTRAINT group_objects_object_type_check 
CHECK (object_type IN ('document', 'image', 'link', 'video', 'course', 'lesson', 'quiz'));
