import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, GraduationCap, Plus, ArrowUpRight, Clock, Eye, TrendingUp, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number;
  created_at: string;
  cover_image_url?: string | null;
  enrollments?: { count: number }[];
}

interface TeacherRecentCoursesProps {
  courses: Course[];
}

export function TeacherRecentCourses({ courses }: TeacherRecentCoursesProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-primary-500/20 text-primary-400 border-primary-500/30';
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'archived':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <Card className="glass-card border-0 lg:col-span-2 hover-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="gradient-text text-xl">Recent Courses</CardTitle>
              <CardDescription className="text-muted-foreground">Your latest teaching content</CardDescription>
            </div>
          </div>
          <Badge className="bg-primary-500/20 text-primary-400 border-primary-500/30 px-3 py-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            {courses.length} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.slice(0, 5).map((course) => (
          <div key={course.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all duration-300 group border border-white/5 hover:border-primary-500/30">
            {/* Course Thumbnail */}
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 group-hover:border-primary-500/30 transition-all duration-300">
              {course.cover_image_url ? (
                <img 
                  src={course.cover_image_url} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-7 w-7 text-primary-400" />
                </div>
              )}
              {/* Status indicator */}
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                course.status === 'published' ? 'bg-primary-500' : 
                course.status === 'draft' ? 'bg-yellow-500' : 'bg-gray-500'
              }`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold group-hover:text-primary-400 transition-colors mb-1 truncate">
                {course.title}
              </h3>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusColor(course.status)}`}
                >
                  {course.status}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {course.enrollments?.[0]?.count || 0} students
                </span>
                <span className="text-xs text-primary-400 font-medium flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {course.price} credits
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(course.created_at)}
                </span>
              </div>
            </div>
            
            <Link to={`/teacher/courses/${course.id}`}>
              <Button size="sm" className="btn-secondary group-hover:scale-105 transition-transform">
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ))}
        
        {courses.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-primary-400 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-4">Create your first course to get started</p>
            <Link to="/teacher/create-course">
              <Button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </Link>
          </div>
        )}
        
        {courses.length > 0 && (
          <div className="pt-4 border-t border-primary/20">
            <Link to="/teacher/courses">
              <Button className="w-full btn-secondary group">
                <GraduationCap className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                View All Courses
                <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
