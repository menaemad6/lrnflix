
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Copy, Eye, EyeOff, LogOut, Play, QrCode } from 'lucide-react';
import { GameRoom, Player } from '@/hooks/useMultiplayerQuiz';
import { useToast } from '@/hooks/use-toast';

interface MultiplayerQuizWaitingRoomProps {
  room: GameRoom;
  players: Player[];
  onLeaveRoom: () => void;
  onStartGame: () => Promise<void>;
  currentUserId: string;
}

const playerColors = [
  'bg-gradient-to-br from-purple-500 to-pink-500',
  'bg-gradient-to-br from-blue-500 to-cyan-500',
  'bg-gradient-to-br from-green-500 to-emerald-500',
  'bg-gradient-to-br from-orange-500 to-red-500',
  'bg-gradient-to-br from-indigo-500 to-purple-500',
  'bg-gradient-to-br from-teal-500 to-green-500',
  'bg-gradient-to-br from-rose-500 to-pink-500',
  'bg-gradient-to-br from-amber-500 to-orange-500',
  'bg-gradient-to-br from-cyan-500 to-blue-500',
  'bg-gradient-to-br from-emerald-500 to-teal-500',
  'bg-gradient-to-br from-violet-500 to-purple-500',
  'bg-gradient-to-br from-lime-500 to-green-500',
];

const avatarEmojis = ['😎', '🤓', '😃', '🥳', '😊', '🤗', '😄', '🙂', '😁', '🤖', '👨‍💻', '👩‍💻', '🧑‍🎓', '👨‍🎓', '👩‍🎓', '🦸‍♀️', '🦸‍♂️', '🧙‍♀️', '🧙‍♂️', '🐱'];

export const MultiplayerQuizWaitingRoom = ({ 
  room, 
  players, 
  onLeaveRoom,
  onStartGame,
  currentUserId 
}: MultiplayerQuizWaitingRoomProps) => {
  const { toast } = useToast();

  // Cleanup effect to handle proper unmounting
  useEffect(() => {
    return () => {
      // Clean up any lingering state when component unmounts
      console.log('MultiplayerQuizWaitingRoom unmounting');
    };
  }, []);

  const copyRoomCode = () => {
    if (room.room_code) {
      navigator.clipboard.writeText(room.room_code);
      toast({
        title: 'Room Code Copied',
        description: 'Share this code with your friends!',
      });
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await onLeaveRoom();
    } catch (error) {
      console.error('Error leaving room:', error);
      toast({
        title: 'Error',
        description: 'Failed to leave room',
        variant: 'destructive',
      });
    }
  };

  const handleStartGame = async () => {
    try {
      await onStartGame();
    } catch (error) {
      console.error('Error starting game:', error);
      toast({
        title: 'Error',
        description: 'Failed to start game',
        variant: 'destructive',
      });
    }
  };

  const isRoomCreator = room.created_by === currentUserId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6 bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-white">Quiz Lobby</h1>
          {room.room_code && (
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                <span className="text-white font-mono text-lg font-bold">
                  PIN: {room.room_code}
                </span>
              </div>
              <Button
                onClick={copyRoomCode}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <Copy className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30 text-white">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span className="font-semibold">{players.length}/{room.max_players}</span>
            </div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30 text-white">
            <div className="flex items-center space-x-2">
              {room.is_public ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              <span className="text-sm">{room.is_public ? 'Public' : 'Private'}</span>
            </div>
          </div>

          <Button
            onClick={handleLeaveRoom}
            variant="ghost"
            className="text-white hover:bg-red-500/20 border border-white/30"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Leave
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Players Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Players in the Game
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 max-w-6xl mx-auto">
              <AnimatePresence>
                {players.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <div className={`
                      ${playerColors[index % playerColors.length]}
                      p-4 rounded-2xl shadow-lg border-2 border-white/30
                      ${player.user_id === currentUserId ? 'ring-4 ring-yellow-400' : ''}
                      transition-all duration-300 hover:scale-105 hover:shadow-xl
                    `}>
                      {/* Crown for room creator */}
                      {player.user_id === room.created_by && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <div className="bg-yellow-400 p-1 rounded-full">
                            <Crown className="h-4 w-4 text-yellow-800" />
                          </div>
                        </div>
                      )}
                      
                      {/* Avatar */}
                      <div className="flex justify-center mb-3">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm border border-white/30">
                          {avatarEmojis[index % avatarEmojis.length]}
                        </div>
                      </div>
                      
                      {/* Player Name */}
                      <div className="text-center">
                        <p className="text-white font-bold text-sm truncate">
                          {player.username}
                          {player.user_id === currentUserId && ' (You)'}
                        </p>
                        {player.user_id === room.created_by && (
                          <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-500/40 text-xs mt-1">
                            Host
                          </Badge>
                        )}
                      </div>

                      {/* Online indicator */}
                      <div className="absolute top-2 right-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Empty Slots */}
              {Array.from({ length: room.max_players - players.length }).map((_, index) => (
                <motion.div
                  key={`empty-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border-2 border-dashed border-white/30"
                >
                  <div className="flex justify-center mb-3">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <Users className="h-6 w-6 text-white/60" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-white/60 text-sm">Waiting...</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Game Status and Actions */}
          <div className="max-w-2xl mx-auto">
            {players.length === room.max_players ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/40 rounded-2xl p-6 mb-6">
                  <div className="text-4xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-green-300 mb-2">
                    Room is Full!
                  </h3>
                  <p className="text-green-200">
                    All players have joined. Ready to start the quiz!
                  </p>
                </div>
                
                {isRoomCreator && (
                  <Button
                    onClick={handleStartGame}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-12 py-4 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Play className="h-6 w-6 mr-3" />
                    Start Game
                  </Button>
                )}
                
                {!isRoomCreator && (
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                    <p className="text-white text-lg">
                      Waiting for host to start the game...
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
                  <div className="text-4xl mb-4">⏳</div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Waiting for More Players
                  </h3>
                  <p className="text-white/80 text-lg mb-4">
                    Need {room.max_players - players.length} more player{room.max_players - players.length !== 1 ? 's' : ''} to join
                  </p>
                  
                  {room.room_code && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <p className="text-white/80 text-sm mb-2">Share this PIN with your friends:</p>
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-3xl font-mono font-bold text-white">{room.room_code}</span>
                        <QrCode className="h-6 w-6 text-white/60" />
                      </div>
                    </div>
                  )}
                </div>
                
                {isRoomCreator && players.length >= 2 && (
                  <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/40 rounded-2xl p-4">
                    <p className="text-yellow-200 mb-3">
                      You can start the game early with {players.length} players
                    </p>
                    <Button
                      onClick={handleStartGame}
                      variant="outline"
                      className="border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 hover:text-yellow-200"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Game Now
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
