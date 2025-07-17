-- Fix infinite recursion in quiz_room_players RLS policy
-- Drop the problematic policy
DROP POLICY IF EXISTS "Players can view room players" ON public.quiz_room_players;

-- Create a simpler policy that doesn't cause recursion
CREATE POLICY "Anyone can view room players" 
  ON public.quiz_room_players 
  FOR SELECT 
  USING (true);

-- Create a function to update player count in quiz_rooms
CREATE OR REPLACE FUNCTION update_quiz_room_player_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.quiz_rooms 
    SET current_players = current_players + 1
    WHERE id = NEW.room_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.quiz_rooms 
    SET current_players = current_players - 1
    WHERE id = OLD.room_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update player count
DROP TRIGGER IF EXISTS update_quiz_room_player_count_trigger ON public.quiz_room_players;
CREATE TRIGGER update_quiz_room_player_count_trigger
  AFTER INSERT OR DELETE ON public.quiz_room_players
  FOR EACH ROW EXECUTE FUNCTION update_quiz_room_player_count();

-- Update existing room player counts
UPDATE public.quiz_rooms 
SET current_players = (
  SELECT COUNT(*) 
  FROM public.quiz_room_players 
  WHERE room_id = quiz_rooms.id
); 