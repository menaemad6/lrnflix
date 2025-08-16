-- Fix RLS policies for matchmaking functionality

-- First, disable RLS temporarily to avoid policy conflicts
ALTER TABLE public.quiz_room_players DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.matchmaking_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_rooms DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can join rooms" ON public.quiz_room_players;
DROP POLICY IF EXISTS "Players can view room players" ON public.quiz_room_players;
DROP POLICY IF EXISTS "System can update player scores" ON public.quiz_room_players;
DROP POLICY IF EXISTS "Anyone can view room players" ON public.quiz_room_players;
DROP POLICY IF EXISTS "Users can join rooms" ON public.quiz_room_players;
DROP POLICY IF EXISTS "System and players can update scores" ON public.quiz_room_players;
DROP POLICY IF EXISTS "Users can leave rooms" ON public.quiz_room_players;

-- Drop matchmaking queue policies
DROP POLICY IF EXISTS "Users can view all queue entries" ON public.matchmaking_queue;
DROP POLICY IF EXISTS "Users can create their own queue entry" ON public.matchmaking_queue;
DROP POLICY IF EXISTS "Users can update their own queue entry" ON public.matchmaking_queue;
DROP POLICY IF EXISTS "Users can delete their own queue entry" ON public.matchmaking_queue;
DROP POLICY IF EXISTS "Anyone can view queue entries" ON public.matchmaking_queue;
DROP POLICY IF EXISTS "Anyone can create queue entries" ON public.matchmaking_queue;
DROP POLICY IF EXISTS "Anyone can update queue entries" ON public.matchmaking_queue;
DROP POLICY IF EXISTS "Anyone can delete queue entries" ON public.matchmaking_queue;

-- Drop quiz rooms policies
DROP POLICY IF EXISTS "System can manage quiz rooms" ON public.quiz_rooms;
DROP POLICY IF EXISTS "Anyone can manage quiz rooms" ON public.quiz_rooms;

-- Now create new policies
CREATE POLICY "Anyone can view room players" 
  ON public.quiz_room_players 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can join rooms" 
  ON public.quiz_room_players 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update room players" 
  ON public.quiz_room_players 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete room players" 
  ON public.quiz_room_players 
  FOR DELETE 
  USING (true);

-- Create matchmaking queue policies
CREATE POLICY "Anyone can view queue entries" 
  ON public.matchmaking_queue 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create queue entries" 
  ON public.matchmaking_queue 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update queue entries" 
  ON public.matchmaking_queue 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete queue entries" 
  ON public.matchmaking_queue 
  FOR DELETE 
  USING (true);

-- Create quiz rooms policies
CREATE POLICY "Anyone can manage quiz rooms" 
  ON public.quiz_rooms 
  FOR ALL 
  USING (true);

-- Re-enable RLS
ALTER TABLE public.quiz_room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_rooms ENABLE ROW LEVEL SECURITY;

-- Ensure real-time is enabled for all tables (only add if not already members)
DO $$
BEGIN
    -- Check and add matchmaking_queue if not already a member
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'matchmaking_queue'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.matchmaking_queue;
    END IF;
    
    -- Check and add quiz_rooms if not already a member
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'quiz_rooms'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_rooms;
    END IF;
    
    -- Check and add quiz_room_players if not already a member
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'quiz_room_players'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_room_players;
    END IF;
    
    -- Check and add quiz_room_answers if not already a member
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'quiz_room_answers'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_room_answers;
    END IF;
END $$;
