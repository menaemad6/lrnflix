-- Add missing DELETE policy for quiz_room_players table
-- Users should be able to delete their own records (leave rooms)

CREATE POLICY "Users can delete their own room player record" 
  ON public.quiz_room_players 
  FOR DELETE 
  USING (auth.uid() = user_id); 