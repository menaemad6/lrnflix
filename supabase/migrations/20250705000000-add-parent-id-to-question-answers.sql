-- Add parent_id and likes_count to question_answers table
ALTER TABLE question_answers 
ADD COLUMN parent_id UUID REFERENCES question_answers(id) ON DELETE CASCADE,
ADD COLUMN likes_count INTEGER DEFAULT 0;

-- Create index for better performance on parent_id queries
CREATE INDEX idx_question_answers_parent_id ON question_answers(parent_id);

-- Update RLS policies to allow replies
-- Allow users to insert replies to any answer
CREATE POLICY "Users can insert replies to any answer" ON question_answers
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND
  (parent_id IS NULL OR EXISTS (
    SELECT 1 FROM question_answers qa WHERE qa.id = parent_id
  ))
);

-- Allow users to update their own replies
CREATE POLICY "Users can update their own replies" ON question_answers
FOR UPDATE USING (
  auth.uid() = user_id
) WITH CHECK (
  auth.uid() = user_id
);

-- Allow users to delete their own replies
CREATE POLICY "Users can delete their own replies" ON question_answers
FOR DELETE USING (
  auth.uid() = user_id
);

-- Allow teachers and admins to delete any reply
CREATE POLICY "Teachers and admins can delete any reply" ON question_answers
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('teacher', 'admin')
  )
);

-- Allow teachers and admins to update any reply
CREATE POLICY "Teachers and admins can update any reply" ON question_answers
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('teacher', 'admin')
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('teacher', 'admin')
  )
); 