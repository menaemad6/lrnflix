import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Trophy, MessageSquare, TrendingUp, ArrowUpRight, Sparkles, Clock } from 'lucide-react';

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  activeDiscussions: number;
}

interface TeacherStatsGridProps {
  stats: DashboardStats;
}

export function TeacherStatsGrid({ stats }: TeacherStatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="glass-card border-0 hover-glow group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-accent-500/5" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-accent-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-500/20">
            <BookOpen className="h-6 w-6 text-blue-400" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold gradient-text mb-1">{stats.totalCourses}</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-primary-400" />
            Published courses
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card border-0 hover-glow group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-green-500/5" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform border border-primary-500/20">
            <Users className="h-6 w-6 text-primary-400" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold gradient-text mb-1">{stats.totalStudents}</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3 text-primary-400" />
            Enrolled learners
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card border-0 hover-glow group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform border border-purple-500/20">
            <Trophy className="h-6 w-6 text-purple-400" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold gradient-text mb-1">{stats.totalRevenue}</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-purple-400" />
            Credits earned
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card border-0 hover-glow group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground">Discussions</CardTitle>
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform border border-yellow-500/20">
            <MessageSquare className="h-6 w-6 text-yellow-400" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold gradient-text mb-1">{stats.activeDiscussions}</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3 text-yellow-400" />
            Active threads
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
