
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, BookOpen, Clock, Zap, Calendar, TrendingUp } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="glass-card border-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10" />
        <CardContent className="relative z-10 p-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-black shadow-lg shadow-emerald-500/25">
              {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold gradient-text mb-1">
                {user.full_name || 'Student'}
              </h1>
              <p className="text-muted-foreground mb-3">{user.email}</p>
              <div className="flex items-center gap-4">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  Level {studyLevel}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Trophy className="h-4 w-4" />
                  {stats.completedCourses} Courses Completed
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Course Completion</div>
              <div className="text-2xl font-bold gradient-text">{completionRate}%</div>
              <Progress value={completionRate} className="w-24 h-2 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-0 hover-glow group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Courses</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="h-5 w-5 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text">{stats.totalCourses}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-xs text-emerald-400">{stats.inProgressCourses} in progress</div>
              <div className="text-xs text-muted-foreground">•</div>
              <div className="text-xs text-purple-400">{stats.completedCourses} completed</div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 hover-glow group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credits Balance</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="h-5 w-5 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text">{user.wallet}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.totalCreditsSpent} total spent
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 hover-glow group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Minutes</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text">{user.minutes}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Available for AI tutor
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 hover-glow group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Study Level</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text">{studyLevel}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Next level: {3 - (stats.completedCourses % 3)} courses
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
