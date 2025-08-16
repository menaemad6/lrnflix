
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Users, 
  Plus, 
  Gamepad2, 
  Clock, 
  Loader2,
  RefreshCw,
  Globe,
  Lock,
  Tag
} from 'lucide-react';
import type { GameState, GameRoom } from '@/hooks/useMultiplayerQuiz';

interface MultiplayerQuizLobbyProps {
  gameState: GameState;
  publicRooms: GameRoom[];
  categories: string[];
  onFindMatch: () => Promise<void>;
  onCancelMatch: () => Promise<void>;
  onCreateRoom: (maxPlayers: number, isPublic: boolean, category?: string) => Promise<void>;
  onJoinRoomByCode: (roomCode: string) => Promise<void>;
  onJoinPublicRoom: (roomId: string) => Promise<void>;
  onRefreshRooms: () => Promise<void>;
}

export const MultiplayerQuizLobby = ({
  gameState,
  publicRooms,
  categories,
  onFindMatch,
  onCancelMatch,
  onCreateRoom,
  onJoinRoomByCode,
  onJoinPublicRoom,
  onRefreshRooms
}: MultiplayerQuizLobbyProps) => {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isPublic, setIsPublic] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const handleCreateRoom = async () => {
    await onCreateRoom(maxPlayers, isPublic, selectedCategory || 'General');
    setShowCreateRoom(false);
    setSelectedCategory('');
  };

  const handleJoinByCode = async () => {
    if (roomCode.trim()) {
      await onJoinRoomByCode(roomCode.trim());
      setRoomCode('');
    }
  };

  const filteredRooms = publicRooms.filter(room => {
    const matchesSearch = room.room_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || room.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background particle-bg pt-24">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Multiplayer Quiz
          </h1>
          <p className="text-muted-foreground text-lg">
            Challenge friends and compete in real-time quizzes
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Match */}
            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Gamepad2 className="h-5 w-5 mr-2 text-primary" />
                  Quick Match
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Find a random match with other players
                </p>
                
                {gameState === 'finding' ? (
                  <Button
                    onClick={onCancelMatch}
                    variant="outline"
                    className="w-full h-12"
                    disabled={gameState !== 'finding'}
                  >
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cancel Search
                  </Button>
                ) : (
                  <Button
                    onClick={onFindMatch}
                    className="w-full h-12 bg-primary hover:bg-primary/90"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Find Match
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Create Room */}
            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-accent" />
                  Create Room
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showCreateRoom ? (
                  <>
                    <p className="text-muted-foreground text-sm">
                      Create a custom room with your settings
                    </p>
                    <Button
                      onClick={() => setShowCreateRoom(true)}
                      className="w-full bg-accent hover:bg-accent/90"
                    >
                      Create Room
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    {/* Category Selection */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Question Category
                      </label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="bg-card">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">General (Mixed)</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Max Players */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Max Players: {maxPlayers}
                      </label>
                      <input
                        type="range"
                        min="2"
                        max="8"
                        value={maxPlayers}
                        onChange={(e) => setMaxPlayers(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>

                    {/* Visibility */}
                    <div className="flex items-center space-x-4">
                      <Button
                        onClick={() => setIsPublic(true)}
                        variant={isPublic ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        Public
                      </Button>
                      <Button
                        onClick={() => setIsPublic(false)}
                        variant={!isPublic ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                      >
                        <Lock className="h-4 w-4 mr-1" />
                        Private
                      </Button>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={handleCreateRoom}
                        className="flex-1 bg-accent hover:bg-accent/90"
                      >
                        Create
                      </Button>
                      <Button
                        onClick={() => setShowCreateRoom(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Join by Code */}
            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Users className="h-5 w-5 mr-2 text-secondary" />
                  Join by Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Enter a room code to join a private game
                </p>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter room code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    className="bg-card"
                    maxLength={4}
                  />
                  <Button
                    onClick={handleJoinByCode}
                    disabled={!roomCode.trim()}
                    className="bg-secondary hover:bg-secondary/90"
                  >
                    Join
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Public Rooms */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-primary" />
                    Public Rooms
                  </CardTitle>
                  <Button
                    onClick={onRefreshRooms}
                    variant="outline"
                    size="sm"
                    className="bg-card"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search rooms..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-card"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="bg-card sm:w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rooms List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {filteredRooms.length > 0 ? (
                      filteredRooms.map((room) => (
                        <motion.div
                          key={room.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="bg-card/50 rounded-lg p-4 border border-border hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-foreground">
                                  Room {room.room_code}
                                </span>
                                {room.category && (
                                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {room.category}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {room.current_players}/{room.max_players}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  Waiting
                                </span>
                              </div>
                            </div>
                            <Button
                              onClick={() => onJoinPublicRoom(room.id)}
                              disabled={room.current_players >= room.max_players}
                              size="sm"
                              className="bg-primary hover:bg-primary/90"
                            >
                              {room.current_players >= room.max_players ? 'Full' : 'Join'}
                            </Button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No public rooms available</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Create a room to start playing!
                        </p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
