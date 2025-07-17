
-- Create matchmaking queue table
CREATE TABLE public.matchmaking_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  username TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'matched', 'cancelled')),
  room_id UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz rooms table
CREATE TABLE public.quiz_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'started', 'completed')),
  max_players INTEGER NOT NULL DEFAULT 4,
  current_players INTEGER NOT NULL DEFAULT 0,
  current_question_index INTEGER NOT NULL DEFAULT 0,
  question_start_time TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz room players table
CREATE TABLE public.quiz_room_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.quiz_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  username TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Create multiplayer quiz questions table
CREATE TABLE public.multiplayer_quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  time_limit INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz answers table to track player responses
CREATE TABLE public.quiz_room_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.quiz_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  question_id UUID REFERENCES public.multiplayer_quiz_questions(id) NOT NULL,
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answer_time_seconds NUMERIC(5,2) NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multiplayer_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_room_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for matchmaking_queue
CREATE POLICY "Users can view all queue entries" 
  ON public.matchmaking_queue 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own queue entry" 
  ON public.matchmaking_queue 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own queue entry" 
  ON public.matchmaking_queue 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own queue entry" 
  ON public.matchmaking_queue 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for quiz_rooms
CREATE POLICY "Anyone can view quiz rooms" 
  ON public.quiz_rooms 
  FOR SELECT 
  USING (true);

CREATE POLICY "System can manage quiz rooms" 
  ON public.quiz_rooms 
  FOR ALL 
  USING (true);

-- RLS Policies for quiz_room_players
CREATE POLICY "Players can view room players" 
  ON public.quiz_room_players 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.quiz_room_players qrp 
    WHERE qrp.room_id = quiz_room_players.room_id 
    AND qrp.user_id = auth.uid()
  ));

CREATE POLICY "Users can join rooms" 
  ON public.quiz_room_players 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update player scores" 
  ON public.quiz_room_players 
  FOR UPDATE 
  USING (true);

-- RLS Policies for multiplayer_quiz_questions
CREATE POLICY "Anyone can view quiz questions" 
  ON public.multiplayer_quiz_questions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage quiz questions" 
  ON public.multiplayer_quiz_questions 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'teacher')
  ));

-- RLS Policies for quiz_room_answers
CREATE POLICY "Players can view answers in their room" 
  ON public.quiz_room_answers 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.quiz_room_players qrp 
    WHERE qrp.room_id = quiz_room_answers.room_id 
    AND qrp.user_id = auth.uid()
  ));

CREATE POLICY "Users can submit their own answers" 
  ON public.quiz_room_answers 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_matchmaking_queue_updated_at 
  BEFORE UPDATE ON public.matchmaking_queue 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_rooms_updated_at 
  BEFORE UPDATE ON public.quiz_rooms 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.matchmaking_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_room_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_room_answers;

-- Insert some sample quiz questions
INSERT INTO public.multiplayer_quiz_questions (question, options, correct_answer, difficulty, time_limit) VALUES
('What is the capital of France?', '["Paris", "London", "Berlin", "Madrid"]', 'Paris', 'easy', 10),
('Which programming language is known as the "language of the web"?', '["Python", "JavaScript", "Java", "C++"]', 'JavaScript', 'medium', 15),
('What is the largest planet in our solar system?', '["Earth", "Mars", "Jupiter", "Saturn"]', 'Jupiter', 'easy', 10),
('In which year did World War II end?', '["1944", "1945", "1946", "1947"]', '1945', 'medium', 15),
('What is the chemical symbol for gold?', '["Go", "Gd", "Au", "Ag"]', 'Au', 'hard', 20);
