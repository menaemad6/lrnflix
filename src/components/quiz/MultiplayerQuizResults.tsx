import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Star,
  Zap,
  Target,
  RotateCcw,
  Home
} from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';
import type { Player, GameRoom, Question } from '@/hooks/useMultiplayerQuiz';

interface MultiplayerQuizResultsProps {
  players: Player[];
  onPlayAgain: () => void;
  onLeaveRoom: () => Promise<void>;
  currentUserId: string;
  room: GameRoom | null;
  questions: Question[];
}

export const MultiplayerQuizResults = ({
  players,
  onPlayAgain,
  onLeaveRoom,
  currentUserId,
  room,
  questions
}: MultiplayerQuizResultsProps) => {
  const { t } = useTranslation('other');
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const currentPlayer = players.find(p => p.user_id === currentUserId);
  const userRank = sortedPlayers.findIndex(p => p.user_id === currentUserId) + 1;
  const userScore = currentPlayer?.score || 0;
  
  // Calculate actual question count from the room
  const actualQuestionCount = questions.length || (room?.shuffled_questions?.length || 0);

  // Trigger confetti for top 3
  React.useEffect(() => {
    if (userRank <= 3) {
      confetti({
        particleCount: 150,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  }, [userRank]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Medal className="h-6 w-6 text-amber-600" />;
      default: return <Trophy className="h-6 w-6 text-gray-500" />;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return { emoji: '🥇', color: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300' };
      case 2: return { emoji: '🥈', color: 'bg-gray-500/20 text-gray-700 dark:text-gray-300' };
      case 3: return { emoji: '🥉', color: 'bg-amber-600/20 text-amber-700 dark:text-amber-300' };
      default: return { emoji: '🏅', color: 'bg-gray-600/20 text-gray-700 dark:text-gray-300' };
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await onLeaveRoom();
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  return (
         <div className="min-h-screen bg-background particle-bg flex items-center justify-center p-3 sm:p-4 pt-20 sm:pt-28">
       <div className="max-w-4xl w-full">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">{t('multiplayerQuiz.results.gameComplete')}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">{t('multiplayerQuiz.results.performanceDescription')}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Leaderboard */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-primary" />
                  {t('multiplayerQuiz.results.finalRankings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                                {sortedPlayers.map((player, index) => {
                  const rank = index + 1;
                  const badge = getRankBadge(rank);
                  const isCurrentUser = player.user_id === currentUserId;
                  
                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                                             className={`
                         flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl
                         ${isCurrentUser 
                           ? 'bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30' 
                           : rank === 1 
                           ? 'bg-gradient-to-r from-yellow-400/20 to-amber-500/20 border border-yellow-400/60' :
                           rank === 2 ? 'bg-gradient-to-r from-muted/20 to-muted/30 border border-muted/30' :
                           rank === 3 ? 'bg-gradient-to-r from-secondary/20 to-secondary/30 border border-secondary/30' :
                           'bg-card/50 border border-border'
                         }
                       `}
                    >
                      {/* Rank */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {isCurrentUser ? (
                          <Star className="h-6 w-6 text-accent" />
                        ) : (
                          getRankIcon(rank)
                        )}
                        <span className="text-xl sm:text-2xl">{badge.emoji}</span>
                      </div>

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 sm:mb-0">
                          <span className={`font-bold text-base sm:text-lg truncate ${
                            isCurrentUser ? 'text-accent' : 'text-foreground'
                          }`}>
                            {player.username}
                            {isCurrentUser && <span className="ml-2 text-xs text-accent/70">(You)</span>}
                          </span>
                          {rank === 1 && !isCurrentUser && (
                            <Badge className="bg-primary/20 text-primary w-fit text-xs">
                              {t('multiplayerQuiz.results.winner')}
                            </Badge>
                          )}
                          {isCurrentUser && (
                            <Badge className="bg-accent/20 text-accent w-fit text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                          <span className={`font-medium flex items-center ${
                            isCurrentUser 
                              ? 'text-accent' 
                              : 'text-green-600 dark:text-green-300'
                          }`}>
                            <span className="hidden sm:inline mr-1">•</span>
                            {player.score} {t('multiplayerQuiz.results.points')}
                          </span>
                          {player.streak > 0 && (
                            <span className="text-orange-600 dark:text-orange-300 flex items-center">
                              <Zap className="h-3 w-3 mr-1" />
                              {player.streak} {t('multiplayerQuiz.results.streak')}
                            </span>
                          )}
                          <span className="text-purple-600 dark:text-purple-300 flex items-center">
                            <Star className="h-3 w-3 mr-1" />
                            +{player.xp_earned} {t('multiplayerQuiz.results.xp')}
                          </span>
                        </div>
                      </div>

                      {/* Position */}
                      <div className="text-center sm:text-right w-full sm:w-auto">
                                                 <div className={`
                           text-xl sm:text-2xl font-bold
                           ${isCurrentUser 
                             ? 'text-accent' 
                             : rank === 1 ? 'text-yellow-500' :
                             rank === 2 ? 'text-gray-400' :
                             rank === 3 ? 'text-amber-600' :
                             'text-gray-500'
                           }
                         `}>
                           {t('multiplayerQuiz.results.rankNumber', { rank })}
                         </div>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Player Summary & Actions */}
          <div className="space-y-4 sm:space-y-6">
            
            {/* Your Performance */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-card backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    {t('multiplayerQuiz.results.yourPerformance')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                                     <div className="text-center">
                     <div className="text-3xl sm:text-4xl mb-2">
                       {getRankBadge(userRank).emoji}
                     </div>
                     <div className="text-xl sm:text-2xl font-bold text-foreground mb-1">
                       {t('multiplayerQuiz.results.rankNumber', { rank: userRank })}
                     </div>
                     <div className="text-muted-foreground text-sm sm:text-base">
                       {t('multiplayerQuiz.results.outOfPlayersCount', { count: players.length })}
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4">
                                         <div className="text-center">
                       <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                         {userScore}
                       </div>
                       <div className="text-xs text-muted-foreground">{t('multiplayerQuiz.results.totalScoreLabel')}</div>
                     </div>
                     <div className="text-center">
                       <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                         +{Math.floor(userScore / 10)}
                       </div>
                       <div className="text-xs text-muted-foreground">{t('multiplayerQuiz.results.xpEarnedLabel')}</div>
                     </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

                         {/* Actions */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5 }}
               className="space-y-3"
             >
               <Button
                 onClick={onPlayAgain}
                 className="w-full h-10 sm:h-12 font-semibold text-sm sm:text-base"
                 variant='default'
               >
                 <RotateCcw className="h-4 w-4 mr-2" />
                 {t('multiplayerQuiz.results.playAgain')}
               </Button>
               
               <Button
                 onClick={handleLeaveRoom}
                 variant="ghost"
                 className="w-full h-10 sm:h-12 text-foreground hover:text-foreground/80 text-sm sm:text-base"
               >
                 <Home className="h-4 w-4 mr-2" />
                 {t('multiplayerQuiz.results.backToLobby')}
               </Button>
             </motion.div>

            {/* Quick Stats */}
            <Card className="bg-card backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-foreground text-sm">{t('multiplayerQuiz.results.gameSummary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                                 <div className="flex justify-between text-muted-foreground">
                   <span>{t('multiplayerQuiz.results.questionsLabel')}</span>
                   <span className="text-foreground">{actualQuestionCount}</span>
                 </div>
                                 <div className="flex justify-between text-muted-foreground">
                   <span>{t('multiplayerQuiz.results.accuracyLabel')}</span>
                   <span className="text-green-600 dark:text-green-300">
                     {actualQuestionCount > 0 ? Math.round((userScore / (actualQuestionCount * 100)) * 100) : 0}%
                   </span>
                 </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('multiplayerQuiz.results.avgSpeedLabel')}</span>
                  <span className="text-blue-600 dark:text-blue-300">{t('multiplayerQuiz.results.avgSpeedValue')}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
