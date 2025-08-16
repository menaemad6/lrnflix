-- Add shuffled_questions column to quiz_rooms table
-- This column stores an array of question IDs in the shuffled order for consistent question progression

ALTER TABLE quiz_rooms 
ADD COLUMN shuffled_questions TEXT[] DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN quiz_rooms.shuffled_questions IS 'Array of question IDs in shuffled order for consistent question progression across all players in the room';
