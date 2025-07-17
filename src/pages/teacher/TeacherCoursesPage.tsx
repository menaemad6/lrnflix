
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CreateCourseModal } from '@/components/courses/CreateCourseModal';

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number;
  created_at: string;
  enrollments?: { count: number }[];
}

export const TeacherCoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: coursesData, error } = await supabase
        .from('courses')
        .select(`
          *,
          enrollments(count)
        `)
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(coursesData || []);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseCreated = () => {
    fetchCourses();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold gradient-text">Course Management</h2>
            <p className="text-muted-foreground mt-1">Create and manage your educational content</p>
          </div>
          <Button 
            className="btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Course
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : courses.length === 0 ? (
          <Card className="glass-card border-0 hover-glow">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
                <BookOpen className="h-10 w-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 gradient-text">Create Your First Course</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Share your expertise with students worldwide. Build engaging courses with our AI-powered tools.
              </p>
              <Button 
                className="btn-primary"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Start Creating
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="glass-card border-0 hover-glow group">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-emerald-400 transition-colors">
                        {course.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={course.status === 'published' ? 'default' : 'secondary'} 
                               className={course.status === 'published' ? 'bg-emerald-500 text-black' : ''}>
                          {course.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {course.enrollments?.[0]?.count || 0} students
                        </span>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-sm">{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold gradient-text">{course.price} credits</span>
                    <span className="text-sm text-muted-foreground">
                      Revenue: {(course.price * (course.enrollments?.[0]?.count || 0))} credits
                    </span>
                  </div>
                  <Link to={`/teacher/courses/${course.id}`}>
                    <Button className="w-full btn-secondary group-hover:scale-105 transition-transform">
                      Manage Course
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateCourseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCourseCreated={handleCourseCreated}
      />
    </DashboardLayout>
  );
};
