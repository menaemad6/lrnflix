import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, Trophy, Target, Zap } from 'lucide-react';
import { useStudyStreak } from '@/hooks/useStudyStreak';
import { useTranslation } from 'react-i18next';

interface StreakProgressProps {
  userId: string;
  compact?: boolean;
  showMotivation?: boolean;
  className?: string;
}

export const StreakProgress: React.FC<StreakProgressProps> = ({
  userId,
  compact = false,
  showMotivation = true,
  className = ''
}) => {
  const { t } = useTranslation('dashboard');
  const {
    currentStreak,
    longestStreak,
    hasActivityToday,
    isLoading,
    getStreakMotivation,
    isOnFire,
    isConsistent,
    isLegendary
  } = useStudyStreak({ userId });

  if (isLoading) {
    return (
      <Card className={`glass-card border-0 ${className}`}>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStreakIcon = () => {
    if (isLegendary) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (isConsistent) return <Target className="h-5 w-5 text-green-500" />;
    if (isOnFire) return <Flame className="h-5 w-5 text-orange-500" />;
    return <Zap className="h-5 w-5 text-blue-500" />;
  };

  const getStreakColor = () => {
    if (isLegendary) return 'from-yellow-500 to-orange-500';
    if (isConsistent) return 'from-green-500 to-blue-500';
    if (isOnFire) return 'from-orange-500 to-red-500';
    return 'from-blue-500 to-purple-500';
  };

  const getStreakBadge = () => {
    if (isLegendary) return 'Legendary';
    if (isConsistent) return 'Consistent';
    if (isOnFire) return 'On Fire';
    return 'Getting Started';
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          {getStreakIcon()}
          <span className="font-bold text-lg">{currentStreak}</span>
        </div>
        <Badge 
          variant="secondary" 
          className={`bg-gradient-to-r ${getStreakColor()} text-white border-0`}
        >
          {getStreakBadge()}
        </Badge>
        {hasActivityToday && (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Today ✓
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={`glass-card border-0 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStreakIcon()}
            <div>
              <h3 className="font-semibold text-lg">{currentStreak} {t('studentProfile.dayStreak')}</h3>
              <p className="text-sm text-muted-foreground">
                {longestStreak > currentStreak && `Best: ${longestStreak} days`}
              </p>
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className={`bg-gradient-to-r ${getStreakColor()} text-white border-0`}
          >
            {getStreakBadge()}
          </Badge>
        </div>

        {showMotivation && (
          <p className="text-sm text-muted-foreground mb-3">
            {getStreakMotivation()}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{t('studentProfile.progressToNextMilestone')}</span>
            <span className="font-medium">
              {currentStreak < 7 ? `${currentStreak}/7` : 
               currentStreak < 30 ? `${currentStreak}/30` : 
               currentStreak < 100 ? `${currentStreak}/100` : t('studentProfile.maxed')}
            </span>
          </div>
          
          <Progress 
            value={
              currentStreak < 7 ? (currentStreak / 7) * 100 :
              currentStreak < 30 ? (currentStreak / 30) * 100 :
              currentStreak < 100 ? (currentStreak / 100) * 100 : 100
            } 
            className="h-2"
          />
        </div>

        {hasActivityToday && (
          <div className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-600 text-center">
              {t('studentProfile.greatJobToday')}
            </p>
          </div>
        )}

        {!hasActivityToday && currentStreak > 0 && (
          <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <p className="text-sm text-orange-600 text-center">
              {t('studentProfile.dontBreakStreak')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
