import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, GraduationCap, Plus, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number;
  created_at: string;
  enrollments?: { count: number }[];
}

interface TeacherRecentCoursesProps {
  courses: Course[];
}

export function TeacherRecentCourses({ courses }: TeacherRecentCoursesProps) {
  return (
    <Card className="glass-card border-0 lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="gradient-text text-xl">Recent Courses</CardTitle>
            <CardDescription>Your latest teaching content</CardDescription>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            {courses.length} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.slice(0, 5).map((course) => (
          <div key={course.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all duration-300 group border border-white/5 hover:border-emerald-500/30">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="h-7 w-7 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold group-hover:text-emerald-400 transition-colors mb-1">
                {course.title}
              </h3>
              <div className="flex items-center gap-3">
                <Badge 
                  variant={course.status === 'published' ? 'default' : 'secondary'} 
                  className={`text-xs ${course.status === 'published' ? 'bg-emerald-500 text-black' : ''}`}
                >
                  {course.status}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {course.enrollments?.[0]?.count || 0} students
                </span>
                <span className="text-xs text-emerald-400 font-medium">
                  {course.price} credits
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
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
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
          <div className="pt-4">
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
