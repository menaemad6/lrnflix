import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, BookOpen, Users, Star, Clock, TrendingUp, Award, Calendar, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ActivityItem {
  id: string;
  type: 'enrollment' | 'discussion' | 'rating' | 'course_created' | 'lesson_added' | 'student_joined';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  course?: {
    name: string;
    id: string;
  };
  metadata?: {
    rating?: number;
    studentCount?: number;
    lessonCount?: number;
  };
}

interface TeacherRecentActivityProps {
  activities: ActivityItem[];
}

export function TeacherRecentActivity({ activities }: TeacherRecentActivityProps) {
  const { t } = useTranslation('teacher');
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment':
        return <Users className="h-4 w-4 text-primary-400" />;
      case 'discussion':
        return <MessageSquare className="h-4 w-4 text-blue-400" />;
      case 'rating':
        return <Star className="h-4 w-4 text-yellow-400" />;
      case 'course_created':
        return <BookOpen className="h-4 w-4 text-purple-400" />;
      case 'lesson_added':
        return <Award className="h-4 w-4 text-indigo-400" />;
      case 'student_joined':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'enrollment':
        return 'bg-primary-500/20 text-primary-400 border-primary-500/30';
      case 'discussion':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'rating':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'course_created':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'lesson_added':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'student_joined':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) return `${diffMinutes}${t('common.minutesAgo')}`;
    if (diffHours < 24) return `${diffHours}${t('common.hoursAgo')}`;
    if (diffDays === 1) return t('common.yesterday');
    if (diffDays <= 7) return `${diffDays} ${t('common.daysAgo')}`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getActivityDescription = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'enrollment':
        return t('dashboard.recentActivity.enrollmentDescription', { userName: activity.user?.name, courseName: activity.course?.name });
      case 'discussion':
        return t('dashboard.recentActivity.discussionDescription', { userName: activity.user?.name, courseName: activity.course?.name });
      case 'rating':
        return t('dashboard.recentActivity.ratingDescription', { userName: activity.user?.name, rating: activity.metadata?.rating, courseName: activity.course?.name });
      case 'course_created':
        return t('dashboard.recentActivity.courseCreatedDescription', { courseName: activity.course?.name });
      case 'lesson_added':
        return t('dashboard.recentActivity.lessonAddedDescription', { lessonCount: activity.metadata?.lessonCount, courseName: activity.course?.name });
      case 'student_joined':
        return t('dashboard.recentActivity.studentJoinedDescription', { studentCount: activity.metadata?.studentCount, courseName: activity.course?.name });
      default:
        return activity.description;
    }
  };

  return (
    <Card className="glass-card border-0 hover-glow">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-accent-500 rounded-xl flex items-center justify-center">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="gradient-text text-xl">{t('dashboard.recentActivity.title')}</CardTitle>
            <p className="text-muted-foreground text-sm">{t('dashboard.recentActivity.description')}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground">{t('dashboard.recentActivity.noActivity')}</p>
          </div>
        ) : (
          activities.slice(0, 8).map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 group">
              {/* Activity Icon */}
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                {getActivityIcon(activity.type)}
              </div>
              
              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {getActivityDescription(activity)}
                  </p>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getActivityColor(activity.type)}`}
                  >
                    {activity.type.replace('_', ' ')}
                  </Badge>
                </div>
                
                {/* Course Info */}
                {activity.course && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <BookOpen className="h-3 w-3" />
                    <span className="truncate">{activity.course.name}</span>
                  </div>
                )}
                
                {/* User Info */}
                {activity.user && (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">
                        {activity.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{activity.user.name}</span>
                  </div>
                )}
                
                {/* Metadata */}
                {activity.metadata && (
                  <div className="flex items-center gap-3 mt-2">
                    {activity.metadata.rating && (
                      <div className="flex items-center gap-1 text-xs text-yellow-400">
                        <Star className="h-3 w-3 fill-current" />
                        <span>{activity.metadata.rating}</span>
                      </div>
                    )}
                    {activity.metadata.studentCount && (
                      <div className="flex items-center gap-1 text-xs text-primary-400">
                        <Users className="h-3 w-3" />
                        <span>{activity.metadata.studentCount}</span>
                      </div>
                    )}
                    {activity.metadata.lessonCount && (
                      <div className="flex items-center gap-1 text-xs text-blue-400">
                        <Award className="h-3 w-3" />
                        <span>{activity.metadata.lessonCount}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Timestamp */}
              <div className="flex-shrink-0 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                {formatTimestamp(activity.timestamp)}
              </div>
            </div>
          ))
        )}
        
        {activities.length > 8 && (
          <div className="pt-3 border-t border-primary/20">
            <button className="w-full text-center text-sm text-primary hover:text-primary/80 transition-colors">
              {t('dashboard.recentActivity.viewAll', { count: activities.length })}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
