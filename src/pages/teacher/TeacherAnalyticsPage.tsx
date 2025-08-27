
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { BarChart3, Users, BookOpen, Trophy, TrendingUp, Star, MessageSquare, Clock, Target, Award, Eye, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeacherAnalytics } from '@/lib/queries';
import { SEOHead } from '@/components/seo';

interface AnalyticsData {
  totalStudents: number;
  totalCourses: number;
  totalRevenue: number;
  totalEnrollments: number;
  averageRating: number;
  completionRate: number;
  monthlyRevenue: Array<{ month: string; revenue: number; enrollments: number }>;
  coursePerformance: Array<{ name: string; enrollments: number; completion: number; rating: number }>;
  studentEngagement: Array<{ date: string; activeStudents: number; lessonsCompleted: number }>;
  topCourses: Array<{ title: string; enrollments: number; revenue: number }>;
  recentActivity: Array<{ type: string; count: number; change: number }>;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  enrollments: {
    label: "Enrollments",
    color: "hsl(var(--chart-2))",
  },
  completion: {
    label: "Completion Rate",
    color: "hsl(var(--chart-3))",
  },
  activeStudents: {
    label: "Active Students",
    color: "hsl(var(--chart-4))",
  },
  lessonsCompleted: {
    label: "Lessons Completed",
    color: "hsl(var(--chart-5))",
  },
};

export const TeacherAnalyticsPage = () => {
  const { data: analytics, isLoading, error } = useTeacherAnalytics();

  if (isLoading) {
    return (
      <>
        <SEOHead />
        <DashboardLayout>
          <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold gradient-text">Analytics & Insights</h2>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">Track your teaching performance and student engagement</p>
            </div>
            
            {/* Loading Skeletons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="glass-card border-0">
                  <CardContent className="p-3 sm:p-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="glass-card border-0">
                  <CardContent className="p-3 sm:p-6">
                    <Skeleton className="h-48 sm:h-64 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DashboardLayout>
      </>
    );
  }

  if (error || !analytics) {
    return (
      <>
        <SEOHead />
        <DashboardLayout>
          <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold gradient-text">Analytics & Insights</h2>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">Track your teaching performance and student engagement</p>
            </div>
            <Card className="glass-card border-0">
              <CardContent className="text-center py-8 sm:py-16 px-3 sm:px-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 text-red-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Unable to Load Analytics</h3>
                <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
                  There was an error loading your analytics data. Please try again later.
                </p>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </>
    );
  }

  return (
    <>
      <SEOHead />
      <DashboardLayout>
        <div className="space-y-4 ">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold gradient-text">Analytics & Insights</h2>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">Track your teaching performance and student engagement</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <Card className="glass-card border-0 hover-glow group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-accent-500/5" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Students</CardTitle>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500/20 to-accent-500/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-blue-500/20">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 p-3 sm:p-6 pt-0 sm:pt-0">
                <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">{analytics.totalStudents}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-primary-400" />
                  Unique enrolled students
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 hover-glow group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-green-500/5" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500/20 to-green-500/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-primary-500/20">
                  <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-primary-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 p-3 sm:p-6 pt-0 sm:pt-0">
                <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">{analytics.totalRevenue}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-primary-400" />
                  Credits earned
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 hover-glow group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-purple-500/20">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 p-3 sm:p-6 pt-0 sm:pt-0">
                <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">{analytics.averageRating.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400" />
                  Course rating
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 hover-glow group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-orange-500/20">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 p-3 sm:p-6 pt-0 sm:pt-0">
                <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">{analytics.completionRate}%</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Target className="h-3 w-3 text-orange-400" />
                  Course completion
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
            {/* Monthly Revenue Chart */}
            <Card className="glass-card border-0 hover-glow">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="gradient-text flex items-center gap-2 text-base sm:text-lg">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                  Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                <ChartContainer config={chartConfig} className="h-48 sm:h-64">
                  <AreaChart data={analytics.monthlyRevenue}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.2} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Course Performance */}
            <Card className="glass-card border-0 hover-glow">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="gradient-text flex items-center gap-2 text-base sm:text-lg">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                  Course Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                <ChartContainer config={chartConfig} className="h-48 sm:h-64">
                  <BarChart data={analytics.coursePerformance}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="enrollments" fill="hsl(var(--chart-2))" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Student Engagement */}
            <Card className="glass-card border-0 hover-glow">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="gradient-text flex items-center gap-2 text-base sm:text-lg">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  Student Engagement
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                <ChartContainer config={chartConfig} className="h-48 sm:h-64">
                  <LineChart data={analytics.studentEngagement}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="activeStudents" stroke="hsl(var(--chart-4))" strokeWidth={2} />
                    <Line type="monotone" dataKey="lessonsCompleted" stroke="hsl(var(--chart-5))" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Top Courses */}
            <Card className="glass-card border-0 hover-glow">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="gradient-text flex items-center gap-2 text-base sm:text-lg">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                  Top Performing Courses
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {analytics.topCourses.map((course, index) => (
                    <div key={course.title} className="flex items-center justify-between p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-accent rounded-md sm:rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-foreground text-sm sm:text-base truncate">{course.title}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">{course.enrollments} enrollments</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-primary text-sm sm:text-base">{course.revenue}</div>
                        <div className="text-xs text-muted-foreground">credits</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="glass-card border-0 hover-glow">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="gradient-text flex items-center gap-2 text-base sm:text-lg">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                Recent Activity (7 days)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {analytics.recentActivity.map((activity, index) => (
                  <div key={activity.type} className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-xs sm:text-sm">{activity.type}</h4>
                      <div className={`flex items-center gap-1 text-xs ${
                        activity.change > 0 ? 'text-primary-400' : activity.change < 0 ? 'text-red-400' : 'text-muted-foreground'
                      }`}>
                        {activity.change > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : activity.change < 0 ? (
                          <TrendingUp className="h-3 w-3 rotate-180" />
                        ) : null}
                        {activity.change !== 0 && `${Math.abs(activity.change)}%`}
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold gradient-text">{activity.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};
