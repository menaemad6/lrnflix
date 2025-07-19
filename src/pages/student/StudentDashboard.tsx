import React, { useState, useEffect , Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Play, Target, Zap, GraduationCap, Users, TrendingUp, Calendar } from 'lucide-react';
import type { RootState } from '@/store/store';
import { useTenant } from '@/contexts/TenantContext';
import { PremiumCourseCard } from '@/components/courses/PremiumCourseCard';
import { Skeleton } from '@/components/ui/skeleton';

const StudentProfileStats = React.lazy(() => import('@/components/student/StudentProfileStats').then(m => ({ default: m.StudentProfileStats })));
const ProfileStatsSkeleton = React.lazy(() => import('@/components/student/skeletons/ProfileStatsSkeleton').then(m => ({ default: m.ProfileStatsSkeleton })));
const AiAdviceCard = React.lazy(() => import('@/components/student/AiAdviceCard').then(m => ({ default: m.AiAdviceCard })));
const AiAdviceCardSkeleton = React.lazy(() => import('@/components/student/skeletons/AiAdviceCardSkeleton').then(m => ({ default: m.AiAdviceCardSkeleton })));
const ContinueLearningSection = React.lazy(() => import('@/components/student/ContinueLearningSection').then(m => ({ default: m.ContinueLearningSection })));
const ContinueLearningSkeleton = React.lazy(() => import('@/components/student/skeletons/ContinueLearningSkeleton').then(m => ({ default: m.ContinueLearningSkeleton })));
const WalletCard = React.lazy(() => import('@/components/wallet/WalletCard').then(m => ({ default: m.WalletCard })));
const StudentGoals = React.lazy(() => import('@/components/student/StudentGoals').then(m => ({ default: m.StudentGoals })));
const StudentAchievements = React.lazy(() => import('@/components/student/StudentAchievements').then(m => ({ default: m.StudentAchievements })));
const StudentActivity = React.lazy(() => import('@/components/student/StudentActivity').then(m => ({ default: m.StudentActivity })));

interface EnrolledCourse {
  id: string;
  course: {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    instructor_id: string;
    instructor_name?: string;
    enrollment_code?: string;
    cover_image_url?: string;
    created_at?: string;
    avatar_url?: string; // NEW
  };
  enrolled_at: string;
  progress?: number;
  totalLessons?: number;
  completedLessons?: number;
  enrollment_count?: number;
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
  const navigate = useNavigate();
  const [instructorAvatars, setInstructorAvatars] = useState<Record<string, string | undefined>>({});

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
            instructor_id,
            cover_image_url
          )
        `)
        .eq('student_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (teacher) {
        enrollmentsQuery = enrollmentsQuery.filter('course.instructor_id', 'eq', teacher.user_id);
      }

      const { data: enrollmentsData, error: enrollmentsError } = await enrollmentsQuery;

      if (enrollmentsError) throw enrollmentsError;

      // Fetch all unique instructor_ids
      const instructorIds = Array.from(new Set((enrollmentsData as EnrolledCourse[] || [])
        .map(e => e.course?.instructor_id)
        .filter(Boolean)));
      // Fetch all names and avatars in one go
      const names: Record<string, string | undefined> = {};
      const avatars: Record<string, string | undefined> = {};
      if (instructorIds.length > 0) {
        const { data: teachersData } = await supabase
          .from('teachers')
          .select('user_id, display_name, profile_image_url')
          .in('user_id', instructorIds);
        if (teachersData) {
          (teachersData as Array<{ user_id: string; display_name?: string; profile_image_url?: string }>).forEach((t) => {
            names[t.user_id] = t.display_name;
            avatars[t.user_id] = t.profile_image_url;
          });
        }
      }
      setInstructorAvatars(avatars);

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
              course: {
                ...enrollment.course,
                instructor_name: names[enrollment.course.instructor_id] || 'Course Instructor',
                avatar_url: avatars[enrollment.course.instructor_id] || undefined // Ensure avatar_url is always present
              },
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

    } catch (error: unknown) {
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Profile Header */}
        <Suspense fallback={<ProfileStatsSkeleton />}>
          <StudentProfileStats stats={stats} user={user!} />
        </Suspense>

        {/* AI Intelligence Section */}
        <Suspense fallback={<AiAdviceCardSkeleton />}>
          <AiAdviceCard />
        </Suspense>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (left) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Continue Learning */}
            <Suspense fallback={<ContinueLearningSkeleton />}>
              <ContinueLearningSection
                enrolledCourses={enrolledCourses}
                onContinue={(courseId) => navigate(`/courses/${courseId}`)}
              />
            </Suspense>

            {/* WalletCard: show after courses on small/medium, hide on lg+ */}
            <div className="block lg:hidden">
              <Suspense fallback={null}>
                <WalletCard />
              </Suspense>
            </div>

            {/* Goals Section */}
            <Suspense fallback={null}>
              <StudentGoals stats={stats} />
            </Suspense>

            {/* Activity & Achievements: stacked on mobile, only Achievements on lg+ */}
            <div className="grid grid-cols-1 gap-6">
              {/* On mobile: Activity then Achievements. On lg+: only Achievements. */}
              <div className="block lg:hidden">
                <Suspense fallback={null}>
                  <StudentActivity stats={stats} />
                </Suspense>
              </div>
              <Suspense fallback={null}>
                <StudentAchievements stats={stats} />
              </Suspense>
            </div>
          </div>

          {/* Sidebar: only on lg+ */}
          <div className="space-y-6 hidden lg:block">
            <Suspense fallback={null}>
              <WalletCard />
            </Suspense>
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
            <Suspense fallback={null}>
              <StudentActivity stats={stats} />
            </Suspense>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
