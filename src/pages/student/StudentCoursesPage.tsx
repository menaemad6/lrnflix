
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PremiumCourseCard } from '@/components/courses/PremiumCourseCard';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Trophy, Play, Sparkles } from 'lucide-react';
import type { RootState } from '@/store/store';
import { useTenant } from '@/contexts/TenantContext';

interface EnrolledCourse {
  id: string;
  course: {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    instructor_name: string;
    cover_image_url?: string;
    enrollment_code?: string;
    created_at: string;
  };
  enrolled_at: string;
  progress?: number;
  totalLessons?: number;
  completedLessons?: number;
  enrollment_count?: number;
}

export const StudentCoursesPage = () => {
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const { teacher } = useTenant();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      if (!user) throw new Error('Not authenticated');

      let enrollmentsQuery = supabase
        .from('enrollments')
        .select(`
          id,
          enrolled_at,
          course:courses (
            id,
            title,
            description,
            category,
            price,
            cover_image_url,
            enrollment_code,
            created_at,
            instructor_id,
            profiles!courses_instructor_id_fkey(full_name)
          )
        `)
        .eq('student_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (teacher) {
        enrollmentsQuery = enrollmentsQuery.filter('course.instructor_id', 'eq', teacher.user_id);
      }

      const { data: enrollmentsData, error: enrollmentsError } = await enrollmentsQuery;

      if (enrollmentsError) throw enrollmentsError;

      const coursesWithProgress = await Promise.all(
        (enrollmentsData || [])
          .filter((enrollment: any) => enrollment.course && enrollment.course.id)
          .map(async (enrollment: any) => {
            // Only count lessons for progress calculation
            const { count: totalLessons } = await supabase
              .from('lessons')
              .select('*', { count: 'exact', head: true })
              .eq('course_id', enrollment.course.id);

            // Get all lesson IDs for this course
            const { data: lessonsData } = await supabase
              .from('lessons')
              .select('id')
              .eq('course_id', enrollment.course.id);

            const lessonIds = lessonsData?.map(l => l.id) || [];

            // Count completed lessons
            const { count: completedLessons } = await supabase
              .from('lesson_progress')
              .select('*', { count: 'exact', head: true })
              .eq('student_id', user.id)
              .in('lesson_id', lessonIds);

            // Get enrollment count for this course
            const { count: enrollmentCount } = await supabase
              .from('enrollments')
              .select('*', { count: 'exact', head: true })
              .eq('course_id', enrollment.course.id);

            const progress = totalLessons ? Math.round((completedLessons || 0) / totalLessons * 100) : 0;

            return {
              ...enrollment,
              course: {
                ...enrollment.course,
                instructor_name: enrollment.course.profiles?.full_name || "Course Instructor"
              },
              progress,
              totalLessons: totalLessons || 0,
              completedLessons: completedLessons || 0,
              enrollment_count: enrollmentCount || 0
            };
          })
      );

      setEnrolledCourses(coursesWithProgress);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load courses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold gradient-text">My Learning Journey</h2>
            <p className="text-muted-foreground mt-1">Continue your progress and discover new skills</p>
          </div>
          <Link to="/courses">
            <Button className="btn-primary">
              <BookOpen className="h-4 w-4 mr-2" />
              Explore Courses
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : enrolledCourses.length === 0 ? (
          <Card className="glass-card border-0 hover-glow">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
                <BookOpen className="h-10 w-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 gradient-text">Start Your Learning Adventure</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Unlock your potential with our AI-powered courses designed to accelerate your growth.
              </p>
              <Link to="/courses">
                <Button className="btn-primary">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((enrollment) => (
              <PremiumCourseCard
                key={enrollment.id}
                id={enrollment.course.id}
                title={enrollment.course.title}
                description={enrollment.course.description}
                category={enrollment.course.category}
                status="Active"
                instructor_name={enrollment.course.instructor_name}
                enrollment_count={enrollment.enrollment_count || 0}
                is_enrolled={true}
                enrollment_code={enrollment.course.enrollment_code || ""}
                cover_image_url={enrollment.course.cover_image_url}
                created_at={enrollment.course.created_at}
                price={enrollment.course.price}
                progress={enrollment.progress}
                isHovering={true}
                onPreview={() => {}}
                onEnroll={() => {}}
                onContinue={() => {
                  window.location.href = `/courses/${enrollment.course.id}`;
                }}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
