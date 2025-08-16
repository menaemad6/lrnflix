import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Key, 
  Eye,
  EyeOff,
  Trophy,
  Crown,
  Timer,
  Star,
  FolderOpen,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { GameRoom } from '@/hooks/useMultiplayerQuiz';
import { supabase } from '@/integrations/supabase/client';

interface MatchmakerEntry {
  id: string;
  user_id: string;
  username: string;
  status: string;
  category?: string;
  room_id?: string;
  created_at: string;
  updated_at: string;
}

interface MultiplayerQuizLobbyProps {
  gameState: string;
  publicRooms: GameRoom[];
  categories: string[];
  onFindMatch: (category?: string) => Promise<void>;
  onCancelMatch: () => Promise<void>;
  onCreateRoom: (maxPlayers: number, isPublic: boolean, category?: string, questionCount?: number) => Promise<GameRoom | undefined>;
  onJoinRoomByCode: (roomCode: string) => Promise<void>;
  onJoinPublicRoom: (roomId: string) => Promise<void>;
  onRefreshRooms: () => Promise<void>;
}

export const MultiplayerQuizLobby = ({ 
  gameState,
  onFindMatch, 
  onCancelMatch,
  publicRooms,
  onCreateRoom,
  onJoinRoomByCode,
  onJoinPublicRoom,
  onRefreshRooms
}: MultiplayerQuizLobbyProps) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isPublic, setIsPublic] = useState(true);
  const [roomCode, setRoomCode] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quickMatchCategory, setQuickMatchCategory] = useState<string>('General');
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [categoryQuestionCounts, setCategoryQuestionCounts] = useState<Record<string, number>>({});
  const [customQuestionCount, setCustomQuestionCount] = useState<string>('');
  const [activeMatchmakers, setActiveMatchmakers] = useState<number>(0);
  const [matchmakerCategories, setMatchmakerCategories] = useState<Record<string, number>>({});

  const isSearching = gameState === 'finding';

  useEffect(() => {
    fetchCategories();
    fetchActiveMatchmakers();
    
    // Set up real-time subscription for matchmakers
    const matchmakerChannel = supabase
      .channel('matchmaking_queue')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'matchmaking_queue'
      }, () => {
        fetchActiveMatchmakers();
      })
      .subscribe();

    return () => {
      matchmakerChannel.unsubscribe();
    };
  }, []);

  // Update question count when category changes
  useEffect(() => {
    if (selectedCategory !== 'all' && categoryQuestionCounts[selectedCategory]) {
      const maxQuestions = categoryQuestionCounts[selectedCategory];
      setQuestionCount(Math.min(questionCount, maxQuestions));
    }
  }, [selectedCategory, categoryQuestionCounts, questionCount]);

  const handleCreateModalOpen = (open: boolean) => {
    setCreateModalOpen(open);
    if (open) {
      // Reset question count to default when opening modal
      setQuestionCount(10);
      setCustomQuestionCount('');
    }
  };

  const fetchActiveMatchmakers = async () => {
    try {
      const { data, error } = await supabase
        .from('matchmaking_queue')
        .select('*')
        .eq('status', 'waiting');

      if (error) throw error;

      const totalMatchmakers = data?.length || 0;
      setActiveMatchmakers(totalMatchmakers);

      // Count matchmakers by category
      const categoryCounts: Record<string, number> = {};
      data?.forEach((matchmaker: MatchmakerEntry) => {
        const category = matchmaker.category || 'General';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      setMatchmakerCategories(categoryCounts);
    } catch (error) {
      console.error('Error fetching active matchmakers:', error);
    }
  };

  const getMatchmakerStatus = () => {
    if (activeMatchmakers === 0) return 'No one searching';
    
    const categoryEntries = Object.entries(matchmakerCategories);
    if (categoryEntries.length === 0) return 'Searching for matches...';
    
    const statusParts = categoryEntries.map(([category, count]) => 
      `${count} in ${category}`
    );
    
    return statusParts.join(', ');
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from('multiplayer_quiz_questions')
        .select('category')
        .order('category');

      if (error) throw error;

      const uniqueCategories = [...new Set(data?.map(q => q.category) || [])];
      setCategories(uniqueCategories);
      
      // Set initial quick match category to first available category
      if (uniqueCategories.length > 0 && quickMatchCategory === 'General') {
        setQuickMatchCategory(uniqueCategories[0]);
      }

      // Fetch question counts for each category
      const questionCounts: Record<string, number> = {};
      for (const category of uniqueCategories) {
        const { count, error: countError } = await supabase
          .from('multiplayer_quiz_questions')
          .select('*', { count: 'exact' })
          .eq('category', category);
        
        if (!countError) {
          questionCounts[category] = count || 0;
        }
      }
      setCategoryQuestionCounts(questionCounts);
    } catch (error: unknown) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCreateRoom = async () => {
    const category = selectedCategory === 'all' ? undefined : selectedCategory;
    await onCreateRoom(maxPlayers, isPublic, category, questionCount);
    setCreateModalOpen(false);
  };

  const handleJoinRoom = async () => {
    if (roomCode.length === 4) {
      await onJoinRoomByCode(roomCode);
      setJoinModalOpen(false);
      setRoomCode('');
    }
  };

  const getFilteredRooms = () => {
    if (selectedCategory === 'all') {
      return publicRooms;
    }
    return publicRooms.filter(room => room.category === selectedCategory);
  };

  const filteredRooms = getFilteredRooms();

  const getQuestionCountOptions = () => {
    if (selectedCategory === 'all') {
      // For 'all' category, sum up all available questions
      const totalQuestions = Object.values(categoryQuestionCounts).reduce((sum, count) => sum + count, 0);
      const halfQuestions = Math.floor(totalQuestions / 2);
      const randomQuestions = Math.floor(Math.random() * (totalQuestions - halfQuestions + 1)) + halfQuestions;
      
      return {
        maxQuestions: totalQuestions,
        halfQuestions,
        randomQuestions
      };
    } else {
      const maxQuestions = categoryQuestionCounts[selectedCategory] || 10;
      const halfQuestions = Math.floor(maxQuestions / 2);
      const randomQuestions = Math.floor(Math.random() * (maxQuestions - halfQuestions + 1)) + halfQuestions;
      
      return {
        maxQuestions,
        halfQuestions,
        randomQuestions
      };
    }
  };

  const getCategoryDisplayName = () => {
    if (selectedCategory === 'all') {
      return 'All Categories';
    }
    return selectedCategory;
  };

  const handleQuestionCountChange = (count: number) => {
    setQuestionCount(count);
    setCustomQuestionCount('');
  };

  const handleCustomQuestionCountChange = (value: string) => {
    setCustomQuestionCount(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      const options = getQuestionCountOptions();
      const validCount = Math.min(numValue, options.maxQuestions);
      setQuestionCount(validCount);
      if (validCount !== numValue) {
        setCustomQuestionCount(validCount.toString());
      }
    }
  };

  return (
    <div className="min-h-screen bg-background particle-bg p-4 pt-28">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Quiz Battle Arena</h1>
          <p className="text-muted-foreground text-lg">Test your knowledge against other players</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Actions - Left Side */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card border-border shadow-2xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl text-foreground">Join the Battle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Create Room Button */}
                <Dialog open={createModalOpen} onOpenChange={handleCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-lg shadow-lg hover:shadow-primary/25"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create Room
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Room</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="maxPlayers">Maximum Players</Label>
                        <div className="flex space-x-2 mt-2">
                          {[2, 3, 4, 5, 6].map((num) => (
                            <Button
                              key={num}
                              variant={maxPlayers === num ? "default" : "outline"}
                              className="flex-1"
                              onClick={() => setMaxPlayers(num)}
                            >
                              {num}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="category">Quiz Category</Label>
                        <Select
                          value={selectedCategory}
                          onValueChange={setSelectedCategory}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="questionCount">Number of Questions</Label>
                        <div className="space-y-3 mt-2">
                          {loadingCategories ? (
                            <div className="text-sm text-muted-foreground text-center py-4">
                              Loading question counts...
                            </div>
                          ) : (() => {
                            const options = getQuestionCountOptions();
                            return (
                              <>
                                <div className="text-sm text-muted-foreground mb-2">
                                  Available: {options.maxQuestions} questions
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <Button
                                    variant={questionCount === options.halfQuestions ? "default" : "outline"}
                                    className="text-sm"
                                    onClick={() => handleQuestionCountChange(options.halfQuestions)}
                                    disabled={options.maxQuestions === 0}
                                  >
                                    Half ({options.halfQuestions})
                                  </Button>
                                  <Button
                                    variant={questionCount === options.randomQuestions ? "default" : "outline"}
                                    className="text-sm"
                                    onClick={() => handleQuestionCountChange(options.randomQuestions)}
                                    disabled={options.maxQuestions === 0}
                                  >
                                    Random ({options.randomQuestions})
                                  </Button>
                                  <Button
                                    variant={questionCount === options.maxQuestions ? "default" : "outline"}
                                    className="text-sm"
                                    onClick={() => handleQuestionCountChange(options.maxQuestions)}
                                    disabled={options.maxQuestions === 0}
                                  >
                                    Max ({options.maxQuestions})
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      placeholder="Custom number"
                                      value={customQuestionCount}
                                      onChange={(e) => handleCustomQuestionCountChange(e.target.value)}
                                      className="flex-1"
                                      type="number"
                                      min="1"
                                      max={options.maxQuestions}
                                      disabled={options.maxQuestions === 0}
                                    />
                                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                                      Max: {options.maxQuestions}
                                    </span>
                                  </div>
                                  <div className="text-sm text-center text-muted-foreground">
                                    Selected: {questionCount} questions
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="isPublic" 
                          checked={isPublic}
                          onCheckedChange={setIsPublic}
                        />
                        <Label htmlFor="isPublic" className="flex items-center space-x-2">
                          {isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          <span>{isPublic ? 'Public Room' : 'Private Room'}</span>
                        </Label>
                      </div>
                      <Button 
                        onClick={handleCreateRoom} 
                        className="w-full"
                        disabled={loadingCategories || getQuestionCountOptions().maxQuestions === 0}
                      >
                        Create Room
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Join Room Button */}
                <Dialog open={joinModalOpen} onOpenChange={setJoinModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="w-full h-14 border-2 border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary font-semibold text-lg"
                    >
                      <Key className="h-5 w-5 mr-2" />
                      Join with Code
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Join Room</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="roomCode">Room Code</Label>
                        <Input
                          id="roomCode"
                          placeholder="Enter 4-digit code"
                          value={roomCode}
                          onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          className="text-center text-2xl font-mono tracking-widest"
                          maxLength={4}
                        />
                      </div>
                      <Button 
                        onClick={handleJoinRoom} 
                        className="w-full"
                        disabled={roomCode.length !== 4}
                      >
                        Join Room
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Separator className="bg-border" />

                {/* Quick Match */}
                {!isSearching ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="quickMatchCategory" className="text-sm font-medium">
                        Select Category for Quick Match
                      </Label>
                      <Select
                        value={quickMatchCategory}
                        onValueChange={setQuickMatchCategory}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => onFindMatch(quickMatchCategory)}
                      className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold"
                    >
                      <Users className="h-5 w-5 mr-2" />
                      Quick Match 1v1
                    </Button>
                    
                    {/* Live Matchmaker Indicator */}
                    <div className="mt-3 p-3 bg-background/50 border border-border/50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-muted-foreground">Live Matchmakers</span>
                        </div>
                        <span className="font-semibold text-primary">
                          {activeMatchmakers} online
                        </span>
                      </div>
                      {activeMatchmakers > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {getMatchmakerStatus()}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full"
                      />
                      <span className="text-foreground font-medium">
                        Finding opponent in {quickMatchCategory}...
                      </span>
                    </div>
                    <Button
                      onClick={onCancelMatch}
                      variant="outline"
                      className="border-destructive/20 bg-destructive/10 hover:bg-destructive/20 text-destructive"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Game Info */}
            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  How to Play
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground text-sm">
                <div className="flex items-start space-x-3">
                  <Badge className="bg-primary/20 text-primary min-w-fit">1</Badge>
                  <p>Create a room or join with a 4-digit code</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="bg-accent/20 text-accent min-w-fit">2</Badge>
                  <p>Wait for other players to join</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="bg-primary/20 text-primary min-w-fit">3</Badge>
                  <p>Answer questions as fast as possible</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="bg-accent/20 text-accent min-w-fit">4</Badge>
                  <p>Climb the leaderboard to victory!</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Public Rooms - Right Side */}
          <div className="lg:col-span-2">
            <Card className="glass-card border-border shadow-2xl h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    Public Rooms
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    {/* Category Filter */}
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/40">
                      {filteredRooms.length} Active
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredRooms.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-muted-foreground mb-4">
                      <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">
                        {selectedCategory === 'all' 
                          ? 'No public rooms available' 
                          : `No public rooms in ${selectedCategory}`
                        }
                      </p>
                      <p className="text-sm">Create one and invite your friends!</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 max-h-96 overflow-y-auto">
                    {filteredRooms.map((room) => (
                      <motion.div
                        key={room.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card/50 rounded-xl p-4 border border-border hover:border-primary/50 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                                <span className="text-primary-foreground font-bold">
                                  {room.room_code}
                                </span>
                              </div>
                              <div>
                                <p className="text-foreground font-medium">Room {room.room_code}</p>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <div className="flex items-center space-x-1">
                                    <Users className="h-4 w-4" />
                                    <span>{room.current_players}/{room.max_players}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Timer className="h-4 w-4" />
                                    <span>Waiting</span>
                                  </div>
                                  {room.category && (
                                    <div className="flex items-center space-x-1">
                                      <FolderOpen className="h-4 w-4" />
                                      <span>{room.category}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => onJoinPublicRoom(room.id)}
                            disabled={room.current_players >= room.max_players}
                            className={`
                              ${room.current_players >= room.max_players 
                                ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' 
                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                              }
                            `}
                          >
                            {room.current_players >= room.max_players ? 'Full' : 'Join'}
                          </Button>
                        </div>
                        
                        {/* Room progress bar */}
                        <div className="mt-3">
                          <div className="w-full bg-muted/20 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(room.current_players / room.max_players) * 100}%` }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
