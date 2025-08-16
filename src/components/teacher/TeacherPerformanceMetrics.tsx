import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Award, Clock, Users, Star, BarChart3 } from 'lucide-react';

interface PerformanceMetrics {
  totalStudents: number;
  totalCourses: number;
  averageRating: number;
  completionRate: number;
  engagementScore: number;
  responseTime: number;
  monthlyGrowth: number;
  topPerformingCourse: string;
}

interface TeacherPerformanceMetricsProps {
  metrics: PerformanceMetrics;
}

export function TeacherPerformanceMetrics({ metrics }: TeacherPerformanceMetricsProps) {
  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-emerald-400';
    if (growth < 0) return 'text-red-400';
    return 'text-muted-foreground';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-emerald-400" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <BarChart3 className="h-4 w-4 text-muted-foreground" />;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-yellow-400';
    if (rating >= 4.0) return 'text-emerald-400';
    if (rating >= 3.5) return 'text-blue-400';
    return 'text-muted-foreground';
  };

  return (
    <Card className="glass-card border-0 hover-glow">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Award className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="gradient-text text-xl">Performance Metrics</CardTitle>
            <p className="text-muted-foreground text-sm">Your teaching excellence in numbers</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <div className="text-2xl font-bold gradient-text mb-1">{metrics.totalStudents}</div>
            <div className="text-xs text-muted-foreground">Total Students</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              {getGrowthIcon(metrics.monthlyGrowth)}
              <span className={`text-xs ${getGrowthColor(metrics.monthlyGrowth)}`}>
                {Math.abs(metrics.monthlyGrowth)}% this month
              </span>
            </div>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
            <div className="text-2xl font-bold gradient-text mb-1">{metrics.totalCourses}</div>
            <div className="text-xs text-muted-foreground">Active Courses</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Target className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-emerald-400">Published</span>
            </div>
          </div>
        </div>

        {/* Rating and Completion */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium">Average Rating</span>
            </div>
            <div className={`text-2xl font-bold ${getRatingColor(metrics.averageRating)}`}>
              {metrics.averageRating.toFixed(1)}
            </div>
            <div className="flex gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-3 w-3 ${
                    i < Math.floor(metrics.averageRating) 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-muted-foreground'
                  }`} 
                />
              ))}
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium">Completion Rate</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">{metrics.completionRate}%</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${metrics.completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Engagement and Response Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-medium">Engagement Score</span>
            </div>
            <div className="text-2xl font-bold text-indigo-400">{metrics.engagementScore}/100</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${metrics.engagementScore}%` }}
              />
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-teal-400" />
              <span className="text-sm font-medium">Avg Response Time</span>
            </div>
            <div className="text-2xl font-bold text-teal-400">{metrics.responseTime}h</div>
            <div className="text-xs text-muted-foreground mt-1">to student queries</div>
          </div>
        </div>

        {/* Top Performing Course */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Top Performing Course</span>
          </div>
          <div className="text-lg font-semibold text-primary">{metrics.topPerformingCourse}</div>
          <div className="text-xs text-muted-foreground mt-1">Highest engagement & completion rate</div>
        </div>
      </CardContent>
    </Card>
  );
}
