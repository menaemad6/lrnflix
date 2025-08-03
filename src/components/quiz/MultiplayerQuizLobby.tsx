import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { GameRoom } from '@/hooks/useMultiplayerQuiz';

interface MultiplayerQuizLobbyProps {
  gameState: string;
  publicRooms: GameRoom[];
  onFindMatch: () => Promise<void>;
  onCancelMatch: () => Promise<void>;
  onCreateRoom: (maxPlayers: number, isPublic: boolean) => Promise<GameRoom | undefined>;
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

  const isSearching = gameState === 'finding';

  const handleCreateRoom = async () => {
    await onCreateRoom(maxPlayers, isPublic);
    setCreateModalOpen(false);
  };

  const handleJoinRoom = async () => {
    if (roomCode.length === 4) {
      await onJoinRoomByCode(roomCode);
      setJoinModalOpen(false);
      setRoomCode('');
    }
  };

  return (
    <div className="min-h-screen bg-background particle-bg p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Quiz Battle Arena</h1>
          <p className="text-muted-foreground text-lg">Test your knowledge against players worldwide</p>
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
                <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
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
                      <Button onClick={handleCreateRoom} className="w-full">
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
                  <Button
                    onClick={onFindMatch}
                    className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold"
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Quick Match
                  </Button>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full"
                      />
                      <span className="text-foreground font-medium">Finding players...</span>
                    </div>
                    <Button
                      onClick={onCancelMatch}
                      variant="outline"
                      className="border-destructive/50 bg-destructive/10 hover:bg-destructive/20 text-destructive"
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
                <CardTitle className="text-foreground flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    Public Rooms
                  </div>
                  <Badge className="bg-primary/20 text-primary border-primary/40">
                    {publicRooms.length} Active
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {publicRooms.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-muted-foreground mb-4">
                      <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No public rooms available</p>
                      <p className="text-sm">Create one and invite your friends!</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 max-h-96 overflow-y-auto">
                    {publicRooms.map((room) => (
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
