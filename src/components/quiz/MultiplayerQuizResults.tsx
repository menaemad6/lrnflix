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
import type { Player } from '@/hooks/useMultiplayerQuiz';

interface MultiplayerQuizResultsProps {
  players: Player[];
  onPlayAgain: () => void;
  onLeaveRoom: () => Promise<void>;
  currentUserId: string;
}

export const MultiplayerQuizResults = ({
  players,
  onPlayAgain,
  onLeaveRoom,
  currentUserId
}: MultiplayerQuizResultsProps) => {
  const { t } = useTranslation('other');
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const currentPlayer = players.find(p => p.user_id === currentUserId);
  const userRank = sortedPlayers.findIndex(p => p.user_id === currentUserId) + 1;
  const userScore = currentPlayer?.score || 0;

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
      case 1: return <Crown className="h-6 w-6 text-yellow-400" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Medal className="h-6 w-6 text-amber-600" />;
      default: return <Trophy className="h-6 w-6 text-gray-500" />;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return { emoji: '🥇', color: 'bg-yellow-500/20 text-yellow-300' };
      case 2: return { emoji: '🥈', color: 'bg-gray-500/20 text-gray-300' };
      case 3: return { emoji: '🥉', color: 'bg-amber-600/20 text-amber-300' };
      default: return { emoji: '🏅', color: 'bg-gray-600/20 text-gray-300' };
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
    <div className="min-h-screen bg-background particle-bg flex items-center justify-center p-4 pt-28">
      <div className="max-w-4xl w-full">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-primary mb-2">{t('multiplayerQuiz.results.gameComplete')}</h1>
          <p className="text-muted-foreground">{t('multiplayerQuiz.results.performanceDescription')}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Leaderboard */}
          <div className="lg:col-span-2 space-y-4">
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
                  
                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`
                        flex items-center space-x-4 p-4 rounded-xl
                        ${rank === 1 ? 'bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30' :
                          rank === 2 ? 'bg-gradient-to-r from-muted/20 to-muted/30 border border-muted/30' :
                          rank === 3 ? 'bg-gradient-to-r from-secondary/20 to-secondary/30 border border-secondary/30' :
                          'bg-card/50 border border-border'
                        }
                      `}
                    >
                      {/* Rank */}
                      <div className="flex items-center space-x-2">
                        {getRankIcon(rank)}
                        <span className="text-2xl">{badge.emoji}</span>
                      </div>

                      {/* Player Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-foreground font-bold text-lg">
                            {player.username}
                          </span>
                          {rank === 1 && (
                            <Badge className="bg-primary/20 text-primary">
                              {t('multiplayerQuiz.results.winner')}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                          <span className="text-green-300 font-medium">
                            {player.score} {t('multiplayerQuiz.results.points')}
                          </span>
                          {player.streak > 0 && (
                            <span className="text-orange-300 flex items-center">
                              <Zap className="h-3 w-3 mr-1" />
                              {player.streak} {t('multiplayerQuiz.results.streak')}
                            </span>
                          )}
                          <span className="text-purple-300 flex items-center">
                            <Star className="h-3 w-3 mr-1" />
                            +{player.xp_earned} {t('multiplayerQuiz.results.xp')}
                          </span>
                        </div>
                      </div>

                      {/* Position */}
                      <div className="text-right">
                        <div className={`
                          text-2xl font-bold
                          ${rank === 1 ? 'text-yellow-400' :
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
          <div className="space-y-6">
            
            {/* Your Performance */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-card backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    {t('multiplayerQuiz.results.yourPerformance')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl mb-2">
                      {getRankBadge(userRank).emoji}
                    </div>
                                            <div className="text-2xl font-bold text-white mb-1">
                          {t('multiplayerQuiz.results.rankNumber', { rank: userRank })}
                        </div>
                        <div className="text-gray-300">
                          {t('multiplayerQuiz.results.outOfPlayersCount', { count: players.length })}
                        </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {userScore}
                      </div>
                      <div className="text-xs text-gray-400">{t('multiplayerQuiz.results.totalScoreLabel')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        +{Math.floor(userScore / 10)}
                      </div>
                      <div className="text-xs text-gray-400">{t('multiplayerQuiz.results.xpEarnedLabel')}</div>
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
                className="w-full h-12  font-semibold"
                variant='default'
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {t('multiplayerQuiz.results.playAgain')}
              </Button>
              
              <Button
                onClick={handleLeaveRoom}
                variant="ghost"
                className="w-full h-12  text-white"
              >
                <Home className="h-4 w-4 mr-2" />
                {t('multiplayerQuiz.results.backToLobby')}
              </Button>
            </motion.div>

            {/* Quick Stats */}
            <Card className="bg-card backdrop-blur-xl ">
              <CardHeader>
                <CardTitle className="text-white text-sm">{t('multiplayerQuiz.results.gameSummary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>{t('multiplayerQuiz.results.questionsLabel')}</span>
                  <span className="text-white">{t('multiplayerQuiz.results.questionsCompleted')}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>{t('multiplayerQuiz.results.accuracyLabel')}</span>
                  <span className="text-green-300">
                    {Math.round((userScore / 1000) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>{t('multiplayerQuiz.results.avgSpeedLabel')}</span>
                  <span className="text-blue-300">{t('multiplayerQuiz.results.avgSpeedValue')}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
