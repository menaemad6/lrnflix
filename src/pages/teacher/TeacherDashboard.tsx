
import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, BarChart3, MessageSquare, Gift, Plus, TrendingUp, Target, Zap, Brain, Sparkles, GraduationCap, Calendar, Trophy, Star, Clock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  HeroSectionSkeleton, 
  StatsGridSkeleton, 
  RecentCoursesSkeleton, 
  QuickActionsSkeleton, 
  TeachingProgressSkeleton,
  PerformanceMetricsSkeleton,
  RecentActivitySkeleton,
  UpcomingTasksSkeleton,
  StudentInsightsSkeleton
} from '@/components/teacher/skeletons';

import {
  TeacherHeroSection,
  TeacherStatsGrid,
  TeacherRecentCourses,
  TeacherQuickActions,
  TeacherTeachingProgress,
  TeacherPerformanceMetrics,
  TeacherRecentActivity,
  TeacherUpcomingTasks,
  TeacherStudentInsights
} from '@/components/teacher';

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

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  activeDiscussions: number;
}

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

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'course' | 'lesson' | 'review' | 'meeting' | 'deadline' | 'reminder';
  courseId?: string;
  courseName?: string;
  completed: boolean;
  metadata?: {
    studentCount?: number;
    lessonCount?: number;
    rating?: number;
  };
}

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
  timeSpent: number;
}

export const TeacherDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    activeDiscussions: 0
  });
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    totalStudents: 0,
    totalCourses: 0,
    averageRating: 4.2,
    completionRate: 78,
    engagementScore: 85,
    responseTime: 2.5,
    monthlyGrowth: 12,
    topPerformingCourse: 'Advanced React Development'
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [students, setStudents] = useState<StudentInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // Fetch courses with enrollment count
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          enrollments(count)
        `)
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;
      setCourses(coursesData || []);

      // Calculate stats
      const totalCourses = coursesData?.length || 0;
      const totalStudents = coursesData?.reduce((sum, course) => 
        sum + (course.enrollments?.[0]?.count || 0), 0) || 0;
      const totalRevenue = coursesData?.reduce((sum, course) => 
        sum + (course.price * (course.enrollments?.[0]?.count || 0)), 0) || 0;

      // Fetch active discussions count
      const { count: discussionsCount } = await supabase
        .from('discussions')
        .select('*', { count: 'exact', head: true })
        .in('course_id', coursesData?.map(c => c.id) || []);

      setStats({
        totalCourses,
        totalStudents,
        totalRevenue,
        activeDiscussions: discussionsCount || 0
      });

      // Update performance metrics with real data
      setPerformanceMetrics(prev => ({
        ...prev,
        totalStudents,
        totalCourses,
        monthlyGrowth: Math.floor(Math.random() * 20) + 5, // Simulated growth
        topPerformingCourse: coursesData?.[0]?.title || 'No courses yet'
      }));

      // Generate mock activities based on real data
      const mockActivities: ActivityItem[] = [];
      if (coursesData && coursesData.length > 0) {
        coursesData.forEach((course, index) => {
          // Add course creation activity
          mockActivities.push({
            id: `course-${course.id}`,
            type: 'course_created',
            title: 'Course Created',
            description: `Created course: ${course.title}`,
            timestamp: course.created_at,
            course: { name: course.title, id: course.id }
          });

          // Add enrollment activities
          if (course.enrollments?.[0]?.count) {
            mockActivities.push({
              id: `enrollment-${course.id}`,
              type: 'enrollment',
              title: 'Student Enrollment',
              description: `New student enrolled in ${course.title}`,
              timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
              user: { name: `Student ${Math.floor(Math.random() * 1000)}` },
              course: { name: course.title, id: course.id },
              metadata: { studentCount: course.enrollments[0].count }
            });
          }
        });
      }
      setActivities(mockActivities);

      // Generate mock tasks
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Review student submissions',
          description: 'Review and grade assignments for Advanced React course',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          priority: 'high',
          type: 'review',
          courseName: 'Advanced React Development',
          completed: false,
          metadata: { studentCount: 15 }
        },
        {
          id: '2',
          title: 'Create new lesson content',
          description: 'Add new lessons to JavaScript Fundamentals course',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'medium',
          type: 'lesson',
          courseName: 'JavaScript Fundamentals',
          completed: false,
          metadata: { lessonCount: 5 }
        },
        {
          id: '3',
          title: 'Weekly student check-in',
          description: 'Schedule 1-on-1 sessions with struggling students',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'medium',
          type: 'meeting',
          completed: false
        }
      ];
      setTasks(mockTasks);

      // Generate mock student insights
      const mockStudents: StudentInsight[] = [];
      if (coursesData && coursesData.length > 0) {
        coursesData.forEach((course, courseIndex) => {
          const studentCount = course.enrollments?.[0]?.count || 0;
          for (let i = 0; i < Math.min(studentCount, 3); i++) {
            const engagement = ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low';
            mockStudents.push({
              id: `student-${course.id}-${i}`,
              name: `Student ${courseIndex * 3 + i + 1}`,
              email: `student${courseIndex * 3 + i + 1}@example.com`,
              courseId: course.id,
              courseName: course.title,
              enrollmentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
              lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
              progress: Math.floor(Math.random() * 100),
              engagement,
              rating: Math.floor(Math.random() * 5) + 1,
              discussionPosts: Math.floor(Math.random() * 10),
              lessonsCompleted: Math.floor(Math.random() * 20),
              totalLessons: 25,
              timeSpent: Math.floor(Math.random() * 50) + 5
            });
          }
        });
      }
      setStudents(mockStudents);

    } catch (error: unknown) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Welcome Section */}
        <Suspense fallback={<HeroSectionSkeleton />}>
          <TeacherHeroSection user={user} />
        </Suspense>

        {/* Enhanced Stats Grid */}
        <Suspense fallback={<StatsGridSkeleton />}>
          <TeacherStatsGrid stats={stats} />
        </Suspense>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Courses */}
          <Suspense fallback={<RecentCoursesSkeleton />}>
            <TeacherRecentCourses courses={courses} />
          </Suspense>

          {/* Quick Actions & Tools */}
          <Suspense fallback={<QuickActionsSkeleton />}>
            <TeacherQuickActions />
          </Suspense>
        </div>

        {/* Performance Metrics */}
        <Suspense fallback={<PerformanceMetricsSkeleton />}>
          <TeacherPerformanceMetrics metrics={performanceMetrics} />
        </Suspense>

        {/* Activity and Tasks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Suspense fallback={<RecentActivitySkeleton />}>
            <TeacherRecentActivity activities={activities} />
          </Suspense>
          <Suspense fallback={<UpcomingTasksSkeleton />}>
            <TeacherUpcomingTasks tasks={tasks} />
          </Suspense>
        </div>

        {/* Student Insights */}
        <Suspense fallback={<StudentInsightsSkeleton />}>
          <TeacherStudentInsights students={students} />
        </Suspense>

        {/* Achievement & Progress Section */}
        <Suspense fallback={<TeachingProgressSkeleton />}>
          <TeacherTeachingProgress stats={stats} />
        </Suspense>
      </div>
    </DashboardLayout>
  );
};
