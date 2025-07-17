import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { WalletCard } from '@/components/wallet/WalletCard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StudentProfileStats } from '@/components/student/StudentProfileStats';
import { AiAdviceCard } from '@/components/student/AiAdviceCard';
import { StudentAchievements } from '@/components/student/StudentAchievements';
import { StudentActivity } from '@/components/student/StudentActivity';
import { StudentGoals } from '@/components/student/StudentGoals';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Play, Target, Zap, GraduationCap, Users, TrendingUp, Calendar } from 'lucide-react';
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
  };
  enrolled_at: string;
  progress?: number;
  totalLessons?: number;
  completedLessons?: number;
}

export const StudentDashboard = () => {
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const { teacher } = useTenant();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalCreditsSpent: 0,
    studyStreak: 0,
    avgQuizScore: 0,
    totalStudyTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (!user) throw new Error('Not authenticated');

      // Fetch enrolled courses
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
            instructor_id
          )
        `)
        .eq('student_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (teacher) {
        enrollmentsQuery = enrollmentsQuery.filter('course.instructor_id', 'eq', teacher.user_id);
      }

      const { data: enrollmentsData, error: enrollmentsError } = await enrollmentsQuery;

      if (enrollmentsError) throw enrollmentsError;

      // Fetch progress for each course
      const coursesWithProgress = await Promise.all(
        (enrollmentsData || [])
          .filter((enrollment: EnrolledCourse) => enrollment.course && enrollment.course.id)
          .map(async (enrollment: EnrolledCourse) => {
            // Get total lessons count
            const { count: totalLessons } = await supabase
              .from('lessons')
              .select('*', { count: 'exact', head: true })
              .eq('course_id', enrollment.course.id);

            // Get completed lessons count
            const { count: completedLessons } = await supabase
              .from('lesson_progress')
              .select('*', { count: 'exact', head: true })
              .eq('student_id', user.id)
              .in('lesson_id', 
                await supabase
                  .from('lessons')
                  .select('id')
                  .eq('course_id', enrollment.course.id)
                  .then(res => res.data?.map(l => l.id) || [])
              );

            const progress = totalLessons ? Math.round((completedLessons || 0) / totalLessons * 100) : 0;

            return {
              ...enrollment,
              progress,
              totalLessons: totalLessons || 0,
              completedLessons: completedLessons || 0
            };
          })
      );

      setEnrolledCourses(coursesWithProgress);

      // Calculate stats
      const totalCreditsSpent = coursesWithProgress.reduce((sum, course) => sum + course.course.price, 0);
      const completedCourses = coursesWithProgress.filter(course => course.progress === 100).length;
      const inProgressCourses = coursesWithProgress.filter(course => course.progress > 0 && course.progress < 100).length;

      // Fetch additional stats
      const { data: quizAttempts } = await supabase
        .from('quiz_attempts')
        .select('score, max_score')
        .eq('student_id', user.id);

      const avgQuizScore = quizAttempts && quizAttempts.length > 0 
        ? Math.round(quizAttempts.reduce((sum, attempt) => 
            sum + (attempt.score || 0) / (attempt.max_score || 1), 0
          ) / quizAttempts.length * 100)
        : 0;

      setStats({
        totalCourses: coursesWithProgress.length,
        completedCourses,
        inProgressCourses,
        totalCreditsSpent,
        studyStreak: Math.floor(Math.random() * 15) + 1, // Placeholder for now
        avgQuizScore: avgQuizScore / 100, // Convert to decimal
        totalStudyTime: Math.floor(Math.random() * 50) + 10 // Placeholder for now
      });

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <span className="text-muted-foreground">Loading your profile...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Profile Header */}
        <StudentProfileStats stats={stats} user={user!} />

        {/* AI Intelligence Section */}
        <AiAdviceCard />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Continue Learning */}
            <Card className="glass-card border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="gradient-text">Continue Learning</CardTitle>
                  <Link to="/courses">
                    <Button className="btn-secondary" size="sm">
                      <Target className="h-4 w-4 mr-2" />
                      Explore More
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {enrolledCourses.length > 0 ? (
                  <div className="space-y-4">
                    {enrolledCourses.slice(0, 3).map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium group-hover:text-emerald-400 transition-colors">
                            {enrollment.course.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={enrollment.progress} className="h-1 flex-1" />
                            <span className="text-xs text-muted-foreground">{enrollment.progress}%</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {enrollment.completedLessons} / {enrollment.totalLessons} lessons completed
                          </div>
                        </div>
                        <Link to={`/courses/${enrollment.course.id}`}>
                          <Button size="sm" className="btn-secondary">
                            <Play className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                    <div className="mt-4">
                      <Link to="/student/courses">
                        <Button className="w-full btn-secondary">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          View All My Courses
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Courses Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start your learning journey by enrolling in a course.
                    </p>
                    <Link to="/courses">
                      <Button className="btn-primary">
                        <Target className="h-4 w-4 mr-2" />
                        Browse Courses
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Goals Section */}
            <StudentGoals stats={stats} />

            {/* Quick Actions */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="gradient-text">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/student/store">
                    <div className="p-4 rounded-xl hover:bg-white/5 transition-colors border border-white/10 group cursor-pointer">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Zap className="h-5 w-5 text-purple-400" />
                      </div>
                      <h3 className="font-medium mb-1">Buy Credits</h3>
                      <p className="text-xs text-muted-foreground">Purchase credits for courses</p>
                    </div>
                  </Link>
                  <Link to="/groups">
                    <div className="p-4 rounded-xl hover:bg-white/5 transition-colors border border-white/10 group cursor-pointer">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Users className="h-5 w-5 text-blue-400" />
                      </div>
                      <h3 className="font-medium mb-1">Study Groups</h3>
                      <p className="text-xs text-muted-foreground">Join or create study groups</p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <WalletCard />
            <StudentAchievements stats={stats} />
            <StudentActivity stats={stats} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
