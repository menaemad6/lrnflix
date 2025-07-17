
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, Users, Trophy, Target, Star, Crown, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, Player, GameState } from '@/hooks/useMultiplayerQuiz';

interface EnhancedMultiplayerQuizGameProps {
  question: Question;
  timeLeft: number;
  players: Player[];
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  gameState: GameState;
  currentQuestionIndex: number;
  totalQuestions: number;
}

export const EnhancedMultiplayerQuizGame = ({
  question,
  timeLeft,
  players,
  selectedAnswer,
  onAnswerSelect,
  gameState,
  currentQuestionIndex,
  totalQuestions
}: EnhancedMultiplayerQuizGameProps) => {
  const [answeredPlayers, setAnsweredPlayers] = useState<Set<string>>(new Set());
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [streak, setStreak] = useState(0);
  const [allPlayersAnswered, setAllPlayersAnswered] = useState(false);

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
    }
  }, [gameState]);

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
    const baseClass = "relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 font-semibold text-left";
    
    if (showCorrectAnswer) {
      if (option === question.correct_answer) {
        return `${baseClass} bg-emerald-500/30 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/25`;
      } else if (option === selectedAnswer) {
        return `${baseClass} bg-red-500/30 border-red-400 text-red-300 shadow-lg shadow-red-500/25`;
      }
      return `${baseClass} bg-muted/20 border-border text-muted-foreground`;
    }
    
    if (selectedAnswer === option) {
      return `${baseClass} bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/25 scale-105`;
    }
    
    if (isAnswered) {
      return `${baseClass} bg-muted/20 border-border text-muted-foreground opacity-50`;
    }
    
    return `${baseClass} bg-card/80 border-border hover:border-emerald-400/50 hover:bg-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-105 text-foreground`;
  };

  if (gameState === 'countdown') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-8"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-8xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
          >
            3
          </motion.div>
          <p className="text-2xl text-white/80">Get Ready!</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-900 p-4 pt-[100px]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Timer and Players */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ rotate: timeLeft <= 5 ? [0, -10, 10, 0] : 0 }}
              transition={{ duration: 0.5, repeat: timeLeft <= 5 ? Infinity : 0 }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-2xl ${
                timeLeft <= 5 ? 'bg-red-500/20 border border-red-400' : 'bg-cyan-500/20 border border-cyan-400'
              }`}
            >
              <Clock className={`h-5 w-5 ${timeLeft <= 5 ? 'text-red-300' : 'text-cyan-300'}`} />
              <span className={`font-bold text-lg ${timeLeft <= 5 ? 'text-red-300' : 'text-cyan-300'}`}>
                {timeLeft}s
              </span>
            </motion.div>
            
            <Progress 
              value={timePercentage} 
              className={`w-48 h-3 ${timeLeft <= 5 ? '[&>div]:bg-red-500' : '[&>div]:bg-cyan-500'}`}
            />

            {/* Question Counter */}
            <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-purple-500/20 border border-purple-400">
              <Target className="h-5 w-5 text-purple-300" />
              <span className="text-purple-300 font-bold">
                {currentQuestionIndex + 1} / {totalQuestions}
              </span>
            </div>

            {/* All Players Answered Indicator */}
            {allPlayersAnswered && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-400"
              >
                <CheckCircle className="h-5 w-5 text-emerald-300" />
                <span className="text-emerald-300 font-bold">All Answered!</span>
              </motion.div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-300" />
            <span className="text-purple-300 font-medium">{players.length} Players</span>
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative"
        >
          <Card className="bg-card/80 backdrop-blur-xl border-border shadow-2xl">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/40 px-4 py-2">
                    <Target className="h-4 w-4 mr-2" />
                    {question.difficulty}
                  </Badge>
                  
                  {streak > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center space-x-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded-full px-3 py-1"
                    >
                      <Zap className="h-4 w-4 text-yellow-300" />
                      <span className="text-yellow-300 font-bold">{streak} Streak!</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {question.options.map((option, index) => (
              <motion.div
                key={index}
                initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: isAnswered ? 1 : 1.02 }}
                whileTap={{ scale: isAnswered ? 1 : 0.98 }}
              >
                <Button
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isAnswered || timeLeft === 0}
                  className={getAnswerButtonClass(option)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      showCorrectAnswer && option === question.correct_answer 
                        ? 'bg-emerald-400 text-black'
                        : selectedAnswer === option
                        ? 'bg-current text-background'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1">{option}</span>
                  </div>
                  
                  {selectedAnswer === option && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center">
                        <Star className="h-3 w-3 text-black" fill="currentColor" />
                      </div>
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Live Leaderboard */}
        <Card className="bg-card/80 backdrop-blur-xl border-border">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <h3 className="text-lg font-bold text-foreground">Live Leaderboard</h3>
            </div>
            
            <div className="space-y-3">
              {sortedPlayers.slice(0, 5).map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    index === 0 
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40'
                      : 'bg-muted/30 border border-border'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-400 text-black' : 'bg-muted text-muted-foreground'
                    }`}>
                      {index === 0 ? <Crown className="h-4 w-4" /> : index + 1}
                    </div>
                    <span className={`font-medium ${index === 0 ? 'text-yellow-300' : 'text-foreground'}`}>
                      {player.username}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {player.streak > 0 && (
                      <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/40">
                        <Zap className="h-3 w-3 mr-1" />
                        {player.streak}
                      </Badge>
                    )}
                    <span className={`font-bold text-lg ${index === 0 ? 'text-yellow-300' : 'text-emerald-300'}`}>
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
