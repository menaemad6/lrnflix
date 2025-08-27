import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Crown, Medal, Star, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { useTenant } from '@/contexts/TenantContext';
import { calculateTenantFilteredXP } from '@/utils/xpUtils';

interface LeaderboardPlayer {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  total_xp: { [key: string]: number };
  role: string;
  displayXP: number;
}

interface MultiplayerQuizLeaderboardProps {
  className?: string;
}

export const MultiplayerQuizLeaderboard = ({ className }: MultiplayerQuizLeaderboardProps) => {
  const { t } = useTranslation('other');
  const { teacher } = useTenant();
  const [topPlayers, setTopPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, total_xp, role')
        .limit(100); // Get more players to filter client-side

      if (error) throw error;

      // Filter players with XP and calculate tenant-filtered totals
      const playersWithXP = (data || [])
        .filter(player => player.total_xp && Object.keys(player.total_xp).length > 0)
        .map(player => ({
          ...player,
          // Calculate tenant-filtered XP for display
          // If we're in tenant mode, we'll need to get categories from courses/chapters
          // For now, just show total XP
          displayXP: calculateTenantFilteredXP(player.total_xp, null)
        }))
        .filter(player => player.displayXP > 0)
        .sort((a, b) => b.displayXP - a.displayXP)
        .slice(0, 10);

      setTopPlayers(playersWithXP);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0: return <Crown className="h-5 w-5 text-yellow-400" />;
      case 1: return <Medal className="h-5 w-5 text-gray-400" />;
      case 2: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <Trophy className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 0: return { emoji: '🥇', color: 'bg-yellow-500/20 text-yellow-900 border-yellow-500/40' };
      case 1: return { emoji: '🥈', color: 'bg-gray-500/20 text-gray-700 border-gray-500/40' };
      case 2: return { emoji: '🥉', color: 'bg-amber-600/20 text-amber-700 border-amber-600/40' };
      default: return { emoji: '🏅', color: 'bg-muted/20 text-muted-foreground border-border' };
    }
  };

  const formatXP = (xp: number) => {
    if (xp >= 1000000) {
      return `${(xp / 1000000).toFixed(1)}M`;
    } else if (xp >= 1000) {
      return `${(xp / 1000).toFixed(1)}K`;
    }
    return xp.toString();
  };

  if (loading) {
    return (
      <Card className={`glass-card border-border ${className}`}>
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-primary" />
            {t('multiplayerQuiz.leaderboard.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/20 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-3 bg-muted rounded w-16" />
                </div>
                <div className="h-6 bg-muted rounded w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`glass-card border-border ${className}`}>
      <CardHeader>
        <CardTitle className="text-foreground flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-primary" />
          {t('multiplayerQuiz.leaderboard.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
                 {topPlayers.length === 0 ? (
           <div className="text-center py-6 sm:py-8">
             <Trophy className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
             <p className="text-muted-foreground text-sm sm:text-base">
               {t('multiplayerQuiz.leaderboard.noPlayersYet')}
             </p>
             <p className="text-xs sm:text-sm text-muted-foreground mt-2">
               {t('multiplayerQuiz.leaderboard.playToEarnXP')}
             </p>
           </div>
         ) : (
          <div className="space-y-3">
            {topPlayers.map((player, index) => (
                             <motion.div
                 key={player.id}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: index * 0.1 }}
                 className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl border transition-all duration-200 hover:border-primary/50 gap-3 ${
                   index === 0 
                     ? 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-yellow-500/30' 
                     : index === 1
                     ? 'bg-gradient-to-r from-gray-500/10 to-gray-600/10 border-gray-500/30'
                     : index === 2
                     ? 'bg-gradient-to-r from-amber-600/10 to-amber-700/10 border-amber-600/30'
                     : 'bg-card/30 border-border hover:bg-card/50'
                 }`}
               >
                 <div className="flex items-center space-x-3 flex-1 min-w-0">
                   <div className="relative flex-shrink-0">
                     <Avatar className="w-10 h-10">
                       <AvatarImage src={player.avatar_url || undefined} />
                       <AvatarFallback className="bg-muted text-muted-foreground">
                         {player.full_name?.charAt(0)?.toUpperCase() || 'U'}
                       </AvatarFallback>
                     </Avatar>
                     <div className="absolute -top-1 -right-1">
                       {getRankIcon(index)}
                     </div>
                   </div>
                   <div className="min-w-0 flex-1">
                     <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                       <span className={`font-medium truncate ${
                         index === 0 ? 'text-yellow-400' : 
                         index === 1 ? 'text-gray-400' : 
                         index === 2 ? 'text-amber-600' : 
                         'text-foreground'
                       }`}>
                         {player.full_name || t('multiplayerQuiz.leaderboard.anonymousPlayer')}
                       </span>
                       <Badge 
                         variant="outline" 
                         className={`text-xs w-fit ${getRankBadge(index).color}`}
                       >
                         {getRankBadge(index).emoji} #{index + 1}
                       </Badge>
                     </div>
                     <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
                       <span className="capitalize">{player.role}</span>
                       <span className="hidden sm:inline">•</span>
                       <span className="flex items-center">
                         <Zap className="h-3 w-3 mr-1" />
                         {formatXP(player.displayXP)} XP
                       </span>
                     </div>
                   </div>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto">
                   {index === 0 && (
                     <Badge className="bg-yellow-700/20 text-yellow-700 border-yellow-500/40 hover:bg-yellow-500/30 w-fit">
                       <TrendingUp className="h-3 w-3 mr-1" />
                       {t('multiplayerQuiz.leaderboard.topPlayer')}
                     </Badge>
                   )}
                   <div className={`text-right ${
                     index === 0 ? 'text-yellow-400' : 
                     index === 1 ? 'text-gray-400' : 
                     index === 2 ? 'text-amber-600' : 
                     'text-accent'
                   }`}>
                                             <div className="text-lg font-bold">{formatXP(player.displayXP)}</div>
                     <div className="text-xs text-muted-foreground">XP</div>
                   </div>
                 </div>
               </motion.div>
            ))}
          </div>
        )}
        
                 {topPlayers.length > 0 && (
           <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border">
             <div className="text-center">
               <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                 {t('multiplayerQuiz.leaderboard.updatedRealTime')}
               </p>
               <button
                 onClick={fetchLeaderboard}
                 className="text-xs text-primary hover:text-primary/80 transition-colors"
               >
                 {t('multiplayerQuiz.leaderboard.refresh')}
               </button>
             </div>
           </div>
         )}
      </CardContent>
    </Card>
  );
};
