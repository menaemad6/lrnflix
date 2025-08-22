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
import { useTranslation } from 'react-i18next';
import { useTenant } from '@/contexts/TenantContext';

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
  const { t } = useTranslation('other');
  const { teacher } = useTenant();
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
    if (activeMatchmakers === 0) return t('multiplayerQuiz.lobby.noOneSearching');
    
    const categoryEntries = Object.entries(matchmakerCategories);
    if (categoryEntries.length === 0) return t('multiplayerQuiz.lobby.searchingForMatches');
    
    const statusParts = categoryEntries.map(([category, count]) => 
      `${count} ${category}`
    );
    
    return statusParts.join(', ');
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
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

      const uniqueCategories = [...new Set(data?.map(q => q.category) || [])];
      setCategories(uniqueCategories);
      
      // Set initial quick match category to first available category
      if (uniqueCategories.length > 0 && quickMatchCategory === 'General') {
        setQuickMatchCategory(uniqueCategories[0]);
      }

      // Fetch question counts for each category
      const questionCounts: Record<string, number> = {};
      for (const category of uniqueCategories) {
        let countQuery = supabase
          .from('multiplayer_quiz_questions')
          .select('*', { count: 'exact' })
          .eq('category', category);

        // Filter by instructor_id if we have a tenant teacher
        if (teacher?.user_id) {
          countQuery = countQuery.eq('instructor_id', teacher.user_id);
        }

        const { count, error: countError } = await countQuery;
        
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
      return t('multiplayerQuiz.lobby.allCategories');
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
          <h1 className="text-4xl font-bold text-primary mb-2">{t('multiplayerQuiz.lobby.title')}</h1>
          <p className="text-muted-foreground text-lg">{t('multiplayerQuiz.lobby.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Actions - Left Side */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card border-border shadow-2xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl text-foreground">{t('multiplayerQuiz.lobby.joinBattle')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Create Room Button */}
                <Dialog open={createModalOpen} onOpenChange={handleCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-lg shadow-lg hover:shadow-primary/25"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      {t('multiplayerQuiz.lobby.createRoom')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t('multiplayerQuiz.lobby.createNewRoom')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="maxPlayers">{t('multiplayerQuiz.lobby.maxPlayers')}</Label>
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
                        <Label htmlFor="category">{t('multiplayerQuiz.lobby.category')}</Label>
                        <Select
                          value={selectedCategory}
                          onValueChange={setSelectedCategory}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder={t('multiplayerQuiz.lobby.selectCategory')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t('multiplayerQuiz.lobby.allCategories')}</SelectItem>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="questionCount">{t('multiplayerQuiz.lobby.questionCount')}</Label>
                        <div className="space-y-3 mt-2">
                          {loadingCategories ? (
                            <div className="text-sm text-muted-foreground text-center py-4">
                              {t('multiplayerQuiz.lobby.loadingQuestionCounts')}
                            </div>
                          ) : (() => {
                            const options = getQuestionCountOptions();
                            return (
                              <>
                                <div className="text-sm text-muted-foreground mb-2">
                                  {t('multiplayerQuiz.lobby.availableQuestions', { count: options.maxQuestions })}
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <Button
                                    variant={questionCount === options.halfQuestions ? "default" : "outline"}
                                    className="text-sm"
                                    onClick={() => handleQuestionCountChange(options.halfQuestions)}
                                    disabled={options.maxQuestions === 0}
                                  >
                                    {t('multiplayerQuiz.lobby.halfQuestions', { count: options.halfQuestions })}
                                  </Button>
                                  <Button
                                    variant={questionCount === options.randomQuestions ? "default" : "outline"}
                                    className="text-sm"
                                    onClick={() => handleQuestionCountChange(options.randomQuestions)}
                                    disabled={options.maxQuestions === 0}
                                  >
                                    {t('multiplayerQuiz.lobby.randomQuestions', { count: options.randomQuestions })}
                                  </Button>
                                  <Button
                                    variant={questionCount === options.maxQuestions ? "default" : "outline"}
                                    className="text-sm"
                                    onClick={() => handleQuestionCountChange(options.maxQuestions)}
                                    disabled={options.maxQuestions === 0}
                                  >
                                    {t('multiplayerQuiz.lobby.maxQuestions', { count: options.maxQuestions })}
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      placeholder={t('multiplayerLobby.customNumber')}
                                      value={customQuestionCount}
                                      onChange={(e) => handleCustomQuestionCountChange(e.target.value)}
                                      className="flex-1"
                                      type="number"
                                      min="1"
                                      max={options.maxQuestions}
                                      disabled={options.maxQuestions === 0}
                                    />
                                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                                      {t('multiplayerQuiz.lobby.maxQuestions', { count: options.maxQuestions })}
                                    </span>
                                  </div>
                                  <div className="text-sm text-center text-muted-foreground">
                                    {t('multiplayerQuiz.lobby.selectedQuestions', { count: questionCount })}
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
                          <span>{isPublic ? t('multiplayerQuiz.lobby.publicRoom') : t('multiplayerQuiz.lobby.privateRoom')}</span>
                        </Label>
                      </div>
                      <Button 
                        onClick={handleCreateRoom} 
                        className="w-full"
                        disabled={loadingCategories || getQuestionCountOptions().maxQuestions === 0}
                      >
                        {t('multiplayerQuiz.lobby.createRoom')}
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
                      {t('multiplayerQuiz.lobby.joinWithCode')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t('multiplayerQuiz.lobby.joinRoom')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="roomCode">{t('multiplayerQuiz.lobby.roomCode')}</Label>
                        <Input
                          id="roomCode"
                          placeholder={t('multiplayerLobby.enterRoomCode')}
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
                        {t('multiplayerQuiz.lobby.joinRoom')}
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
                        {t('multiplayerQuiz.lobby.selectCategoryForQuickMatch')}
                      </Label>
                      <Select
                        value={quickMatchCategory}
                        onValueChange={setQuickMatchCategory}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder={t('multiplayerQuiz.lobby.selectCategory')} />
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
                      {t('multiplayerQuiz.lobby.quickMatch1v1')}
                    </Button>
                    
                    {/* Live Matchmaker Indicator */}
                    <div className="mt-3 p-3 bg-background/50 border border-border/50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-muted-foreground">{t('multiplayerQuiz.lobby.liveMatchmakers')}</span>
                        </div>
                        <span className="font-semibold text-primary">
                          {activeMatchmakers} {t('multiplayerQuiz.lobby.online')}
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
                        {t('multiplayerQuiz.lobby.findingOpponent', { category: getCategoryDisplayName() })}
                      </span>
                    </div>
                    <Button
                      onClick={onCancelMatch}
                      variant="outline"
                      className="border-destructive/20 bg-destructive/10 hover:bg-destructive/20 text-destructive"
                    >
                      {t('multiplayerQuiz.lobby.cancel')}
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
                  {t('multiplayerQuiz.lobby.howToPlay')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground text-sm">
                <div className="flex items-start space-x-3">
                  <Badge className="bg-primary/20 text-primary min-w-fit">{t('multiplayerQuiz.lobby.step1')}</Badge>
                  <p>{t('multiplayerQuiz.lobby.createOrJoin')}</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="bg-accent/20 text-accent min-w-fit">{t('multiplayerQuiz.lobby.step2')}</Badge>
                  <p>{t('multiplayerQuiz.lobby.wait')}</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="bg-primary/20 text-primary min-w-fit">{t('multiplayerQuiz.lobby.step3')}</Badge>
                  <p>{t('multiplayerQuiz.lobby.answerFast')}</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="bg-accent/20 text-accent min-w-fit">{t('multiplayerQuiz.lobby.step4')}</Badge>
                  <p>{t('multiplayerQuiz.lobby.victory')}</p>
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
                    {t('multiplayerQuiz.lobby.publicRooms')}
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
                          <SelectItem value="all">{t('multiplayerQuiz.lobby.allCategories')}</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/40">
                      {filteredRooms.length} {t('multiplayerQuiz.lobby.active')}
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
                          ? t('multiplayerQuiz.lobby.noPublicRoomsAvailable') 
                          : t('multiplayerQuiz.lobby.noPublicRoomsInCategory', { category: getCategoryDisplayName() })
                        }
                      </p>
                      <p className="text-sm">{t('multiplayerQuiz.lobby.createOne')}</p>
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
                                <p className="text-foreground font-medium">{t('multiplayerQuiz.lobby.roomCode', { code: room.room_code })}</p>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <div className="flex items-center space-x-1">
                                    <Users className="h-4 w-4" />
                                    <span>{room.current_players}/{room.max_players}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Timer className="h-4 w-4" />
                                    <span>{t('multiplayerQuiz.lobby.waiting')}</span>
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
                            {room.current_players >= room.max_players ? t('multiplayerQuiz.lobby.full') : t('multiplayerQuiz.lobby.join')}
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
