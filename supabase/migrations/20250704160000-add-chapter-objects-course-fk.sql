ALTER TABLE public.chapter_objects
ADD CONSTRAINT chapter_objects_object_id_course_fkey FOREIGN KEY (object_id)
REFERENCES public.courses(id) ON DELETE SET NULL; 