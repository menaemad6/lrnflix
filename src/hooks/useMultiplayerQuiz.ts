import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';
import { updateUserXP } from '@/utils/xpUtils';

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
  category: string;
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
  category?: string;
  shuffled_questions?: string[]; // Array of question IDs in shuffled order
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
  USER_ID: 'multiplayer_quiz_user_id',
  CATEGORIES: 'multiplayer_quiz_categories'
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
  categories: string[];
  findMatch: (category?: string) => Promise<void>;
  cancelMatch: () => Promise<void>;
  submitAnswer: (answer: string) => Promise<void>;
  setGameState: (state: GameState) => void;
  createRoom: (maxPlayers: number, isPublic: boolean, category?: string, questionCount?: number) => Promise<GameRoom | undefined>;
  joinRoomByCode: (roomCode: string) => Promise<void>;
  joinPublicRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  startGame: () => Promise<void>;
  moveToNextQuestion: () => Promise<void>;
  endGame: () => Promise<void>;
  fetchPublicRooms: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  debugMatchmakingStatus: () => Promise<void>;
  checkAndStartGame: () => Promise<void>;
} => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();
  const { teacher } = useTenant();
  
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
  const [categories, setCategories] = useState<string[]>(() => 
    loadFromStorage(STORAGE_KEYS.CATEGORIES, [])
  );

  // Ref to track current question index for real-time updates
  const currentQuestionIndexRef = useRef<number>(0);
  const hasProcessedCurrentQuestionRef = useRef<boolean>(false);
  
  // Refs to store interval IDs for cleanup
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const longPollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.GAME_STATE, gameState);
  }, [gameState]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ROOM, room);
    // Update ref when room changes
    if (room) {
      currentQuestionIndexRef.current = room.current_question_index || 0;
    }
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

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
  }, [categories]);

  // Save user ID to localStorage
  useEffect(() => {
    if (user) {
      saveToStorage(STORAGE_KEYS.USER_ID, user.id);
    }
  }, [user]);
  
  // Cleanup intervals when game state changes or component unmounts
  useEffect(() => {
    return () => {
      // Clear any active polling intervals
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (longPollIntervalRef.current) {
        clearInterval(longPollIntervalRef.current);
        longPollIntervalRef.current = null;
      }
    };
  }, [gameState]); // Re-run when game state changes

  // Helper function to load shuffled questions for a room
  const loadShuffledQuestions = useCallback(async (room: GameRoom) => {
    if (room.shuffled_questions && room.shuffled_questions.length > 0) {
      // Fetch the questions in the shuffled order
      const { data: roomQuestions, error: questionsError } = await supabase
        .from('multiplayer_quiz_questions')
        .select('*')
        .in('id', room.shuffled_questions);

      if (!questionsError && roomQuestions) {
        // Sort the questions according to the shuffled order
        const orderedQuestions = room.shuffled_questions.map(id => 
          roomQuestions.find(q => q.id === id)
        ).filter(Boolean).map(q => ({
          id: q!.id,
          question: q!.question,
          options: Array.isArray(q!.options) ? q!.options : JSON.parse(q!.options as string),
          correct_answer: q!.correct_answer,
          difficulty: q!.difficulty,
          time_limit: q!.time_limit,
          category: q!.category
        }));
        
        setQuestions(orderedQuestions);
        return true;
      }
    }
    return false;
  }, []);

  // Helper function to create shuffled questions for quick match rooms
  const createShuffledQuestionsForQuickMatch = useCallback(async (room: GameRoom) => {
    try {
      console.log('Creating shuffled questions for quick match room:', room.id, 'category:', room.category);
      
      // Load questions for the category
      let query = supabase
        .from('multiplayer_quiz_questions')
        .select('*');

      // Filter by instructor_id if we have a tenant teacher, otherwise fetch all questions
      if (teacher?.user_id) {
        console.log('Filtering questions by tenant teacher:', teacher.user_id);
        query = query.eq('instructor_id', teacher.user_id);
      } else {
        console.log('No tenant teacher found, fetching all questions');
      }

      if (room.category) {
        query = query.eq('category', room.category);
      }

      const { data: allQuestions, error: questionsError } = await query;
      if (questionsError) {
        console.error('Database error loading questions:', questionsError);
        throw questionsError;
      }

      console.log('Found questions in database:', allQuestions?.length || 0);

      if (!allQuestions || allQuestions.length === 0) {
        console.error('No questions available for category:', room.category);
        return;
      }

      // For quick match (1v1), use random question count between 5-15
      const questionsToUse = Math.max(5, Math.min(15, Math.floor(Math.random() * 11) + 5));
      console.log('Will use', questionsToUse, 'questions out of', allQuestions.length);
      
      // Shuffle the questions and take the specified number
      const shuffledQuestions = allQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, questionsToUse)
        .map(q => ({
          id: q.id,
          question: q.question,
          options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
          correct_answer: q.correct_answer,
          difficulty: q.difficulty,
          time_limit: q.time_limit,
          category: q.category
        }));

      console.log('🎯 Created shuffled questions for quick match:', shuffledQuestions.length);
      console.log('📝 First question:', shuffledQuestions[0]?.question?.substring(0, 50) + '...');
      console.log('💾 Setting questions state with', shuffledQuestions.length, 'questions');
      
      // Return a promise that resolves when questions are set
      return new Promise<void>((resolve) => {
        setQuestions(shuffledQuestions);
        // Use a small timeout to ensure state is updated
        setTimeout(() => {
          console.log('✅ Questions state updated:', questions.length);
          resolve();
        }, 100);
      });
        
    } catch (error) {
      console.error('Error creating shuffled questions for quick match:', error);
      // Try to show a more user-friendly error
      console.error('Failed to load questions for quick match. This might be a database connection issue.');
    }
  }, [teacher?.user_id]);

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
             } else {
               // Try to load shuffled questions first, fallback to category questions
               if (!(await loadShuffledQuestions(roomExists))) {
                 await loadQuestions(roomExists.category);
               }
             }
           } else if (roomExists.status === 'waiting') {
             // Room is waiting, try to load shuffled questions first
             if (!(await loadShuffledQuestions(roomExists))) {
               await loadQuestions(roomExists.category);
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
  }, [user, toast, loadShuffledQuestions]);

  // Load questions by category
  const loadQuestions = useCallback(async (category?: string) => {
    console.log('loadQuestions called for category:', category);
    
    try {
      let query = supabase
        .from('multiplayer_quiz_questions')
        .select('*');

      // Filter by instructor_id if we have a tenant teacher, otherwise fetch all questions
      if (teacher?.user_id) {
        console.log('Filtering questions by tenant teacher:', teacher.user_id);
        query = query.eq('instructor_id', teacher.user_id);
      } else {
        console.log('No tenant teacher found, fetching all questions');
      }

      // Always filter by category if provided, including 'General'
      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      console.log('Questions loaded from DB:', data?.length || 0);

      const formattedQuestions: Question[] = data.map(q => ({
        id: q.id,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
        correct_answer: q.correct_answer,
        difficulty: q.difficulty,
        time_limit: q.time_limit,
        category: q.category
      }));

      // Don't shuffle here - questions will be shuffled at room creation time
      // and stored in the room's shuffled_questions field
      console.log('Setting questions state:', formattedQuestions.length);
      setQuestions(formattedQuestions);
    } catch (error: unknown) {
      console.error('Error loading questions:', error);
    }
  }, [teacher?.user_id]);

  // Create room
  const createRoom = useCallback(async (maxPlayers: number, isPublic: boolean, category?: string, questionCount?: number) => {
    if (!user) return;

    try {
      // First, load questions for the category to get the full list
      let query = supabase
        .from('multiplayer_quiz_questions')
        .select('*');

      // Filter by instructor_id if we have a tenant teacher, otherwise fetch all questions
      if (teacher?.user_id) {
        console.log('Filtering questions by tenant teacher:', teacher.user_id);
        query = query.eq('instructor_id', teacher.user_id);
      } else {
        console.log('No tenant teacher found, fetching all questions');
      }

      if (category) {
        query = query.eq('category', category);
      }

      const { data: allQuestions, error: questionsError } = await query;
      if (questionsError) throw questionsError;

      if (!allQuestions || allQuestions.length === 0) {
        toast({
          title: 'No Questions Available',
          description: `No questions found for category: ${category || 'General'}`,
          variant: 'destructive',
        });
        return;
      }

      // Determine the number of questions to use
      const maxAvailableQuestions = allQuestions.length;
      let questionsToUse: number;
      
      if (questionCount) {
        questionsToUse = Math.min(questionCount, maxAvailableQuestions);
      } else if (maxPlayers === 2) {
        // For 1v1 games (quick match), use random question count between 5-15
        questionsToUse = Math.max(5, Math.min(15, Math.floor(Math.random() * 11) + 5));
      } else {
        questionsToUse = Math.min(10, maxAvailableQuestions);
      }

      // Shuffle the questions and take the specified number
      const shuffledQuestions = allQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, questionsToUse)
        .map(q => ({
          id: q.id,
          question: q.question,
          options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
          correct_answer: q.correct_answer,
          difficulty: q.difficulty,
          time_limit: q.time_limit,
          category: q.category
        }));

      // Extract just the question IDs in the shuffled order
      const shuffledQuestionIds = shuffledQuestions.map(q => q.id);

      // Generate 4-digit room code
      const roomCode = Math.floor(1000 + Math.random() * 9000).toString();
      
      const { data: newRoom, error } = await supabase
        .from('quiz_rooms')
        .insert({
          max_players: maxPlayers,
          is_public: isPublic,
          room_code: roomCode,
          created_by: user.id,
          status: 'waiting',
          category: category || 'General',
          shuffled_questions: shuffledQuestionIds // Store the shuffled question order
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
      
      // Set the shuffled questions for this room
      setQuestions(shuffledQuestions);
      
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
      
      const isQuickMatch = maxPlayers === 2 && !questionCount;
      toast({
        title: 'Room Created',
        description: `Room code: ${roomCode}. Category: ${category || 'All Categories'}. Questions: ${questionsToUse}${isQuickMatch ? ' (random)' : ''}`,
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
  }, [user, teacher?.user_id, toast]);

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

      // Cast to GameRoom type to access shuffled_questions
      const typedRoom = targetRoom as GameRoom;

      // Check if room is full
      const { count } = await supabase
        .from('quiz_room_players')
        .select('*', { count: 'exact' })
        .eq('room_id', typedRoom.id);

      if (count && count >= typedRoom.max_players) {
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
          room_id: typedRoom.id,
          user_id: user.id,
          username: user.full_name || user.email
        });

      if (joinError) throw joinError;

      setRoom(typedRoom);
      setGameState('matched');
      
      // Load the shuffled questions for this specific room
      if (!(await loadShuffledQuestions(typedRoom))) {
        // Fallback: load questions for the room's category
        await loadQuestions(typedRoom.category);
      }
      
      // Fetch players after joining room
      try {
        const { data: playerData, error: playerError } = await supabase
          .from('quiz_room_players')
          .select('*')
          .eq('room_id', typedRoom.id)
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
  }, [user, toast, loadQuestions, loadShuffledQuestions]);

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

      // Cast to GameRoom type to access shuffled_questions
      const typedRoom = targetRoom as GameRoom;

      // Join the room
      const { error: joinError } = await supabase
        .from('quiz_room_players')
        .insert({
          room_id: typedRoom.id,
          user_id: user.id,
          username: user.full_name || user.email
        });

      if (joinError) throw joinError;

      setRoom(typedRoom);
      setGameState('matched');
      
      // Load the shuffled questions for this specific room
      if (!(await loadShuffledQuestions(typedRoom))) {
        // Fallback: load questions for the room's category
        await loadQuestions(typedRoom.category);
      }
      
      // Fetch players after joining room
      try {
        const { data: playerData, error: playerError } = await supabase
          .from('quiz_room_players')
          .select('*')
          .eq('room_id', typedRoom.id)
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
  }, [user, toast, loadQuestions, loadShuffledQuestions]);

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

  // Fetch available categories
  const fetchCategories = useCallback(async () => {
    try {
      let query = supabase
        .from('multiplayer_quiz_questions')
        .select('category')
        .order('category');

      // Filter by instructor_id if we have a tenant teacher, otherwise fetch all categories
      if (teacher?.user_id) {
        console.log('Filtering categories by tenant teacher:', teacher.user_id);
        query = query.eq('instructor_id', teacher.user_id);
      } else {
        console.log('No tenant teacher found, fetching all categories');
      }

      const { data, error } = await query;

      if (error) throw error;

      const uniqueCategories = [...new Set(data.map(item => item.category))];
      setCategories(uniqueCategories);
    } catch (error: unknown) {
      console.error('Error fetching categories:', error);
    }
  }, [teacher?.user_id]);

  // Find match and join queue
  const findMatch = useCallback(async (category?: string) => {
    if (!user) return;

    try {
      console.log('Starting matchmaking for category:', category || 'General');
      setGameState('finding');
      
      // Call the matchmaking edge function
      const requestBody = {
        action: 'find_match',
        userId: user.id,
        username: user.full_name || user.email,
        category: category || 'General'
      };
      
      console.log('Calling edge function with:', requestBody);
      
      const { data, error } = await supabase.functions.invoke('matchmaking', {
        body: requestBody
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error('Failed to connect to matchmaking service');
      }

      console.log('Matchmaking response:', data);

      if (data.matched) {
        // User was immediately matched
        console.log('Immediate match found:', data);
        
        // Check if the game is already started (quick match auto-start)
        if (data.room && data.room.status === 'started') {
          console.log('Immediate match - game already started for quick match:', data.room);
          
          // For quick match, create shuffled questions since the room doesn't have them
          // IMPORTANT: Load questions BEFORE setting game state to countdown
          await createShuffledQuestionsForQuickMatch(data.room);
          
          // Fetch players
          const { data: playerData } = await supabase
            .from('quiz_room_players')
            .select('*')
            .eq('room_id', data.room.id)
            .order('score', { ascending: false });

          if (playerData) {
            setPlayers(playerData);
          }

          // Only set room and countdown state AFTER questions are loaded
          setRoom(data.room);
          setGameState('countdown');

          toast({
            title: 'Game Starting!',
            description: 'Your opponent is ready! The game will begin in 3 seconds...',
          });
        } else {
          // Game not started yet, transition to matched state
          setRoom(data.room);
          setGameState('matched');
          
          // For quick match rooms (1v1), always use createShuffledQuestionsForQuickMatch
          // For regular rooms, use loadQuestions
          if (data.room.max_players === 2) {
            // This is a quick match room, create shuffled questions
            console.log('Quick match room - creating shuffled questions for matched state');
            await createShuffledQuestionsForQuickMatch(data.room);
            
            // CRITICAL FIX: For quick match rooms, we need to auto-start the game
            // since the matchmaking function sets status to 'started' but returns 'waiting'
            console.log('Auto-starting quick match game...');
            
            // Update the room status to 'started' to trigger auto-start
            const { error: updateError } = await supabase
              .from('quiz_rooms')
              .update({ 
                status: 'started',
                current_question_index: 0,
                question_start_time: new Date().toISOString()
              })
              .eq('id', data.room.id);
            
            if (updateError) {
              console.error('Error updating room status:', updateError);
            } else {
              console.log('Room status updated to started, game will auto-start');
              // Directly start the game instead of waiting for room subscription
              console.log('Directly transitioning to countdown state...');
              setGameState('countdown');
            }
          } else {
            // This is a regular room, load questions for the category
            console.log('Regular room - loading questions for category:', data.room.category);
            await loadQuestions(data.room.category);
          }
          
          // Fetch players
          const { data: playerData } = await supabase
            .from('quiz_room_players')
            .select('*')
            .eq('room_id', data.room.id)
            .order('score', { ascending: false });

          if (playerData) {
            setPlayers(playerData);
          }

          toast({
            title: 'Match Found!',
            description: `You've been matched with ${data.matchDetails?.opponent || 'an opponent'} in ${data.room.category || 'General'}!`,
          });
        }
      } else {
        // User is in queue, start polling for matches
        console.log('User added to queue, starting polling...');
        toast({
          title: 'Finding Match',
          description: `Looking for opponent in ${category || 'General'}...`,
        });
        
        // Start polling for matches with shorter intervals initially
        let pollCount = 0;
        
        // Store interval ID in ref for cleanup
        pollIntervalRef.current = setInterval(async () => {
          try {
            pollCount++;
            console.log(`Polling for match (attempt ${pollCount})...`);
            
            const { data: checkData, error: checkError } = await supabase.functions.invoke('matchmaking', {
              body: {
                action: 'check_match',
                userId: user.id
              }
            });

            if (checkError) {
              console.error('Error checking match:', checkError);
              return;
            }

            console.log('Check match response:', checkData);

            if (checkData.matched) {
              console.log('Match found during polling:', checkData);
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
              
              // Check if the game is already started (quick match auto-start)
              if (checkData.room && checkData.room.status === 'started') {
                console.log('Game already started for quick match:', checkData.room);
                
                // For quick match, create shuffled questions since the room doesn't have them
                // IMPORTANT: Load questions BEFORE setting game state to countdown
                await createShuffledQuestionsForQuickMatch(checkData.room);
                
                // Fetch players
                const { data: playerData } = await supabase
                  .from('quiz_room_players')
                  .select('*')
                  .eq('room_id', checkData.room.id)
                  .order('score', { ascending: false });

                if (playerData) {
                  setPlayers(playerData);
                }

                // Only set room and countdown state AFTER questions are loaded
                // Wait a bit to ensure questions state is updated
                await new Promise(resolve => setTimeout(resolve, 100));
                
                if (questions.length > 0) {
                  console.log('✅ Questions loaded successfully, transitioning to countdown');
                  setRoom(checkData.room);
                  setGameState('countdown');
                } else {
                  console.error('❌ Failed to load questions, staying in matched state');
                  setRoom(checkData.room);
                  setGameState('matched');
                  toast({
                    title: 'Error',
                    description: 'Failed to load questions for quick match',
                    variant: 'destructive',
                  });
                }

                toast({
                  title: 'Game Starting!',
                  description: 'Your opponent is ready! The game will begin in 3 seconds...',
                });
                
                // Stop all polling since game is starting
                return;
              } else {
                // Game not started yet, transition to matched state
                setRoom(checkData.room);
                setGameState('matched');
                
                // For quick match rooms (1v1), always use createShuffledQuestionsForQuickMatch
                // For regular rooms, use loadQuestions
                if (checkData.room.max_players === 2) {
                  // This is a quick match room, create shuffled questions
                  console.log('Quick match room - creating shuffled questions for matched state');
                  await createShuffledQuestionsForQuickMatch(checkData.room);
                  
                  // CRITICAL FIX: For quick match rooms, we need to auto-start the game
                  console.log('Auto-starting quick match game...');
                  
                  // Update the room status to 'started' to trigger auto-start
                  const { error: updateError } = await supabase
                    .from('quiz_rooms')
                    .update({ 
                      status: 'started',
                      current_question_index: 0,
                      question_start_time: new Date().toISOString()
                    })
                    .eq('id', checkData.room.id);
                  
                  if (updateError) {
                    console.error('Error updating room status:', updateError);
                  } else {
                    console.log('Room status updated to started, game will auto-start');
                    // Directly start the game instead of waiting for room subscription
                    console.log('Directly transitioning to countdown state...');
                    setGameState('countdown');
                  }
                } else {
                  // This is a regular room, load questions for the category
                  console.log('Regular room - loading questions for category:', checkData.room.category);
                  await loadQuestions(checkData.room.category);
                }
                
                // Fetch players
                const { data: playerData } = await supabase
                  .from('quiz_room_players')
                  .select('*')
                  .eq('room_id', checkData.room.id)
                  .order('score', { ascending: false });

                if (playerData) {
                  setPlayers(playerData);
                }

                toast({
                  title: 'Match Found!',
                  description: `You've been matched with an opponent in ${checkData.room.category || 'General'}!`,
                });
                
                // Stop all polling since match is found
                return;
              }
            }
            
            // Check if room status has changed to 'started' (game auto-started)
            if (checkData.room && checkData.room.status === 'started') {
              console.log('Game auto-started during polling:', checkData.room);
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
              
              // Set the room and transition to countdown state
              setRoom(checkData.room);
              setGameState('countdown');
              
              // For quick match, create shuffled questions since the room doesn't have them
              await createShuffledQuestionsForQuickMatch(checkData.room);
              
              // Fetch players
              const { data: playerData } = await supabase
                .from('quiz_room_players')
                .select('*')
                .eq('room_id', checkData.room.id)
                .order('score', { ascending: false });

              if (playerData) {
                setPlayers(playerData);
              }

              toast({
                title: 'Game Starting!',
                description: 'Your opponent is ready! The game will begin in 3 seconds...',
              });
              
              // Stop all polling since game is starting
              return;
            }
            
            // Increase polling interval after first few attempts
            if (pollCount >= 3) {
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
              // Switch to longer interval
              longPollIntervalRef.current = setInterval(async () => {
                try {
                  const { data: checkData, error: checkError } = await supabase.functions.invoke('matchmaking', {
                    body: {
                      action: 'check_match',
                      userId: user.id
                    }
                  });

                  if (checkError) {
                    console.error('Error checking match:', checkError);
                    return;
                  }

                  if (checkData.matched) {
                    if (longPollIntervalRef.current) {
                      clearInterval(longPollIntervalRef.current);
                      longPollIntervalRef.current = null;
                    }
                    
                    // Check if the game is already started (quick match auto-start)
                    if (checkData.room && checkData.room.status === 'started') {
                      console.log('Game already started for quick match during long polling:', checkData.room);
                      
                                    // For quick match, create shuffled questions since the room doesn't have them
              // IMPORTANT: Load questions BEFORE setting game state to countdown
              await createShuffledQuestionsForQuickMatch(checkData.room);
              
              // Wait a bit to ensure questions state is updated
              await new Promise(resolve => setTimeout(resolve, 100));
              
              if (questions.length > 0) {
                console.log('✅ Questions loaded successfully, transitioning to countdown');
                setRoom(checkData.room);
                setGameState('countdown');
              } else {
                console.error('❌ Failed to load questions, staying in matched state');
                setRoom(checkData.room);
                setGameState('matched');
                toast({
                  title: 'Error',
                  description: 'Failed to load questions for quick match',
                  variant: 'destructive',
                });
              }
                      
                      // Fetch players
                      const { data: playerData } = await supabase
                        .from('quiz_room_players')
                        .select('*')
                        .eq('room_id', checkData.room.id)
                        .order('score', { ascending: false });

                      if (playerData) {
                        setPlayers(playerData);
                      }

                      toast({
                        title: 'Game Starting!',
                        description: 'Your opponent is ready! The game will begin in 3 seconds...',
                      });
                      
                      // Stop all polling since game is starting
                      return;
                    } else {
                      // Game not started yet, transition to matched state
                      setRoom(checkData.room);
                      setGameState('matched');
                      
                      // For quick match rooms (1v1), always use createShuffledQuestionsForQuickMatch
                      // For regular rooms, use loadQuestions
                      if (checkData.room.max_players === 2) {
                        // This is a quick match room, create shuffled questions
                        console.log('Quick match room - creating shuffled questions for matched state');
                        await createShuffledQuestionsForQuickMatch(checkData.room);
                        
                        // CRITICAL FIX: For quick match rooms, we need to auto-start the game
                        console.log('Auto-starting quick match game...');
                        
                        // Update the room status to 'started' to trigger auto-start
                        const { error: updateError } = await supabase
                          .from('quiz_rooms')
                          .update({ 
                            status: 'started',
                            current_question_index: 0,
                            question_start_time: new Date().toISOString()
                          })
                          .eq('id', checkData.room.id);
                        
                        if (updateError) {
                          console.error('Error updating room status:', updateError);
                        } else {
                          console.log('Room status updated to started, game will auto-start');
                          // The room subscription will detect this change and start the game
                        }
                      } else {
                        // This is a regular room, load questions for the category
                        console.log('Regular room - loading questions for category:', checkData.room.category);
                        await loadQuestions(checkData.room.category);
                      }
                      
                      const { data: playerData } = await supabase
                        .from('quiz_room_players')
                        .select('*')
                        .eq('room_id', checkData.room.id)
                        .order('score', { ascending: false });

                      if (playerData) {
                        setPlayers(playerData);
                      }

                      toast({
                        title: 'Match Found!',
                        description: `You've been matched with an opponent in ${checkData.room.category || 'General'}!`,
                      });
                      
                      // Stop all polling since match is found
                      return;
                    }
                  }
                  
                  // Check if room status has changed to 'started' (game auto-started)
                  if (checkData.room && checkData.room.status === 'started') {
                    console.log('Game auto-started during long polling:', checkData.room);
                    if (longPollIntervalRef.current) {
                      clearInterval(longPollIntervalRef.current);
                      longPollIntervalRef.current = null;
                    }
                    
                    // For quick match, create shuffled questions since the room doesn't have them
                    // IMPORTANT: Load questions BEFORE setting game state to countdown
                    await createShuffledQuestionsForQuickMatch(checkData.room);
                    
                    // Wait a bit to ensure questions state is updated
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    if (questions.length > 0) {
                      console.log('✅ Questions loaded successfully, transitioning to countdown');
                      setRoom(checkData.room);
                      setGameState('countdown');
                    } else {
                      console.error('❌ Failed to load questions, staying in matched state');
                      setRoom(checkData.room);
                      setGameState('matched');
                      toast({
                        title: 'Error',
                        description: 'Failed to load questions for quick match',
                        variant: 'destructive',
                      });
                    }
                    
                    // Fetch players
                    const { data: playerData } = await supabase
                      .from('quiz_room_players')
                      .select('*')
                      .eq('room_id', checkData.room.id)
                      .order('score', { ascending: false });

                    if (playerData) {
                      setPlayers(playerData);
                    }

                    toast({
                      title: 'Game Starting!',
                      description: 'Your opponent is ready! The game will begin in 3 seconds...',
                    });
                    
                    // Stop all polling since game is starting
                    return;
                  }
                } catch (error) {
                  console.error('Error in long polling:', error);
                }
              }, 3000); // Check every 3 seconds
            }
          } catch (error) {
            console.error('Error checking match:', error);
          }
        }, 1000); // Check every 1 second initially
      }
    } catch (error: unknown) {
      console.error('Error finding match:', error);
      toast({
        title: 'Error',
        description: 'Failed to find match',
        variant: 'destructive',
      });
      setGameState('idle');
    }
  }, [user, toast, loadQuestions]);

  // Cancel matchmaking
  const cancelMatch = useCallback(async () => {
    if (!user) return;

    try {
      // Clear any active polling intervals
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (longPollIntervalRef.current) {
        clearInterval(longPollIntervalRef.current);
        longPollIntervalRef.current = null;
      }

      // Call the matchmaking edge function to cancel
      await supabase.functions.invoke('matchmaking', {
        body: {
          action: 'cancel_match',
          userId: user.id
        }
      });

      setGameState('idle');
      toast({
        title: 'Match Cancelled',
        description: 'Stopped looking for players',
      });
    } catch (error: unknown) {
      console.error('Error cancelling match:', error);
    }
  }, [user, toast]);

  // Function to manually check and start game if needed
  const checkAndStartGame = useCallback(async () => {
    if (!room || !user) return;
    
    try {
      console.log('=== Checking and Starting Game ===');
      
      // Get current room status
      const { data: roomData, error: roomError } = await supabase
        .from('quiz_rooms')
        .select('*')
        .eq('id', room.id)
        .single();
      
      if (roomError) {
        console.error('Error getting room data:', roomError);
        return;
      }
      
      console.log('Current room status:', roomData.status);
      
      if (roomData.status === 'started' && gameState === 'matched') {
        console.log('Room is started but game state is matched. Transitioning to countdown...');
        setGameState('countdown');
        
        // Load questions and start countdown
        await loadQuestions(roomData.category);
        
        setTimeout(() => {
          setGameState('playing');
          if (questions.length > 0) {
            setCurrentQuestion(questions[0]);
            setTimeLeft(questions[0].time_limit);
          }
        }, 3000);
      } else if (roomData.status === 'waiting') {
        console.log('Room is still waiting. Starting game manually...');
        
        // Manually start the game
        const { error: startError } = await supabase
          .from('quiz_rooms')
          .update({ 
            status: 'started',
            current_question_index: 0,
            question_start_time: new Date().toISOString()
          })
          .eq('id', room.id);
        
        if (startError) {
          console.error('Error starting game manually:', startError);
        } else {
          console.log('Game started manually');
          setGameState('countdown');
          
          // Load questions and start countdown
          await loadQuestions(roomData.category);
          
          setTimeout(() => {
            setGameState('playing');
            if (questions.length > 0) {
              setCurrentQuestion(questions[0]);
              setTimeLeft(questions[0].time_limit);
            }
          }, 3000);
        }
      }
      
      console.log('=== End Check and Start ===');
    } catch (error) {
      console.error('Error in checkAndStartGame:', error);
    }
  }, [room, user, gameState, questions, loadQuestions]);

  // Debug function to check current matchmaking status
  const debugMatchmakingStatus = useCallback(async () => {
    if (!user) return;

    try {
      console.log('=== DEBUG: Current Matchmaking Status ===');
      
      // Check current game state
      console.log('Frontend game state:', gameState);
      console.log('Current room:', room);
      console.log('Current players:', players);
      
      // Check database queue status
      const { data: queueData, error: queueError } = await supabase
        .from('matchmaking_queue')
        .select('*')
        .eq('user_id', user.id);
      
      console.log('Queue status:', queueData, 'Error:', queueError);
      
      // Check if user is in any room
      if (room) {
        const { data: roomPlayers, error: playersError } = await supabase
          .from('quiz_room_players')
          .select('*')
          .eq('room_id', room.id);
        
        console.log('Room players:', roomPlayers, 'Error:', playersError);
        
        // Check room status
        const { data: roomData, error: roomError } = await supabase
          .from('quiz_rooms')
          .select('*')
          .eq('id', room.id)
          .single();
        
        console.log('Room status:', roomData, 'Error:', roomError);
      }
      
      console.log('=== END DEBUG ===');
    } catch (error) {
      console.error('Debug error:', error);
    }
  }, [user, gameState, room, players]);

  // Submit answer
  const submitAnswer = useCallback(async (answer: string) => {
    if (!room || !currentQuestion || !user) return;

    try {
      const answerTime = currentQuestion.time_limit - timeLeft;
      const isCorrect = answer === currentQuestion.correct_answer;
      const points = isCorrect ? Math.max(10, Math.floor((timeLeft / currentQuestion.time_limit) * 100)) : 0;
      
      console.log('Score calculation:', {
        answer,
        correctAnswer: currentQuestion.correct_answer,
        isCorrect,
        timeLeft,
        timeLimit: currentQuestion.time_limit,
        points,
        currentPlayerScore: players.find(p => p.user_id === user.id)?.score || 0
      });

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
        const newScore = currentPlayer.score + points;
        const newStreak = isCorrect ? currentPlayer.streak + 1 : 0;
        const newXp = currentPlayer.xp_earned + Math.floor(points / 10);
        
        console.log('Updating player score:', {
          userId: user.id,
          oldScore: currentPlayer.score,
          pointsEarned: points,
          newScore,
          oldStreak: currentPlayer.streak,
          newStreak,
          oldXp: currentPlayer.xp_earned,
          newXp
        });
        
        await supabase
          .from('quiz_room_players')
          .update({ 
            score: newScore,
            streak: newStreak,
            xp_earned: newXp
          })
          .eq('room_id', room.id)
          .eq('user_id', user.id);
      } else {
        console.error('Current player not found in players list:', { userId: user.id, players });
      }

      setSelectedAnswer(answer);

      // The dedicated effect will automatically check if all players have answered
      // and move to the next question immediately
      console.log('Answer submitted, waiting for other players or timer to complete');
    } catch (error: unknown) {
      console.error('Error submitting answer:', error);
    }
  }, [room, currentQuestion, user, timeLeft, players]);

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
              // Update total_xp in profiles for all players
      for (const player of finalPlayers) {
        if (player.xp_earned > 0 && room?.category) {
          try {
            const result = await updateUserXP(player.user_id, room.category, player.xp_earned);
            if (result.error) {
              console.error(`Error updating XP for user ${player.user_id}:`, result.error);
            } else {
              console.log(`Updated XP for user ${player.user_id}: +${player.xp_earned} XP in ${room.category}`);
            }
          } catch (xpError) {
            console.error(`Error updating XP for user ${player.user_id}:`, xpError);
          }
        }
      }

        setFinalResults(finalPlayers);
        setShowResults(true);
        setGameState('results');
      }
    } catch (error) {
      console.error('Error ending game:', error);
    }
  }, [room]);

  // Move to next question
  const moveToNextQuestion = useCallback(async () => {
    console.log('moveToNextQuestion called', { room, questions: questions.length, gameState });
    
    if (!room) {
      console.log('No room, returning');
      return;
    }
    
    // Ensure questions are loaded for this room's category
    if (questions.length === 0) {
      console.log('No questions loaded, loading for category:', room.category);
      await loadQuestions(room.category);
      // Wait a bit for state to update
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!questions.length) {
      console.log('Still no questions after loading, returning');
      return;
    }

    const currentIndex = room.current_question_index || 0;
    const nextIndex = currentIndex + 1;
    
    console.log('Moving to next question', { currentIndex, nextIndex, totalQuestions: questions.length });

    if (nextIndex >= questions.length) {
      // Game is complete, show results
      console.log('Game complete, ending game');
      await endGame();
    } else {
      // Move to next question
      console.log('Updating room to next question index:', nextIndex);
      const { error } = await supabase
        .from('quiz_rooms')
        .update({
          current_question_index: nextIndex,
          question_start_time: new Date().toISOString()
        })
        .eq('id', room.id);

      if (!error) {
        console.log('Room updated successfully from timer, setting next question');
        // Reset state for next question
        setSelectedAnswer(null);
        setShowResults(false);
        setGameState('countdown');
        
        // Reset the processed flag for the new question
        hasProcessedCurrentQuestionRef.current = false;
        
        // Update local room state immediately
        setRoom(prev => prev ? { ...prev, current_question_index: nextIndex } : null);
        
        setTimeout(() => {
          setGameState('playing');
          const nextQuestion = questions[nextIndex];
          if (nextQuestion) {
            setCurrentQuestion(nextQuestion);
            setTimeLeft(nextQuestion.time_limit);
            console.log('Timer-based question progression complete:', { nextIndex, timeLimit: nextQuestion.time_limit });
          } else {
            console.error('Question not found at index:', nextIndex);
            setGameState('matched');
          }
        }, 3000);
      } else {
        console.error('Error updating room:', error);
      }
    }
  }, [room, questions, loadQuestions, endGame]);

  // Timer effect
  useEffect(() => {
    console.log('Timer effect triggered', { timeLeft, gameState, hasMoveToNextQuestion: !!moveToNextQuestion });
    
    if (timeLeft > 0 && gameState === 'playing') {
      console.log('Starting timer countdown from:', timeLeft);
      const timer = setTimeout(() => {
        const newTimeLeft = timeLeft - 1;
        console.log('Timer tick, timeLeft:', newTimeLeft);
        setTimeLeft(newTimeLeft);
      }, 1000);
      return () => {
        console.log('Clearing timer');
        clearTimeout(timer);
      };
    } else if (timeLeft === 0 && gameState === 'playing') {
      // Time's up, move to next question
      console.log('Time is up, calling moveToNextQuestion');
      moveToNextQuestion();
    }
  }, [timeLeft, gameState, moveToNextQuestion]);

  // Countdown timer effect for quick match auto-start
  useEffect(() => {
    if (gameState === 'countdown' && room) {
      console.log('🎯 COUNTDOWN TIMER ACTIVATED!', { 
        questionsLength: questions.length, 
        roomCategory: room.category,
        roomId: room.id,
        gameState,
        timestamp: new Date().toISOString()
      });
      
      // CRITICAL: Wait for questions to be loaded before starting countdown
      if (questions.length === 0) {
        console.log('❌ Questions not loaded yet, waiting for questions to load...');
        // Try to load questions if they're not loaded yet
        if (room.max_players === 2) {
          console.log('🔄 Creating shuffled questions for quick match...');
          createShuffledQuestionsForQuickMatch(room).then(() => {
            console.log('✅ Questions created and loaded');
          });
        }
        return; // Don't start countdown until questions are loaded
      }
      
      console.log('✅ Questions loaded, starting 3-second countdown...');
      const countdownTimer = setTimeout(() => {
        console.log('🎮 Countdown finished, starting game NOW!');
        
        // Double-check that questions are still available
        if (questions.length > 0) {
          console.log('🎯 Setting first question:', questions[0].id);
          setCurrentQuestion(questions[0]);
          setTimeLeft(questions[0].time_limit || 30);
          setGameState('playing');
          
          toast({
            title: 'Game Started!',
            description: 'The quiz is now beginning!',
          });
        } else {
          console.error('❌ No questions available to start game - this should not happen!');
          toast({
            title: 'Error',
            description: 'No questions available to start game',
            variant: 'destructive',
          });
          // Fallback to matched state if questions are missing
          setGameState('matched');
        }
      }, 3000); // 3 second countdown
      
      return () => {
        console.log('🧹 Clearing countdown timer');
        clearTimeout(countdownTimer);
      };
    }
  }, [gameState, room, questions, toast, createShuffledQuestionsForQuickMatch]);

  // Check if all players have answered and move to next question immediately
  useEffect(() => {
    if (gameState === 'playing' && room && currentQuestion && timeLeft > 0 && !hasProcessedCurrentQuestionRef.current) {
      const checkAllAnswered = async () => {
        try {
          const { count: answeredCount } = await supabase
            .from('quiz_room_answers')
            .select('*', { count: 'exact' })
            .eq('room_id', room.id)
            .eq('question_id', currentQuestion.id);

          const { count: totalPlayers } = await supabase
            .from('quiz_room_players')
            .select('*', { count: 'exact' })
            .eq('room_id', room.id);

          // If all players have answered, move to next question immediately
          if (answeredCount && totalPlayers && answeredCount >= totalPlayers) {
            console.log('All players have answered, moving to next question immediately', { answeredCount, totalPlayers });
            
            // Mark this question as processed to prevent multiple executions
            hasProcessedCurrentQuestionRef.current = true;
            
            // All players have answered, moving to next question silently
            
            // Move to next question immediately
            moveToNextQuestion();
          }
        } catch (error) {
          console.error('Error checking if all players answered:', error);
        }
      };

      // Check every 1 second if all players have answered
      const interval = setInterval(checkAllAnswered, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState, room, currentQuestion, timeLeft, moveToNextQuestion]);



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

    // Subscribe to matchmaking queue updates
    const matchmakingChannel = supabase
      .channel('matchmaking_queue')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'matchmaking_queue'
      }, async (payload) => {
        console.log('Matchmaking queue change:', payload);
        
        if (payload.eventType === 'UPDATE' && payload.new?.user_id === user.id) {
          const updatedEntry = payload.new;
          console.log('Matchmaking queue update for current user:', updatedEntry);
          
          if (updatedEntry.status === 'matched' && updatedEntry.room_id) {
            // User has been matched, get room details
            const { data: roomData } = await supabase
              .from('quiz_rooms')
              .select('*')
              .eq('id', updatedEntry.room_id)
              .single();
            
            if (roomData) {
              console.log('Match found via real-time update:', roomData);
              setRoom(roomData);
              setGameState('matched');
              
              // For quick match rooms (1v1), always use createShuffledQuestionsForQuickMatch
              // For regular rooms, use loadQuestions
              if (roomData.max_players === 2) {
                // This is a quick match room, create shuffled questions
                console.log('Quick match room - creating shuffled questions for matched state');
                await createShuffledQuestionsForQuickMatch(roomData);
                
                // CRITICAL FIX: For quick match rooms, we need to auto-start the game
                console.log('Auto-starting quick match game...');
                
                // Update the room status to 'started' to trigger auto-start
                const { error: updateError } = await supabase
                  .from('quiz_rooms')
                  .update({ 
                    status: 'started',
                    current_question_index: 0,
                    question_start_time: new Date().toISOString()
                  })
                  .eq('id', roomData.id);
                
                if (updateError) {
                  console.error('Error updating room status:', updateError);
                } else {
                  console.log('Room status updated to started, game will auto-start');
                  // Directly start the game instead of waiting for room subscription
                  console.log('Directly transitioning to countdown state...');
                  setGameState('countdown');
                }
              } else {
                // This is a regular room, load questions for the category
                console.log('Regular room - loading questions for category:', roomData.category);
                await loadQuestions(roomData.category);
              }
              
              // Fetch players
              const { data: playerData } = await supabase
                .from('quiz_room_players')
                .select('*')
                .eq('room_id', roomData.id)
                .order('score', { ascending: false });

              if (playerData) {
                setPlayers(playerData);
              }

              toast({
                title: 'Match Found!',
                description: `You've been matched with an opponent in ${roomData.category || 'General'}!`,
              });
            }
          }
        } else if (payload.eventType === 'INSERT' && payload.new?.user_id !== user.id) {
          // Another user joined the queue, check if we can match
          console.log('Another user joined queue:', payload.new);
          if (gameState === 'finding') {
            // Force a quick check for match
            setTimeout(async () => {
              try {
                const { data: checkData, error: checkError } = await supabase.functions.invoke('matchmaking', {
                  body: {
                    action: 'check_match',
                    userId: user.id
                  }
                });

                if (!checkError && checkData.matched) {
                  console.log('Match found after another user joined:', checkData);
                  setRoom(checkData.room);
                  setGameState('matched');
                  
                  // For quick match rooms (1v1), always use createShuffledQuestionsForQuickMatch
                  // For regular rooms, use loadQuestions
                  if (checkData.room.max_players === 2) {
                    // This is a quick match room, create shuffled questions
                    console.log('Quick match room - creating shuffled questions for matched state');
                    await createShuffledQuestionsForQuickMatch(checkData.room);
                    
                    // CRITICAL FIX: For quick match rooms, we need to auto-start the game
                    console.log('Auto-starting quick match game...');
                    
                    // Update the room status to 'started' to trigger auto-start
                    const { error: updateError } = await supabase
                      .from('quiz_rooms')
                      .update({ 
                        status: 'started',
                        current_question_index: 0,
                        question_start_time: new Date().toISOString()
                      })
                      .eq('id', checkData.room.id);
                    
                    if (updateError) {
                      console.error('Error updating room status:', updateError);
                    } else {
                      console.log('Room status updated to started, game will auto-start');
                      // Directly start the game instead of waiting for room subscription
                      console.log('Directly transitioning to countdown state...');
                      setGameState('countdown');
                    }
                  } else {
                    // This is a regular room, load questions for the category
                    console.log('Regular room - loading questions for category:', checkData.room.category);
                    await loadQuestions(checkData.room.category);
                  }
                  
                  const { data: playerData } = await supabase
                    .from('quiz_room_players')
                    .select('*')
                    .eq('room_id', checkData.room.id)
                    .order('score', { ascending: false });

                  if (playerData) {
                    setPlayers(playerData);
                  }

                  toast({
                    title: 'Match Found!',
                    description: `You've been matched with an opponent in ${checkData.room.category || 'General'}!`,
                  });
                }
              } catch (error) {
                console.error('Error checking match after user joined:', error);
              }
            }, 500); // Small delay to ensure database is updated
          }
        }
      })
      .subscribe();

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
            // Initial game start - check if this is a quick match room
            console.log('Room status changed to started via real-time update:', updatedRoom);
            
            // For quick match rooms, use the createShuffledQuestionsForQuickMatch function
            // For regular rooms, use loadShuffledQuestions
            if (updatedRoom.max_players === 2 && !updatedRoom.shuffled_questions) {
              // This is a quick match room, create shuffled questions
              console.log('Quick match room detected in real-time update, creating shuffled questions');
              await createShuffledQuestionsForQuickMatch(updatedRoom);
            } else {
              // This is a regular room, try to load shuffled questions
              console.log('Regular room detected, trying to load shuffled questions');
              if (!(await loadShuffledQuestions(updatedRoom))) {
                // Fallback: ensure questions are loaded for this room's category
                if (questions.length === 0) {
                  await loadQuestions(updatedRoom.category);
                }
              }
            }
            
            // Only proceed to countdown if questions are loaded
            if (questions.length > 0) {
              setGameState('countdown');
              
              // Reset the processed flag for the first question
              hasProcessedCurrentQuestionRef.current = false;
              
              // The countdown timer will handle starting the game
              console.log('Questions loaded, countdown will start automatically');
            } else {
              console.error('Failed to load questions for room, staying in matched state');
              toast({
                title: 'Error',
                description: 'Failed to load questions for this room',
                variant: 'destructive',
              });
            }
          } else if (updatedRoom.status === 'started' && gameState === 'playing') {
            // Question progression
            if (updatedRoom.current_question_index !== currentQuestionIndexRef.current) {
              console.log('Question progression detected', { 
                oldIndex: currentQuestionIndexRef.current, 
                newIndex: updatedRoom.current_question_index 
              });
              
              // Update the ref immediately
              currentQuestionIndexRef.current = updatedRoom.current_question_index;
              
              setSelectedAnswer(null);
              setShowResults(false);
              setGameState('countdown');
              
              // Reset the processed flag for the new question
              hasProcessedCurrentQuestionRef.current = false;
              
              // Ensure questions are loaded for this room's category
              if (questions.length === 0) {
                if (!(await loadShuffledQuestions(updatedRoom))) {
                  await loadQuestions(updatedRoom.category);
                }
              }
              
              setTimeout(() => {
                setGameState('playing');
                if (questions.length > 0) {
                  const questionIndex = updatedRoom.current_question_index || 0;
                  const nextQuestion = questions[questionIndex];
                  if (nextQuestion) {
                    setCurrentQuestion(nextQuestion);
                    setTimeLeft(nextQuestion.time_limit);
                  } else {
                    console.error('Question not found at index:', questionIndex);
                    setGameState('matched');
                  }
                } else {
                  // Fallback if questions still aren't loaded
                  setGameState('matched');
                  toast({
                    title: 'Error',
                    description: 'Failed to load questions for this category',
                    variant: 'destructive',
                  });
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
          
          // Update players list for INSERT, DELETE, and UPDATE events (including score updates)
          if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE' || payload.eventType === 'UPDATE') {
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
      supabase.removeChannel(matchmakingChannel);
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(answersChannel);
    };
  }, [user, room, gameState, questions, updatePlayersList, loadQuestions, loadShuffledQuestions]);

  // Start game (for room creator) - load questions based on room category
  const startGame = useCallback(async () => {
    if (!user || !room || room.created_by !== user.id) return;

    try {
      // Try to load shuffled questions first, fallback to category questions
      if (!(await loadShuffledQuestions(room))) {
        // Load questions for the room's category
        await loadQuestions(room.category);
      }

      // Check if we have enough questions to start the game
      if (questions.length === 0) {
        toast({
          title: 'Cannot Start Game',
          description: 'No questions available for this category. Please add some questions first.',
          variant: 'destructive',
        });
        return;
      }

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
  }, [user, room, toast, loadQuestions, questions.length, loadShuffledQuestions]);

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
      
      // Reset refs
      hasProcessedCurrentQuestionRef.current = false;
      currentQuestionIndexRef.current = 0;

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
  }, [user, room, gameState, toast, fetchPublicRooms]);

  // Initialize
  useEffect(() => {
    fetchCategories();
    fetchPublicRooms();
    
    // Refresh public rooms every 10 seconds
    const interval = setInterval(fetchPublicRooms, 10000);
    
    return () => clearInterval(interval);
  }, [fetchCategories, fetchPublicRooms]);

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

  // Ensure questions are loaded when in a room
  useEffect(() => {
    if (room && questions.length === 0) {
      // Load questions for the room's category if they're not already loaded
      loadQuestions(room.category);
    }
  }, [room, questions.length, loadQuestions]);

  // Debug timer state
  useEffect(() => {
    console.log('Timer state changed:', { timeLeft, gameState, currentQuestion: currentQuestion?.id });
  }, [timeLeft, gameState, currentQuestion]);

  // Debug questions state
  useEffect(() => {
    console.log('📊 Questions state changed:', { 
      questionsLength: questions.length, 
      gameState,
      hasQuestions: questions.length > 0,
      timestamp: new Date().toISOString()
    });
  }, [questions, gameState]);

  // Debug game state changes
  useEffect(() => {
    console.log('🎮 Game state changed:', { 
      from: gameState, 
      roomId: room?.id,
      roomStatus: room?.status,
      questionsLength: questions.length,
      timestamp: new Date().toISOString()
    });
  }, [gameState, room, questions]);

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
    categories,
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
    fetchPublicRooms,
    fetchCategories,
    debugMatchmakingStatus,
    checkAndStartGame
  };
};
