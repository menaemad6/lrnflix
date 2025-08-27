
import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, BarChart3, MessageSquare, Gift, Plus, TrendingUp, Target, Zap, Brain, Sparkles, GraduationCap, Calendar, Trophy, Star, Clock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SEOHead } from '@/components/seo/SEOHead';
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
import { useTeacherDashboardData, useTeacherTasks } from '@/lib/queries';

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
  const { data, isLoading } = useTeacherDashboardData();
  const { data: tasks, isLoading: tasksLoading } = useTeacherTasks();


  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-6">
          <HeroSectionSkeleton />
          <StatsGridSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <RecentCoursesSkeleton />
            <QuickActionsSkeleton />
          </div>
          <PerformanceMetricsSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <RecentActivitySkeleton />
            <UpcomingTasksSkeleton />
          </div>
          <StudentInsightsSkeleton />
          <TeachingProgressSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  const {
    courses = [],
    stats = { totalCourses: 0, totalStudents: 0, totalRevenue: 0, activeDiscussions: 0 },
    performanceMetrics = {
      totalStudents: 0,
      totalCourses: 0,
      averageRating: 0,
      completionRate: 0,
      engagementScore: 0,
      responseTime: 0,
      monthlyGrowth: 0,
      topPerformingCourse: ''
    },
    activities = [],
    students = [],
    user = null
  } = data || {};

  return (
    <>
      <SEOHead />
      <DashboardLayout>
        <div className="space-y-6">
        {/* Hero Welcome Section */}
        <Suspense fallback={<HeroSectionSkeleton />}>
          <TeacherHeroSection user={user} />
        </Suspense>

        {/* Enhanced Stats Grid */}
        <Suspense fallback={<StatsGridSkeleton />}>
          <TeacherStatsGrid stats={stats} />
        </Suspense>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <Suspense fallback={<RecentActivitySkeleton />}>
            <TeacherRecentActivity activities={activities} />
          </Suspense>
          <Suspense fallback={<UpcomingTasksSkeleton />}>
            <TeacherUpcomingTasks tasks={tasks || []} />
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
    </>
  );
};
