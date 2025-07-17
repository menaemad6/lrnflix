
-- Add new columns to quizzes table for teacher options
ALTER TABLE public.quizzes 
ADD COLUMN shuffle_questions boolean DEFAULT false,
ADD COLUMN show_results boolean DEFAULT true,
ADD COLUMN show_correct_answers boolean DEFAULT true,
ADD COLUMN allow_review boolean DEFAULT true,
ADD COLUMN question_navigation boolean DEFAULT true;

-- Add a comment to document the new columns
COMMENT ON COLUMN public.quizzes.shuffle_questions IS 'Whether to shuffle the order of questions for each attempt';
COMMENT ON COLUMN public.quizzes.show_results IS 'Whether to show the score to students after completion';
COMMENT ON COLUMN public.quizzes.show_correct_answers IS 'Whether to show correct answers to students after completion';
COMMENT ON COLUMN public.quizzes.allow_review IS 'Whether students can review their answers before submission';
COMMENT ON COLUMN public.quizzes.question_navigation IS 'Whether students can navigate between questions freely';
