import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Zap, BookOpen, Brain, Target } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'lesson' | 'quiz' | 'course' | 'achievement';
  title: string;
  subtitle?: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

interface StudentActivityProps {
  stats: {
    totalCourses: number;
    completedCourses: number;
    studyStreak?: number;
  };
}

export const StudentActivity = ({ stats }: StudentActivityProps) => {
  // Generate sample recent activities
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'lesson' as const,
      title: 'Completed "Advanced React Patterns"',
      subtitle: 'Frontend Development Course',
      timestamp: '2 hours ago',
      icon: <BookOpen className="h-4 w-4" />,
      color: 'text-blue-400'
    },
    {
      id: '2',
      type: 'quiz' as const,
      title: 'Scored 95% on JavaScript Quiz',
      subtitle: 'Web Development Fundamentals',
      timestamp: '1 day ago',
      icon: <Brain className="h-4 w-4" />,
      color: 'text-green-400'
    },
    {
      id: '3',
      type: 'course' as const,
      title: 'Enrolled in "Data Structures & Algorithms"',
      subtitle: 'Computer Science',
      timestamp: '2 days ago',
      icon: <Target className="h-4 w-4" />,
      color: 'text-purple-400'
    },
    {
      id: '4',
      type: 'achievement' as const,
      title: 'Unlocked "Quiz Master" achievement',
      subtitle: 'Achieved 90%+ average score',
      timestamp: '3 days ago',
      icon: <Zap className="h-4 w-4" />,
      color: 'text-yellow-400'
    },
    {
      id: '5',
      type: 'lesson' as const,
      title: 'Completed "Database Optimization"',
      subtitle: 'Backend Development Course',
      timestamp: '4 days ago',
      icon: <BookOpen className="h-4 w-4" />,
      color: 'text-blue-400'
    }
  ].slice(0, Math.min(stats.totalCourses + 2, 5)); // Show relevant number of activities

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lesson': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'quiz': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'course': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'achievement': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="gradient-text flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            {stats.studyStreak || 0} day streak
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex items-start gap-4 group hover:bg-white/5 transition-colors rounded-lg p-2 -m-2">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className={activity.color}>
                      {activity.icon}
                    </span>
                  </div>
                  {index < activities.length - 1 && (
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-px h-6 bg-gradient-to-b from-white/20 to-transparent" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm text-white">
                      {activity.title}
                    </h4>
                    <Badge className={`text-xs ${getTypeColor(activity.type)}`}>
                      {activity.type}
                    </Badge>
                  </div>
                  {activity.subtitle && (
                    <p className="text-xs text-muted-foreground mb-1">
                      {activity.subtitle}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {activity.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">
              No recent activity yet
            </p>
            <p className="text-xs text-muted-foreground">
              Start learning to see your activity timeline here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
