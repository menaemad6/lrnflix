import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Crown,
  Copy,
  Eye,
  EyeOff,
  LogOut,
  Play,
  QrCode,
  Tag,
  Share2,
  Trophy
} from 'lucide-react';
import { GameRoom, Player } from '@/hooks/useMultiplayerQuiz';
import { useToast } from '@/hooks/use-toast';

interface MultiplayerQuizWaitingRoomProps {
  room: GameRoom;
  players: Player[];
  onLeaveRoom: () => void;
  onStartGame: () => Promise<void>;
  currentUserId: string;
  onDebugStatus?: () => Promise<void>;
  onCheckAndStart?: () => Promise<void>;
}

const playerColors = [
  'bg-gradient-to-br from-purple-500 to-pink-500',
  'bg-gradient-to-br from-blue-500 to-accent-500',
  'bg-gradient-to-br from-green-500 to-primary-500',
  'bg-gradient-to-br from-orange-500 to-red-500',
  'bg-gradient-to-br from-indigo-500 to-purple-500',
  'bg-gradient-to-br from-secondary-500 to-green-500',
  'bg-gradient-to-br from-rose-500 to-pink-500',
  'bg-gradient-to-br from-amber-500 to-orange-500',
  'bg-gradient-to-br from-accent-500 to-blue-500',
  'bg-gradient-to-br from-primary-500 to-secondary-500',
  'bg-gradient-to-br from-violet-500 to-purple-500',
  'bg-gradient-to-br from-lime-500 to-green-500',
];

const avatarEmojis = ['😎', '🤓', '😃', '🥳', '😊', '🤗', '😄', '🙂', '😁', '🤖', '👨‍💻', '👩‍💻', '🧑‍🎓', '👨‍🎓', '👩‍🎓', '🦸‍♀️', '🦸‍♂️', '🧙‍♀️', '🧙‍♂️', '🐱'];

export const MultiplayerQuizWaitingRoom = ({ 
  room, 
  players, 
  onLeaveRoom,
  onStartGame,
  currentUserId,
  onDebugStatus,
  onCheckAndStart
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

  const shareRoomLink = () => {
    const link = `${window.location.origin}/multiplayer-quiz?roomCode=${room.room_code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Invitation Link Copied',
      description: 'Share this link with your friends to join the room!',
    });
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
    <div className="min-h-screen bg-background particle-bg relative overflow-hidden pt-24">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Modern Header */}
      <header className="relative z-10 p-4 sm:p-6">
        <div className="glass-card border-border p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Quiz Battle</h1>
              <p className="text-sm text-muted-foreground animate-pulse">Waiting for players...</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4">
            {room.room_code && (
              <div className="glass-card px-4 py-2 rounded-xl border border-border flex items-center space-x-3">
                <span className="text-muted-foreground text-xs font-semibold uppercase">Code</span>
                <span className="text-foreground font-mono text-lg sm:text-xl font-bold tracking-widest">{room.room_code}</span>
                <Button onClick={copyRoomCode} variant="ghost" size="icon" className="h-8 w-8">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button onClick={shareRoomLink} variant="ghost" size="icon" className="h-8 w-8">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            <Badge variant="outline" className="px-3 py-1 text-xs sm:text-sm">
              <Users className="h-4 w-4 mr-2" />
              {players.length}/{room.max_players}
            </Badge>
            <Badge variant="outline" className="px-3 py-1 text-xs sm:text-sm">
              {room.is_public ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
              {room.is_public ? 'Public' : 'Private'}
            </Badge>
            <Button onClick={handleLeaveRoom} variant="destructive" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Leave
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Players Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              <span className="inline-block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent pb-1 border-b-2 border-primary/30 px-4">
                Players in the Game
              </span>
            </h2>
            
            <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto">
              <AnimatePresence>
                {players.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative w-[160px]"
                  >
                    <div className={`
                      glass-card border-border
                      p-4 rounded-2xl shadow-lg
                      ${player.user_id === currentUserId ? 'ring-4 ring-primary' : ''}
                      transition-all duration-300 hover:scale-105 hover:shadow-xl
                    `}>
                      {/* Crown for room creator */}
                      {player.user_id === room.created_by && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <div className="bg-primary p-1 rounded-full">
                            <Crown className="h-4 w-4 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                      
                      {/* Avatar */}
                      <div className="flex justify-center mb-3">
                        <div className="w-16 h-16 bg-card/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm border border-border">
                          {avatarEmojis[index % avatarEmojis.length]}
                        </div>
                      </div>
                      
                      {/* Player Name */}
                      <div className="text-center">
                        <p className="text-foreground font-bold text-sm truncate">
                          {player.username}
                          {player.user_id === currentUserId && ' (You)'}
                        </p>
                        {player.user_id === room.created_by && (
                          <Badge className="bg-primary/20 text-primary border-primary/40 text-xs mt-1">
                            Host
                          </Badge>
                        )}
                      </div>

                      {/* Online indicator */}
                      <div className="absolute top-2 right-2">
                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-lg"></div>
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
                  className="relative w-[160px] bg-muted/10 backdrop-blur-sm p-4 rounded-2xl border-2 border-dashed border-border"
                >
                  <div className="flex justify-center mb-3">
                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-border">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">Waiting...</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Game Status and Actions */}
          <div className="max-w-2xl mx-auto text-center">
            <div className="glass-card border border-border rounded-2xl p-6 mb-6">
              <div className="text-4xl mb-4">
                {players.length === room.max_players ? '🎉' : '⏳'}
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {players.length === room.max_players ? 'Room is Full!' : 'Waiting for Players'}
              </h3>
              <p className="text-muted-foreground text-lg mb-4">
                {players.length === room.max_players
                  ? 'All players have joined. Ready to start the quiz!'
                  : `Need ${room.max_players - players.length} more player${
                      room.max_players - players.length !== 1 ? 's' : ''
                    } to join`}
              </p>
              {room.category && (
                <p className="text-muted-foreground mb-4">
                  Category: <span className="text-primary font-semibold">{room.category}</span>
                </p>
              )}
              {players.length < room.max_players && room.room_code && (
                <div className="glass-card rounded-xl p-4 border border-border">
                  <p className="text-muted-foreground text-sm mb-2">Share this PIN with your friends:</p>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-3xl font-mono font-bold text-foreground">{room.room_code}</span>
                    <QrCode className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>

            {isRoomCreator ? (
              <div>
                <Button
                  onClick={handleStartGame}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold px-12 py-4 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                  disabled={players.length < 1}
                >
                  <Play className="h-6 w-6 mr-3" />
                  Start Game ({players.length} {players.length === 1 ? 'player' : 'players'})
                </Button>
                {players.length < room.max_players && (
                  <p className="text-accent mt-4 text-sm">
                    You can start the game now, even if the room isn't full.
                  </p>
                )}
              </div>
            ) : (
              <div className="glass-card border border-border rounded-2xl p-4">
                <p className="text-foreground text-lg">Waiting for the host to start the game...</p>
              </div>
            )}
          </div>
          
          {/* Debug Section - Only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="max-w-2xl mx-auto mt-6">
              <div className="glass-card border border-destructive/20 rounded-2xl p-4 bg-destructive/5">
                <h4 className="text-destructive font-semibold mb-3 text-center">🐛 Debug Tools</h4>
                <div className="flex gap-2 justify-center">
                  {onDebugStatus && (
                    <Button
                      onClick={onDebugStatus}
                      variant="outline"
                      size="sm"
                      className="border-destructive/30 text-destructive hover:bg-destructive/10"
                    >
                      Debug Status
                    </Button>
                  )}
                  {onCheckAndStart && (
                    <Button
                      onClick={onCheckAndStart}
                      variant="outline"
                      size="sm"
                      className="border-destructive/30 text-destructive hover:bg-destructive/10"
                    >
                      Check & Start Game
                    </Button>
                  )}
                </div>
                <p className="text-xs text-destructive/70 text-center mt-2">
                  Room Status: {room.status} | Game State: {room.status === 'started' ? 'Ready to Start' : 'Waiting'}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
