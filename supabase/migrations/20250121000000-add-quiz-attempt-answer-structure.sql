-- Migration: Add quiz attempt answer structure for written questions
-- This migration documents the new JSON structure for quiz attempts
-- No actual schema changes needed, just documentation of the new format

-- The new structure for the answers JSON column in quiz_attempts:
-- {
--   "question_id": {
--     "answer": "student's actual answer",
--     "isCorrect": true/false/null
--   }
-- }
--
-- For multiple choice questions: isCorrect is automatically set based on exact match
-- For written questions: isCorrect starts as null and can be manually set by teachers
-- 
-- This allows:
-- 1. Students to see their exact answers in results
-- 2. Teachers to manually mark written answers as correct
-- 3. Proper scoring without exposing correct answers during quiz taking
-- 4. Backward compatibility with existing attempts

COMMENT ON COLUMN quiz_attempts.answers IS 'JSON object with question_id as key and value containing answer and isCorrect flag. Format: {"question_id": {"answer": "student_answer", "isCorrect": boolean|null}}';
