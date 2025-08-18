import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, TrendingUp, Clock, Target, Star, BookOpen, MessageSquare, Award, Eye, Calendar } from 'lucide-react';

interface StudentInsight {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  courseId: string;
  courseName: string;
  enrollmentDate: string;
  lastActive: string;
  progress: number;
  engagement: 'high' | 'medium' | 'low';
  rating?: number;
  discussionPosts: number;
  lessonsCompleted: number;
  totalLessons: number;
  timeSpent: number; // in hours
}

interface TeacherStudentInsightsProps {
  students: StudentInsight[];
}

export function TeacherStudentInsights({ students }: TeacherStudentInsightsProps) {
  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'high':
        return 'bg-primary-500/20 text-primary-400 border-primary-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getEngagementIcon = (engagement: string) => {
    switch (engagement) {
      case 'high':
        return <TrendingUp className="h-4 w-4 text-primary-400" />;
      case 'medium':
        return <Target className="h-4 w-4 text-yellow-400" />;
      case 'low':
        return <Clock className="h-4 w-4 text-red-400" />;
      default:
        return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatLastActive = (lastActive: string) => {
    const date = new Date(lastActive);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatEnrollmentDate = (enrollmentDate: string) => {
    const date = new Date(enrollmentDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-primary-400';
    if (progress >= 60) return 'text-yellow-400';
    if (progress >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const sortedStudents = [...students].sort((a, b) => {
    // Sort by engagement first, then by progress
    const engagementOrder = { high: 3, medium: 2, low: 1 };
    if (engagementOrder[a.engagement] !== engagementOrder[b.engagement]) {
      return engagementOrder[b.engagement] - engagementOrder[a.engagement];
    }
    return b.progress - a.progress;
  });

  const highEngagementStudents = sortedStudents.filter(s => s.engagement === 'high');
  const mediumEngagementStudents = sortedStudents.filter(s => s.engagement === 'medium');
  const lowEngagementStudents = sortedStudents.filter(s => s.engagement === 'low');

  return (
    <Card className="glass-card border-0 hover-glow">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="gradient-text text-xl">Student Insights</CardTitle>
            <p className="text-muted-foreground text-sm">Monitor student engagement and progress</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Engagement Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
            <div className="text-lg font-bold text-primary-400">{highEngagementStudents.length}</div>
            <div className="text-xs text-muted-foreground">High Engagement</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <div className="text-lg font-bold text-yellow-400">{mediumEngagementStudents.length}</div>
            <div className="text-xs text-muted-foreground">Medium Engagement</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="text-lg font-bold text-red-400">{lowEngagementStudents.length}</div>
            <div className="text-xs text-muted-foreground">Low Engagement</div>
          </div>
        </div>

        {/* Student List */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Top Students by Engagement
          </h3>
          
          {sortedStudents.slice(0, 6).map((student) => (
            <div key={student.id} className="p-3 rounded-xl border border-white/5 hover:border-primary/30 transition-all duration-300 group hover:bg-white/5">
              <div className="flex items-center gap-3">
                {/* Student Avatar */}
                <Avatar className="w-10 h-10 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                  <AvatarImage src={student.avatar} alt={student.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-sm font-medium">
                    {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Student Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {student.name}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getEngagementColor(student.engagement)}`}
                    >
                      {getEngagementIcon(student.engagement)}
                      {student.engagement}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="truncate">{student.courseName}</span>
                    <span>•</span>
                    <span>Enrolled {formatEnrollmentDate(student.enrollmentDate)}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor(student.progress)}`}
                      style={{ 
                        width: `${student.progress}%`,
                        background: `linear-gradient(90deg, ${getProgressColor(student.progress)} 0%, ${getProgressColor(student.progress)}80 100%)`
                      }}
                    />
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-primary-400">
                      <Target className="h-3 w-3" />
                      <span>{student.progress}%</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-400">
                      <BookOpen className="h-3 w-3" />
                      <span>{student.lessonsCompleted}/{student.totalLessons}</span>
                    </div>
                    <div className="flex items-center gap-1 text-purple-400">
                      <Clock className="h-3 w-3" />
                      <span>{student.timeSpent}h</span>
                    </div>
                    {student.rating && (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="h-3 w-3 fill-current" />
                        <span>{student.rating}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-indigo-400">
                      <MessageSquare className="h-3 w-3" />
                      <span>{student.discussionPosts}</span>
                    </div>
                  </div>
                </div>
                
                {/* Last Active */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-xs text-muted-foreground">Last active</div>
                  <div className="text-xs font-medium text-foreground">
                    {formatLastActive(student.lastActive)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Students */}
        {students.length > 6 && (
          <div className="pt-3 border-t border-primary/20">
            <button className="w-full text-center text-sm text-primary hover:text-primary/80 transition-colors">
              View all {students.length} students
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
