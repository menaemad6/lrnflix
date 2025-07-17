
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Timer, 
  Zap, 
  Trophy, 
  Crown,
  Star,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { Question, Player } from '@/hooks/useMultiplayerQuiz';

interface MultiplayerQuizGameProps {
  question: Question;
  timeLeft: number;
  players: Player[];
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  gameState: 'countdown' | 'playing' | 'waiting';
}

export const MultiplayerQuizGame = ({
  question,
  timeLeft,
  players,
  selectedAnswer,
  onAnswerSelect,
  gameState
}: MultiplayerQuizGameProps) => {
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Countdown effect
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, countdown]);

  // Show correct answer when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !showCorrectAnswer) {
      setShowCorrectAnswer(true);
      if (selectedAnswer === question.correct_answer) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  }, [timeLeft, showCorrectAnswer, selectedAnswer, question.correct_answer]);

  const progressPercentage = (timeLeft / question.time_limit) * 100;
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  if (gameState === 'countdown') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          key={countdown}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 2, opacity: 0 }}
          className="text-center"
        >
          <div className="text-8xl font-bold text-white mb-4">
            {countdown || 'START!'}
          </div>
          <div className="text-xl text-gray-300">Get ready...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        
        {/* Main Game Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Timer and Progress */}
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Timer className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">Time Left</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {timeLeft}s
                </div>
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-3 bg-white/20"
              />
            </CardContent>
          </Card>

          {/* Question Card */}
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/20">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Badge className={`${
                  question.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                  question.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {question.difficulty.toUpperCase()}
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-300">
                  <Target className="h-3 w-3 mr-1" />
                  {question.time_limit}s
                </Badge>
              </div>

              <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed">
                {question.question}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === question.correct_answer;
                  const isIncorrect = showCorrectAnswer && isSelected && !isCorrect;
                  
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() => !selectedAnswer && onAnswerSelect(option)}
                        disabled={!!selectedAnswer}
                        className={`
                          w-full h-16 text-left justify-start p-4 text-lg font-medium
                          transition-all duration-300
                          ${isSelected && !showCorrectAnswer ? 
                            'bg-blue-500/30 border-blue-400 text-blue-200' :
                          showCorrectAnswer && isCorrect ?
                            'bg-green-500/30 border-green-400 text-green-200' :
                          isIncorrect ?
                            'bg-red-500/30 border-red-400 text-red-200' :
                            'bg-white/5 border-white/20 text-white hover:bg-white/10'
                          }
                        `}
                        variant="outline"
                      >
                        <span className="mr-3 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">
                          {String.fromCharCode(65 + index)}
                        </span>
                        {option}
                        {showCorrectAnswer && isCorrect && (
                          <Star className="h-5 w-5 ml-auto text-green-300" />
                        )}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>

              {showCorrectAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                >
                  <div className="flex items-center space-x-2 text-green-300">
                    <Trophy className="h-5 w-5" />
                    <span className="font-medium">
                      Correct Answer: {question.correct_answer}
                    </span>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Sidebar */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <span className="text-white font-semibold">Leaderboard</span>
              </div>

              <div className="space-y-3">
                {sortedPlayers.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      flex items-center space-x-3 p-3 rounded-lg
                      ${index === 0 ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-white/5'}
                    `}
                  >
                    <div className="flex items-center space-x-2">
                      {index === 0 && <Crown className="h-4 w-4 text-yellow-400" />}
                      <span className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-white/20 text-white'
                        }
                      `}>
                        {index + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium text-sm truncate">
                        {player.username}
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-green-300">{player.score} pts</span>
                        {player.streak > 0 && (
                          <span className="text-orange-300">
                            <Zap className="h-3 w-3 inline mr-1" />
                            {player.streak}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Game Stats */}
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/20">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-3">Game Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Players:</span>
                  <span className="text-white">{players.length}/4</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Question:</span>
                  <span className="text-white">1/10</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Difficulty:</span>
                  <span className={`
                    ${question.difficulty === 'easy' ? 'text-green-300' :
                      question.difficulty === 'medium' ? 'text-yellow-300' :
                      'text-red-300'
                    }
                  `}>
                    {question.difficulty}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
