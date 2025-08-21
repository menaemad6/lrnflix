
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, Users, Trophy, Target, Star, Crown, CheckCircle, LogOut } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, Player, GameState } from '@/hooks/useMultiplayerQuiz';
import { useTranslation } from 'react-i18next';

interface EnhancedMultiplayerQuizGameProps {
  question: Question;
  timeLeft: number;
  players: Player[];
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  gameState: GameState;
  currentQuestionIndex: number;
  totalQuestions: number;
  onLeave: () => void;
}

export const EnhancedMultiplayerQuizGame = ({
  question,
  timeLeft,
  players,
  selectedAnswer,
  onAnswerSelect,
  gameState,
  currentQuestionIndex,
  totalQuestions,
  onLeave,
}: EnhancedMultiplayerQuizGameProps) => {
  const { t } = useTranslation('other');
  const [answeredPlayers, setAnsweredPlayers] = useState<Set<string>>(new Set());
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [streak, setStreak] = useState(0);
  const [allPlayersAnswered, setAllPlayersAnswered] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const timePercentage = (timeLeft / question.time_limit) * 100;
  const isAnswered = selectedAnswer !== null;
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  useEffect(() => {
    if (timeLeft === 0 && !showCorrectAnswer) {
      setShowCorrectAnswer(true);
      setTimeout(() => setShowCorrectAnswer(false), 3000);
    }
  }, [timeLeft, showCorrectAnswer]);

  useEffect(() => {
    if (gameState === 'countdown') {
      setAnsweredPlayers(new Set());
      setShowCorrectAnswer(false);
      setAllPlayersAnswered(false);
      setCountdown(3);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, countdown]);

  // Check if all players have answered
  useEffect(() => {
    if (selectedAnswer && players.length > 0) {
      // Simulate checking if all players answered
      // In a real implementation, this would come from the server
      const answeredCount = players.filter(p => p.user_id).length; // Simplified check
      setAllPlayersAnswered(answeredCount >= players.length);
    }
  }, [selectedAnswer, players]);

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered || timeLeft === 0) return;
    
    onAnswerSelect(answer);
    
    // Simulate correct answer celebration
    if (answer === question.correct_answer) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const getAnswerButtonClass = (option: string) => {
    const baseClass =
      'w-full h-full relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 font-semibold text-left flex';

    if (showCorrectAnswer) {
      if (option === question.correct_answer) {
        return `${baseClass} bg-primary/30 border-primary text-primary-foreground shadow-lg shadow-primary/25`;
      } else if (option === selectedAnswer) {
        return `${baseClass} bg-destructive/30 border-destructive text-destructive-foreground shadow-lg shadow-destructive/25`;
      }
      return `${baseClass} bg-muted/20 border-border text-muted-foreground`;
    }

    if (selectedAnswer === option) {
      return `${baseClass} bg-gradient-to-r from-primary/30 to-accent/30 border-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105`;
    }

    if (isAnswered) {
      return `${baseClass} bg-muted/20 border-border text-muted-foreground opacity-50`;
    }

    return `${baseClass} bg-card/80 border-border hover:border-primary/50 hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20 hover:scale-105 text-foreground`;
  };

  if (gameState === 'countdown') {
    return (
      <div className="min-h-screen bg-background particle-bg flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
            className="text-center space-y-8"
          >
            <div className="text-9xl font-extrabold gradient-text">
              {countdown > 0 ? countdown : t('multiplayerQuiz.countdown.go')}
            </div>
            <p className="text-2xl text-muted-foreground">{t('multiplayerQuiz.countdown.getReady')}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background particle-bg p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 md:pt-32">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header with Timer and Players */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4">
            <motion.div
              animate={{ rotate: timeLeft <= 5 ? [0, -10, 10, 0] : 0 }}
              transition={{ duration: 0.5, repeat: timeLeft <= 5 ? Infinity : 0 }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-2xl ${
                timeLeft <= 5 ? 'bg-destructive/20 border border-destructive' : 'bg-primary/20 border border-primary'
              }`}
            >
              <Clock className={`h-5 w-5 ${timeLeft <= 5 ? 'text-destructive' : 'text-primary'}`} />
              <span className={`font-bold text-lg ${timeLeft <= 5 ? 'text-destructive' : 'text-primary'}`}>
                {timeLeft}s
              </span>
            </motion.div>
            
            <Progress 
              value={timePercentage} 
              className={`w-48 h-3 ${timeLeft <= 5 ? '[&>div]:bg-destructive' : '[&>div]:bg-primary'}`}
            />

            {/* Question Counter */}
            <div className="flex items-center space-x-2 px-3 py-2 rounded-2xl bg-accent/20 border border-accent">
              <Target className="h-5 w-5 text-accent" />
              <span className="text-accent font-bold">
                {currentQuestionIndex + 1} / {totalQuestions}
              </span>
            </div>

            {/* All Players Answered Indicator */}
            {allPlayersAnswered && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-primary/20 border border-primary"
              >
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-primary font-bold">{t('multiplayerQuiz.game.allAnswered')}</span>
              </motion.div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-accent" />
              <span className="text-accent font-medium">{players.length} {t('multiplayerQuiz.game.players')}</span>
            </div>
                          <Button variant="destructive" size="sm" onClick={onLeave}>
                <LogOut className="h-4 w-4 mr-2" />
                {t('multiplayerQuiz.game.leave')}
              </Button>
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative"
        >
          <Card className="glass-card border-border shadow-2xl">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Badge className="bg-gradient-to-r from-accent/20 to-primary/20 text-accent border-accent/40 px-4 py-2">
                    <Target className="h-4 w-4 mr-2" />
                    {question.difficulty}
                  </Badge>
                  
                  {streak > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center space-x-1 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/40 rounded-full px-3 py-1"
                    >
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-primary font-bold">{streak} {t('multiplayerQuiz.game.streak')}</span>
                    </motion.div>
                  )}
                </div>
                
                <h2 className="text-2xl font-bold text-foreground leading-relaxed">
                  {question.question}
                </h2>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Answer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <AnimatePresence>
            {question.options.map((option, index) => (
              <motion.div
                key={index}
                initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: isAnswered ? 1 : 1.02 }}
                whileTap={{ scale: isAnswered ? 1 : 0.98 }}
                className="h-full"
              >
                <Button
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isAnswered || timeLeft === 0}
                  className={getAnswerButtonClass(option)}
                >
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                        showCorrectAnswer && option === question.correct_answer 
                          ? 'bg-primary text-primary-foreground'
                          : selectedAnswer === option
                          ? 'bg-current text-background'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1 text-sm sm:text-base whitespace-normal break-words">{option}</span>
                  </div>
                  
                  {selectedAnswer === option && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Star className="h-3 w-3 text-primary-foreground" fill="currentColor" />
                      </div>
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Live Leaderboard */}
        <Card className="glass-card border-border">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">{t('multiplayerQuiz.game.liveLeaderboard')}</h3>
            </div>
            
            <div className="space-y-3">
              {sortedPlayers.slice(0, 5).map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-2 sm:p-3 rounded-xl ${
                    index === 0 
                      ? 'bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/40'
                      : 'bg-muted/30 border border-border'
                  }`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                        index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                      {index === 0 ? <Crown className="h-4 w-4" /> : index + 1}
                    </div>
                    <span className={`font-medium text-sm sm:text-base ${index === 0 ? 'text-primary' : 'text-foreground'}`}>
                      {player.username}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    {player.streak > 0 && (
                      <Badge className="bg-accent/20 text-accent border-accent/40 text-xs sm:text-sm">
                        <Zap className="h-3 w-3 mr-1" />
                        {player.streak}
                      </Badge>
                    )}
                    <span className={`font-bold text-base sm:text-lg ${index === 0 ? 'text-primary' : 'text-accent'}`}>
                      {player.score}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
