
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
  TeachingProgressSkeleton 
} from '@/components/teacher/skeletons';

import {
  TeacherHeroSection,
  TeacherStatsGrid,
  TeacherRecentCourses,
  TeacherQuickActions,
  TeacherTeachingProgress
} from '@/components/teacher';

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number;
  created_at: string;
  enrollments?: { count: number }[];
}

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  activeDiscussions: number;
}

export const TeacherDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    activeDiscussions: 0
  });
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

        {/* Activity Overview */}
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

        {/* Achievement & Progress Section */}
        <Suspense fallback={<TeachingProgressSkeleton />}>
          <TeacherTeachingProgress stats={stats} />
        </Suspense>
      </div>
    </DashboardLayout>
  );
};
