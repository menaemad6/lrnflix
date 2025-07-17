import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useToast } from '@/hooks/use-toast';

export type GameState = 'idle' | 'finding' | 'matched' | 'countdown' | 'playing' | 'waiting' | 'results';

export interface Player {
  id: string;
  user_id: string;
  username: string;
  score: number;
  streak: number;
  xp_earned: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
  time_limit: number;
}

export interface GameRoom {
  id: string;
  status: string;
  current_question_index: number;
  question_start_time: string | null;
  max_players: number;
  current_players: number;
  room_code?: string;
  is_public?: boolean;
  created_by?: string;
}

// LocalStorage keys
const STORAGE_KEYS = {
  GAME_STATE: 'multiplayer_quiz_game_state',
  ROOM: 'multiplayer_quiz_room',
  PLAYERS: 'multiplayer_quiz_players',
  CURRENT_QUESTION: 'multiplayer_quiz_current_question',
  TIME_LEFT: 'multiplayer_quiz_time_left',
  SELECTED_ANSWER: 'multiplayer_quiz_selected_answer',
  SHOW_RESULTS: 'multiplayer_quiz_show_results',
  FINAL_RESULTS: 'multiplayer_quiz_final_results',
  QUESTIONS: 'multiplayer_quiz_questions',
  PUBLIC_ROOMS: 'multiplayer_quiz_public_rooms',
  USER_ID: 'multiplayer_quiz_user_id'
};

// Helper functions for localStorage
const saveToStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

const clearStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

export const useMultiplayerQuiz = (): {
  gameState: GameState;
  room: GameRoom | null;
  players: Player[];
  currentQuestion: Question | null;
  timeLeft: number;
  selectedAnswer: string | null;
  showResults: boolean;
  finalResults: Player[];
  publicRooms: GameRoom[];
  questions: Question[];
  findMatch: () => Promise<void>;
  cancelMatch: () => Promise<void>;
  submitAnswer: (answer: string) => Promise<void>;
  setGameState: (state: GameState) => void;
  createRoom: (maxPlayers: number, isPublic: boolean) => Promise<GameRoom | undefined>;
  joinRoomByCode: (roomCode: string) => Promise<void>;
  joinPublicRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  startGame: () => Promise<void>;
  moveToNextQuestion: () => Promise<void>;
  endGame: () => Promise<void>;
  fetchPublicRooms: () => Promise<void>;
} => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();
  
  // Initialize state from localStorage
  const [gameState, setGameState] = useState<GameState>(() => 
    loadFromStorage(STORAGE_KEYS.GAME_STATE, 'idle')
  );
  const [room, setRoom] = useState<GameRoom | null>(() => 
    loadFromStorage(STORAGE_KEYS.ROOM, null)
  );
  const [players, setPlayers] = useState<Player[]>(() => 
    loadFromStorage(STORAGE_KEYS.PLAYERS, [])
  );
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(() => 
    loadFromStorage(STORAGE_KEYS.CURRENT_QUESTION, null)
  );
  const [questions, setQuestions] = useState<Question[]>(() => 
    loadFromStorage(STORAGE_KEYS.QUESTIONS, [])
  );
  const [timeLeft, setTimeLeft] = useState(() => 
    loadFromStorage(STORAGE_KEYS.TIME_LEFT, 0)
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(() => 
    loadFromStorage(STORAGE_KEYS.SELECTED_ANSWER, null)
  );
  const [showResults, setShowResults] = useState(() => 
    loadFromStorage(STORAGE_KEYS.SHOW_RESULTS, false)
  );
  const [finalResults, setFinalResults] = useState<Player[]>(() => 
    loadFromStorage(STORAGE_KEYS.FINAL_RESULTS, [])
  );
  const [publicRooms, setPublicRooms] = useState<GameRoom[]>(() => 
    loadFromStorage(STORAGE_KEYS.PUBLIC_ROOMS, [])
  );

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.GAME_STATE, gameState);
  }, [gameState]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ROOM, room);
  }, [room]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PLAYERS, players);
  }, [players]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CURRENT_QUESTION, currentQuestion);
  }, [currentQuestion]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.QUESTIONS, questions);
  }, [questions]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TIME_LEFT, timeLeft);
  }, [timeLeft]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SELECTED_ANSWER, selectedAnswer);
  }, [selectedAnswer]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SHOW_RESULTS, showResults);
  }, [showResults]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FINAL_RESULTS, finalResults);
  }, [finalResults]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PUBLIC_ROOMS, publicRooms);
  }, [publicRooms]);

  // Save user ID to localStorage
  useEffect(() => {
    if (user) {
      saveToStorage(STORAGE_KEYS.USER_ID, user.id);
    }
  }, [user]);

  // Restore state on page load
  useEffect(() => {
    if (!user) return;

    const savedUserId = loadFromStorage(STORAGE_KEYS.USER_ID, null);
    const savedRoom = loadFromStorage(STORAGE_KEYS.ROOM, null);
    const savedGameState = loadFromStorage(STORAGE_KEYS.GAME_STATE, 'idle');

    // Only restore state if the user ID matches (same user)
    if (savedUserId === user.id && savedRoom && savedGameState !== 'idle') {
      console.log('Restoring multiplayer quiz state from localStorage');
      
      // Verify the room still exists and user is still in it
      const verifyRoomAndUser = async () => {
        try {
          // Check if room exists
          const { data: roomExists, error: roomError } = await supabase
            .from('quiz_rooms')
            .select('*')
            .eq('id', savedRoom.id)
            .single();

          if (roomError || !roomExists) {
            console.log('Room no longer exists, clearing state');
            clearStorage();
            return;
          }

          // Check if user is still in the room
          const { data: userInRoom, error: userError } = await supabase
            .from('quiz_room_players')
            .select('*')
            .eq('room_id', savedRoom.id)
            .eq('user_id', user.id)
            .single();

          if (userError || !userInRoom) {
            console.log('User no longer in room, clearing state');
            clearStorage();
            return;
          }

          // Restore the state
          setRoom(roomExists);
          setGameState(savedGameState);
          
          // Fetch current players
          const { data: currentPlayers } = await supabase
            .from('quiz_room_players')
            .select('*')
            .eq('room_id', savedRoom.id)
            .order('score', { ascending: false });

          if (currentPlayers) {
            setPlayers(currentPlayers);
          }

          // Handle different room statuses
          if (roomExists.status === 'completed') {
            // Game was completed while user was away
            setGameState('results');
            setShowResults(true);
            
            // Get final results
            const { data: finalPlayers } = await supabase
              .from('quiz_room_players')
              .select('*')
              .eq('room_id', savedRoom.id)
              .order('score', { ascending: false });
            
            if (finalPlayers) {
              setFinalResults(finalPlayers);
            }
          } else if (roomExists.status === 'started') {
            // Game is in progress
            const savedQuestions = loadFromStorage(STORAGE_KEYS.QUESTIONS, []);
            if (savedQuestions.length > 0) {
              setQuestions(savedQuestions);
              const currentIndex = roomExists.current_question_index || 0;
              if (savedQuestions[currentIndex]) {
                setCurrentQuestion(savedQuestions[currentIndex]);
                setTimeLeft(savedQuestions[currentIndex].time_limit);
              }
            }
          }

          // If game is in countdown, set appropriate state
          if (roomExists.status === 'started' && savedGameState === 'countdown') {
            setGameState('countdown');
            setTimeout(() => {
              setGameState('playing');
              if (questions.length > 0) {
                const currentIndex = roomExists.current_question_index || 0;
                setCurrentQuestion(questions[currentIndex]);
                setTimeLeft(questions[currentIndex].time_limit);
              }
            }, 3000);
          }

          toast({
            title: 'State Restored',
            description: 'Your game session has been restored',
          });

        } catch (error) {
          console.error('Error verifying room and user:', error);
          clearStorage();
        }
      };

      verifyRoomAndUser();
    } else {
      // Clear storage if user doesn't match or no saved state
      clearStorage();
    }
  }, [user, toast]);

  // Create room
  const createRoom = useCallback(async (maxPlayers: number, isPublic: boolean) => {
    if (!user) return;

    try {
      // Generate 4-digit room code
      const roomCode = Math.floor(1000 + Math.random() * 9000).toString();
      
      const { data: newRoom, error } = await supabase
        .from('quiz_rooms')
        .insert({
          max_players: maxPlayers,
          is_public: isPublic,
          room_code: roomCode,
          created_by: user.id,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) throw error;

      // Join the room as creator
      const { error: joinError } = await supabase
        .from('quiz_room_players')
        .insert({
          room_id: newRoom.id,
          user_id: user.id,
          username: user.full_name || user.email
        });

      if (joinError) throw joinError;

      setRoom(newRoom);
      setGameState('matched');
      
      // Fetch players after creating room
      try {
        const { data: playerData, error: playerError } = await supabase
          .from('quiz_room_players')
          .select('*')
          .eq('room_id', newRoom.id)
          .order('score', { ascending: false });

        if (!playerError) {
          setPlayers(playerData || []);
        }
      } catch (error) {
        console.error('Error fetching players:', error);
      }
      
      toast({
        title: 'Room Created',
        description: `Room code: ${roomCode}. Share this with other players!`,
      });

      return newRoom;
    } catch (error: unknown) {
      console.error('Error creating room:', error);
      toast({
        title: 'Error',
        description: 'Failed to create room',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  // Join room by code
  const joinRoomByCode = useCallback(async (roomCode: string) => {
    if (!user) return;

    try {
      const { data: targetRoom, error } = await supabase
        .from('quiz_rooms')
        .select('*')
        .eq('room_code', roomCode)
        .eq('status', 'waiting')
        .single();

      if (error) throw error;

      // Check if room is full
      const { count } = await supabase
        .from('quiz_room_players')
        .select('*', { count: 'exact' })
        .eq('room_id', targetRoom.id);

      if (count && count >= targetRoom.max_players) {
        toast({
          title: 'Room Full',
          description: 'This room is already full',
          variant: 'destructive',
        });
        return;
      }

      // Join the room
      const { error: joinError } = await supabase
        .from('quiz_room_players')
        .insert({
          room_id: targetRoom.id,
          user_id: user.id,
          username: user.full_name || user.email
        });

      if (joinError) throw joinError;

      setRoom(targetRoom);
      setGameState('matched');
      
      // Fetch players after joining room
      try {
        const { data: playerData, error: playerError } = await supabase
          .from('quiz_room_players')
          .select('*')
          .eq('room_id', targetRoom.id)
          .order('score', { ascending: false });

        if (!playerError) {
          setPlayers(playerData || []);
        }
      } catch (error) {
        console.error('Error fetching players:', error);
      }
      
      toast({
        title: 'Joined Room',
        description: `Successfully joined room ${roomCode}`,
      });
    } catch (error: unknown) {
      console.error('Error joining room:', error);
      toast({
        title: 'Error',
        description: 'Failed to join room. Check the room code.',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  // Join public room
  const joinPublicRoom = useCallback(async (roomId: string) => {
    if (!user) return;

    try {
      const { data: targetRoom, error } = await supabase
        .from('quiz_rooms')
        .select('*')
        .eq('id', roomId)
        .eq('status', 'waiting')
        .single();

      if (error) throw error;

      // Join the room
      const { error: joinError } = await supabase
        .from('quiz_room_players')
        .insert({
          room_id: targetRoom.id,
          user_id: user.id,
          username: user.full_name || user.email
        });

      if (joinError) throw joinError;

      setRoom(targetRoom);
      setGameState('matched');
      
      // Fetch players after joining room
      try {
        const { data: playerData, error: playerError } = await supabase
          .from('quiz_room_players')
          .select('*')
          .eq('room_id', targetRoom.id)
          .order('score', { ascending: false });

        if (!playerError) {
          setPlayers(playerData || []);
        }
      } catch (error) {
        console.error('Error fetching players:', error);
      }
      
      toast({
        title: 'Joined Room',
        description: 'Successfully joined the room',
      });
    } catch (error: unknown) {
      console.error('Error joining room:', error);
      toast({
        title: 'Error',
        description: 'Failed to join room',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  // Fetch public rooms
  const fetchPublicRooms = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_rooms')
        .select('*')
        .eq('is_public', true)
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get player count for each room
      const roomsWithPlayerCount = [];
      for (const room of data) {
        const { count } = await supabase
          .from('quiz_room_players')
          .select('*', { count: 'exact' })
          .eq('room_id', room.id);
        
        roomsWithPlayerCount.push({
          ...room,
          current_players: count || 0
        });
      }

      setPublicRooms(roomsWithPlayerCount);
    } catch (error: unknown) {
      console.error('Error fetching public rooms:', error);
    }
  }, []);

  // Find match and join queue
  const findMatch = useCallback(async () => {
    if (!user) return;

    try {
      setGameState('finding');
      
      // Add user to matchmaking queue
      const { error } = await supabase
        .from('matchmaking_queue')
        .insert({
          user_id: user.id,
          username: user.full_name || user.email,
          status: 'waiting'
        });

      if (error) throw error;

      toast({
        title: 'Finding Match',
        description: 'Looking for other players...',
      });
    } catch (error: unknown) {
      console.error('Error finding match:', error);
      toast({
        title: 'Error',
        description: 'Failed to find match',
        variant: 'destructive',
      });
      setGameState('idle');
    }
  }, [user, toast]);

  // Cancel matchmaking
  const cancelMatch = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from('matchmaking_queue')
        .delete()
        .eq('user_id', user.id);

      setGameState('idle');
      toast({
        title: 'Match Cancelled',
        description: 'Stopped looking for players',
      });
    } catch (error: unknown) {
      console.error('Error cancelling match:', error);
    }
  }, [user, toast]);

  // Submit answer
  const submitAnswer = useCallback(async (answer: string) => {
    if (!room || !currentQuestion || !user) return;

    try {
      const answerTime = currentQuestion.time_limit - timeLeft;
      const isCorrect = answer === currentQuestion.correct_answer;
      const points = isCorrect ? Math.max(10, Math.floor((timeLeft / currentQuestion.time_limit) * 100)) : 0;

      // Submit answer
      await supabase
        .from('quiz_room_answers')
        .insert({
          room_id: room.id,
          user_id: user.id,
          question_id: currentQuestion.id,
          selected_answer: answer,
          is_correct: isCorrect,
          answer_time_seconds: answerTime,
          points_earned: points
        });

      // Update player score
      const currentPlayer = players.find(p => p.user_id === user.id);
      if (currentPlayer) {
        await supabase
          .from('quiz_room_players')
          .update({ 
            score: currentPlayer.score + points,
            streak: isCorrect ? currentPlayer.streak + 1 : 0,
            xp_earned: currentPlayer.xp_earned + Math.floor(points / 10)
          })
          .eq('room_id', room.id)
          .eq('user_id', user.id);
      }

      setSelectedAnswer(answer);

      // Check if all players have answered
      const { count: answeredCount } = await supabase
        .from('quiz_room_answers')
        .select('*', { count: 'exact' })
        .eq('room_id', room.id)
        .eq('question_id', currentQuestion.id);

      const { count: totalPlayers } = await supabase
        .from('quiz_room_players')
        .select('*', { count: 'exact' })
        .eq('room_id', room.id);

      // If all players have answered, move to next question after a short delay
      if (answeredCount && totalPlayers && answeredCount >= totalPlayers) {
        setTimeout(async () => {
          if (!room || !questions.length) return;

          const currentIndex = room.current_question_index || 0;
          const nextIndex = currentIndex + 1;

          if (nextIndex >= questions.length) {
            // Game is complete, show results
            try {
              // Update room status to completed
              await supabase
                .from('quiz_rooms')
                .update({ status: 'completed' })
                .eq('id', room.id);

              // Get final player scores
              const { data: finalPlayers, error } = await supabase
                .from('quiz_room_players')
                .select('*')
                .eq('room_id', room.id)
                .order('score', { ascending: false });

              if (!error && finalPlayers) {
                setFinalResults(finalPlayers);
                setShowResults(true);
                setGameState('results');
              }
            } catch (error) {
              console.error('Error ending game:', error);
            }
          } else {
            // Move to next question
            const { error } = await supabase
              .from('quiz_rooms')
              .update({
                current_question_index: nextIndex,
                question_start_time: new Date().toISOString()
              })
              .eq('id', room.id);

            if (!error) {
              // Reset state for next question
              setSelectedAnswer(null);
              setShowResults(false);
              setGameState('countdown');
              
              setTimeout(() => {
                setGameState('playing');
                setCurrentQuestion(questions[nextIndex]);
                setTimeLeft(questions[nextIndex].time_limit);
              }, 3000);
            }
          }
        }, 2000); // 2 second delay to show correct answer
      }
    } catch (error: unknown) {
      console.error('Error submitting answer:', error);
    }
  }, [room, currentQuestion, user, timeLeft, questions]);

  // Load questions
  const loadQuestions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('multiplayer_quiz_questions')
        .select('*')
        .limit(10);

      if (error) throw error;

      const formattedQuestions: Question[] = data.map(q => ({
        id: q.id,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
        correct_answer: q.correct_answer,
        difficulty: q.difficulty,
        time_limit: q.time_limit
      }));

      setQuestions(formattedQuestions);
    } catch (error: unknown) {
      console.error('Error loading questions:', error);
    }
  }, []);

  // Fetch players with removal logic (for manual calls)
  const fetchPlayers = useCallback(async (roomId: string) => {
    // Don't fetch if we don't have a room or user
    if (!roomId || !user) return;
    
    try {
      // First check if the room still exists
      const { data: roomData, error: roomError } = await supabase
        .from('quiz_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError || !roomData) {
        // Room no longer exists, reset state
        setRoom(null);
        setPlayers([]);
        setGameState('idle');
        setCurrentQuestion(null);
        setTimeLeft(0);
        setSelectedAnswer(null);
        setShowResults(false);
        setFinalResults([]);
        
        toast({
          title: 'Room Closed',
          description: 'The room has been closed',
        });
        return;
      }

      const { data, error } = await supabase
        .from('quiz_room_players')
        .select('*')
        .eq('room_id', roomId)
        .order('score', { ascending: false });

      if (error) throw error;
      
      // Check if current user is still in the room
      if (user && data) {
        const currentPlayer = data.find(p => p.user_id === user.id);
        if (!currentPlayer) {
          // User is no longer in the room, reset state
          setRoom(null);
          setPlayers([]);
          setGameState('idle');
          setCurrentQuestion(null);
          setTimeLeft(0);
          setSelectedAnswer(null);
          setShowResults(false);
          setFinalResults([]);
          
          toast({
            title: 'Removed from Room',
            description: 'You have been removed from the room',
          });
          return;
        }
      } else if (user && (!data || data.length === 0)) {
        // No players in room but user exists, reset state
        setRoom(null);
        setPlayers([]);
        setGameState('idle');
        setCurrentQuestion(null);
        setTimeLeft(0);
        setSelectedAnswer(null);
        setShowResults(false);
        setFinalResults([]);
        return;
      }
      
      // Update the room's current_players count
      if (data) {
        setRoom(prev => prev ? { ...prev, current_players: data.length } : null);
      }
      
      setPlayers(data || []);
    } catch (error: unknown) {
      console.error('Error fetching players:', error);
    }
  }, [user, toast]);

  // Simple function to update players list without removal logic (for real-time updates)
  const updatePlayersList = useCallback(async (roomId: string) => {
    if (!roomId) return;
    
    try {
      const { data, error } = await supabase
        .from('quiz_room_players')
        .select('*')
        .eq('room_id', roomId)
        .order('score', { ascending: false });

      if (error) throw error;
      
      // Update the room's current_players count
      if (data) {
        setRoom(prev => prev ? { ...prev, current_players: data.length } : null);
      }
      
      setPlayers(data || []);
    } catch (error: unknown) {
      console.error('Error updating players list:', error);
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && gameState === 'playing') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      // Time's up, move to next question
      moveToNextQuestion();
    }
  }, [timeLeft, gameState]);

  // Move to next question
  const moveToNextQuestion = useCallback(async () => {
    if (!room || !questions.length) return;

    const currentIndex = room.current_question_index || 0;
    const nextIndex = currentIndex + 1;

    if (nextIndex >= questions.length) {
      // Game is complete, show results
      await endGame();
    } else {
      // Move to next question
      const { error } = await supabase
        .from('quiz_rooms')
        .update({
          current_question_index: nextIndex,
          question_start_time: new Date().toISOString()
        })
        .eq('id', room.id);

      if (!error) {
        // Reset state for next question
        setSelectedAnswer(null);
        setShowResults(false);
        setGameState('countdown');
        
        setTimeout(() => {
          setGameState('playing');
          setCurrentQuestion(questions[nextIndex]);
          setTimeLeft(questions[nextIndex].time_limit);
        }, 3000);
      }
    }
  }, [room, questions]);

  // End game and show results
  const endGame = useCallback(async () => {
    if (!room) return;

    try {
      // Update room status to completed
      await supabase
        .from('quiz_rooms')
        .update({ status: 'completed' })
        .eq('id', room.id);

      // Get final player scores
      const { data: finalPlayers, error } = await supabase
        .from('quiz_room_players')
        .select('*')
        .eq('room_id', room.id)
        .order('score', { ascending: false });

      if (!error && finalPlayers) {
        setFinalResults(finalPlayers);
        setShowResults(true);
        setGameState('results');
      }
    } catch (error) {
      console.error('Error ending game:', error);
    }
  }, [room]);

  // Clear storage when game ends (results state)
  useEffect(() => {
    if (gameState === 'results') {
      // Clear storage after a delay to allow user to see results
      const timer = setTimeout(() => {
        clearStorage();
      }, 10000); // 10 seconds delay
      
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to room updates
    const roomChannel = supabase
      .channel('quiz_rooms')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'quiz_rooms'
      }, async (payload) => {
        if (payload.eventType === 'UPDATE' && room && user && payload.new.id === room.id) {
          const updatedRoom = payload.new as GameRoom;
          setRoom(updatedRoom);
          
          if (updatedRoom.status === 'started' && gameState === 'matched') {
            // Initial game start
            setGameState('countdown');
            setTimeout(() => {
              setGameState('playing');
              if (questions.length > 0) {
                setCurrentQuestion(questions[updatedRoom.current_question_index] || questions[0]);
                setTimeLeft(questions[updatedRoom.current_question_index]?.time_limit || 15);
              }
            }, 3000);
          } else if (updatedRoom.status === 'started' && gameState === 'playing') {
            // Question progression
            if (updatedRoom.current_question_index !== room.current_question_index) {
              setSelectedAnswer(null);
              setShowResults(false);
              setGameState('countdown');
              
              setTimeout(() => {
                setGameState('playing');
                if (questions.length > 0) {
                  setCurrentQuestion(questions[updatedRoom.current_question_index] || questions[0]);
                  setTimeLeft(questions[updatedRoom.current_question_index]?.time_limit || 15);
                }
              }, 3000);
            }
          } else if (updatedRoom.status === 'completed') {
            // Game completed
            setGameState('results');
          }
        } else if (payload.eventType === 'DELETE' && room && user && payload.old.id === room.id) {
          // Room was deleted, reset state
          setRoom(null);
          setPlayers([]);
          setGameState('idle');
          setCurrentQuestion(null);
          setTimeLeft(0);
          setSelectedAnswer(null);
          setShowResults(false);
          setFinalResults([]);
          
          // Refresh public rooms when a room is deleted
          await fetchPublicRooms();
          
          toast({
            title: 'Room Closed',
            description: 'The room has been closed',
          });
        } else if (payload.eventType === 'UPDATE' && !room) {
          // Room was updated but we're not in it - refresh public rooms
          await fetchPublicRooms();
        }
      })
      .subscribe();

    // Subscribe to player updates
    const playersChannel = supabase
      .channel('quiz_room_players')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'quiz_room_players'
      }, async (payload) => {
        if (room && user) {
          console.log('Player subscription event:', payload.eventType, 'current user:', user.id);
          
          // Verify room still exists before processing updates
          const { data: roomExists } = await supabase
            .from('quiz_rooms')
            .select('id')
            .eq('id', room.id)
            .single();
          
          if (!roomExists) {
            // Room no longer exists, reset state
            setRoom(null);
            setPlayers([]);
            setGameState('idle');
            setCurrentQuestion(null);
            setTimeLeft(0);
            setSelectedAnswer(null);
            setShowResults(false);
            setFinalResults([]);
            return;
          }
          
          // Only update players list for INSERT and DELETE events (not UPDATE)
          if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
            await updatePlayersList(room.id);
          }
          
          // Handle player joining
          if (payload.eventType === 'INSERT' && room.status === 'waiting') {
            // Get the username of the player who joined
            const joinedPlayerUsername = payload.new?.username || 'A player';
            
            // Show notification to existing players
            if (payload.new?.user_id !== user?.id) {
              toast({
                title: 'Player Joined',
                description: `${joinedPlayerUsername} has joined the room`,
              });
            }
            
            const { count } = await supabase
              .from('quiz_room_players')
              .select('*', { count: 'exact' })
              .eq('room_id', room.id);
            
            if (count && count >= room.max_players) {
              // Room is full, start the game after a short delay
              setTimeout(async () => {
                const { error } = await supabase
                  .from('quiz_rooms')
                  .update({ 
                    status: 'started',
                    current_question_index: 0,
                    question_start_time: new Date().toISOString()
                  })
                  .eq('id', room.id);
                
                if (!error) {
                  console.log('Game started automatically - room is full');
                }
              }, 3000); // 3 second delay
            }
          }
          
          // Handle player leaving
          if (payload.eventType === 'DELETE') {
            // Get the username of the player who left (from the old record)
            const leftPlayerUsername = payload.old?.username || 'A player';
            
            // Show notification to remaining players
            if (payload.old?.user_id !== user?.id) {
              toast({
                title: 'Player Left',
                description: `${leftPlayerUsername} has left the room`,
              });
            }
            
            // Only check if current user is still in the room if THEY are the one who left
            if (payload.old?.user_id === user?.id) {
              // Current user left, reset state
              setRoom(null);
              setPlayers([]);
              setGameState('idle');
              setCurrentQuestion(null);
              setTimeLeft(0);
              setSelectedAnswer(null);
              setShowResults(false);
              setFinalResults([]);
            }
            
            // If room is now empty, delete the room
            const { count: remainingPlayers } = await supabase
              .from('quiz_room_players')
              .select('*', { count: 'exact' })
              .eq('room_id', room.id);
            
            if (remainingPlayers === 0) {
              // Delete the room if no players remain
              await supabase
                .from('quiz_rooms')
                .delete()
                .eq('id', room.id);
            } else if (remainingPlayers > 0 && room.status === 'waiting') {
              // Check if the room creator left and transfer ownership to the first remaining player
              const { data: remainingPlayerData } = await supabase
                .from('quiz_room_players')
                .select('*')
                .eq('room_id', room.id)
                .order('joined_at', { ascending: true })
                .limit(1);
              
              if (remainingPlayerData && remainingPlayerData.length > 0 && room.created_by === payload.old?.user_id) {
                // Transfer room ownership to the first remaining player
                await supabase
                  .from('quiz_rooms')
                  .update({ created_by: remainingPlayerData[0].user_id })
                  .eq('id', room.id);
                
                // Update local room state
                setRoom(prev => prev ? { ...prev, created_by: remainingPlayerData[0].user_id } : null);
                
                // Notify the new room creator
                if (remainingPlayerData[0].user_id === user?.id) {
                  toast({
                    title: 'Room Ownership Transferred',
                    description: 'You are now the room creator',
                  });
                }
              }
            }
          }
        } else {
          // We're not in a room, but players are joining/leaving rooms - refresh public rooms
          if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
            await fetchPublicRooms();
          }
        }
      })
      .subscribe();

    // Subscribe to answer updates
    const answersChannel = supabase
      .channel('quiz_room_answers')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'quiz_room_answers'
      }, (payload) => {
        if (room && user && payload.eventType === 'INSERT') {
          // Refresh players to get updated scores
          updatePlayersList(room.id);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(answersChannel);
    };
  }, [user, room, gameState, questions, updatePlayersList]);

  // Start game (for room creator)
  const startGame = useCallback(async () => {
    if (!user || !room || room.created_by !== user.id) return;

    try {
      const { error } = await supabase
        .from('quiz_rooms')
        .update({ 
          status: 'started',
          current_question_index: 0,
          question_start_time: new Date().toISOString()
        })
        .eq('id', room.id);

      if (error) throw error;

      toast({
        title: 'Game Started',
        description: 'The game is now starting!',
      });
    } catch (error: unknown) {
      console.error('Error starting game:', error);
      toast({
        title: 'Error',
        description: 'Failed to start game',
        variant: 'destructive',
      });
    }
  }, [user, room, toast]);

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (!user || !room) return;

    try {
      // Store room info before resetting state
      const roomId = room.id;
      const isRoomCreator = room.created_by === user.id;
      const isGameInProgress = room.status === 'started' || gameState === 'playing' || gameState === 'countdown';
      
      // Remove user from the room FIRST
      const { error, count } = await supabase
        .from('quiz_room_players')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      console.log(`User ${user.id} removed from room ${roomId}. Deleted ${count} records.`);
      
      // Verify the user was actually removed
      const { data: verifyUser, error: verifyError } = await supabase
        .from('quiz_room_players')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', user.id);
      
      if (verifyError) {
        console.error('Error verifying user removal:', verifyError);
      } else if (verifyUser && verifyUser.length > 0) {
        console.error('User was not properly removed from room');
        throw new Error('Failed to remove user from room');
      }

      // Get updated player count after leaving
      const { count: remainingPlayers } = await supabase
        .from('quiz_room_players')
        .select('*', { count: 'exact' })
        .eq('room_id', roomId);

      // If room creator leaves during game, end the game for everyone
      if (isRoomCreator && isGameInProgress) {
        await supabase
          .from('quiz_rooms')
          .update({ status: 'completed' })
          .eq('id', roomId);
      } else if (isGameInProgress) {
        // If any player leaves during an active game, check if enough players remain
        if (remainingPlayers && remainingPlayers < 2) {
          await supabase
            .from('quiz_rooms')
            .update({ status: 'completed' })
            .eq('id', roomId);
        }
      }

      // If room is now empty, delete the room
      if (remainingPlayers === 0) {
        await supabase
          .from('quiz_rooms')
          .delete()
          .eq('id', roomId);
      } else if (remainingPlayers > 0 && room.status === 'waiting') {
        // Check if the room creator left and transfer ownership to the first remaining player
        const { data: remainingPlayerData } = await supabase
          .from('quiz_room_players')
          .select('*')
          .eq('room_id', roomId)
          .order('joined_at', { ascending: true })
          .limit(1);
        
        if (remainingPlayerData && remainingPlayerData.length > 0 && room.created_by === user.id) {
          // Transfer room ownership to the first remaining player
          await supabase
            .from('quiz_rooms')
            .update({ created_by: remainingPlayerData[0].user_id })
            .eq('id', roomId);
        }
      }

      // NOW reset state after all database operations are complete
      setRoom(null);
      setPlayers([]);
      setGameState('idle');
      setCurrentQuestion(null);
      setTimeLeft(0);
      setSelectedAnswer(null);
      setShowResults(false);
      setFinalResults([]);

      // Clear localStorage when leaving room
      clearStorage();

      // Refresh public rooms to update player counts
      await fetchPublicRooms();

      toast({
        title: 'Left Room',
        description: 'You have left the room',
      });
    } catch (error: unknown) {
      console.error('Error leaving room:', error);
      toast({
        title: 'Error',
        description: 'Failed to leave room',
        variant: 'destructive',
      });
    }
  }, [user, room, gameState, toast]);

  // Initialize
  useEffect(() => {
    loadQuestions();
    fetchPublicRooms();
    
    // Refresh public rooms every 10 seconds
    const interval = setInterval(fetchPublicRooms, 10000);
    
    return () => clearInterval(interval);
  }, [loadQuestions, fetchPublicRooms]);

  // More frequent refresh when in lobby (not in a room)
  useEffect(() => {
    if (!room && gameState === 'idle') {
      // Refresh public rooms immediately when entering lobby
      fetchPublicRooms();
      
      // Refresh public rooms more frequently when in lobby
      const lobbyInterval = setInterval(fetchPublicRooms, 5000);
      return () => clearInterval(lobbyInterval);
    }
  }, [room, gameState, fetchPublicRooms]);

  return {
    gameState,
    room,
    players,
    currentQuestion,
    timeLeft,
    selectedAnswer,
    showResults,
    finalResults,
    publicRooms,
    questions,
    findMatch,
    cancelMatch,
    submitAnswer,
    setGameState,
    createRoom,
    joinRoomByCode,
    joinPublicRoom,
    leaveRoom,
    startGame,
    moveToNextQuestion,
    endGame,
    fetchPublicRooms
  };
};
