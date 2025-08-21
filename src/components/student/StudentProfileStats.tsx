
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, BookOpen, Clock, Zap, Calendar, TrendingUp, Flame } from 'lucide-react';
import Aurora from '@/components/react-bits/backgrounds/Aurora/Aurora';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

interface StudentProfileStatsProps {
  stats: {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalCreditsSpent: number;
    studyStreak?: number;
    avgQuizScore?: number;
    totalStudyTime?: number;
  };
  user: {
    full_name: string | null;
    email: string;
    avatar_url?: string | null;
    wallet: number;
    minutes: number;
  };
}

export const StudentProfileStats = ({ stats, user }: StudentProfileStatsProps) => {
  const completionRate = stats.totalCourses > 0 ? Math.round((stats.completedCourses / stats.totalCourses) * 100) : 0;
  const studyLevel = Math.floor(stats.completedCourses / 3) + 1; // Simple level calculation
  const { theme } = useTheme();
  const { t } = useTranslation('dashboard');

  return (
    <div className="space-y-8">
      {/* Modern Profile Header with Aurora background */}
      <Card className="glass-card border-0 relative overflow-hidden">
        {/* Aurora animated background */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <Aurora 
            amplitude={1.2} 
            blend={0.6} 
          />
          {theme === 'dark' && (
            <div className="absolute inset-0 bg-black/60" />
          )}
        </div>
        <CardContent className="relative z-10 px-4 py-8 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-6">
            {/* Avatar with animated border */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl font-bold text-primary-foreground shadow-2xl animate-glow-pulse border-4 border-white/30">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || user.email}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()
                )}
                {/* Circular progress ring */}
                <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 120 120">
                  <circle
                    cx="60" cy="60" r="54"
                    stroke="hsl(var(--primary))"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={339.292}
                    strokeDashoffset={339.292 - (completionRate / 100) * 339.292}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
              </div>
              {/* Fire/Energy icon */}
              <div className="absolute -bottom-3 -right-3 bg-gradient-to-br from-warning to-warning/80 rounded-full p-2 shadow-lg animate-bounce">
                <Flame className="h-6 w-6 text-warning-foreground" />
              </div>
            </div>
            {/* Info */}
            <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold gradient-text mb-1">
                {user.full_name || t('studentProfile.student')}
              </h1>
              <p className="text-muted-foreground mb-2 text-sm sm:text-base break-all">{user.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <Badge className="bg-primary/20 text-primary border-primary/30 flex items-center gap-1 text-base px-3 py-1">
                  <Trophy className="h-4 w-4 mr-1" />
                  {t('studentProfile.level')} {studyLevel}
                </Badge>
                <div className="flex items-center gap-1 text-base text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  {stats.completedCourses} {t('studentProfile.coursesCompleted')}
                </div>
                <div className="flex items-center gap-1 text-base text-warning">
                  <Flame className="h-4 w-4" />
                  {stats.studyStreak || 0} {t('studentProfile.dayStreak')}
                </div>
              </div>
            </div>
            {/* Progress */}
            <div className="flex flex-col items-center sm:items-end text-center sm:text-right min-w-[120px]">
              <div className="text-sm text-muted-foreground mb-1">{t('studentProfile.courseCompletion')}</div>
              <div className="text-3xl font-extrabold gradient-text">{completionRate}%</div>
              <Progress value={completionRate} className="w-24 h-3 mt-2 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-0 hover-glow group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('studentProfile.enrolledCourses')}</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-info/20 to-accent/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="h-5 w-5 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text">{stats.totalCourses}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-xs text-primary">{stats.inProgressCourses} {t('studentProfile.inProgress')}</div>
              <div className="text-xs text-muted-foreground">•</div>
              <div className="text-xs text-secondary">{stats.completedCourses} {t('studentProfile.completed')}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 hover-glow group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('studentProfile.creditsBalance')}</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-success/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text">{user.wallet}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.totalCreditsSpent} {t('studentProfile.totalSpent')}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 hover-glow group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('studentProfile.aiMinutes')}</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text">{user.minutes}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('studentProfile.availableForAiTutor')}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 hover-glow group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('studentProfile.studyLevel')}</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-warning/20 to-warning/40 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text">{studyLevel}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('studentProfile.nextLevel', { count: 3 - (stats.completedCourses % 3) })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
