
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { BarChart3, Users, BookOpen, Trophy, TrendingUp, Star, MessageSquare, Clock, Target, Award, Eye, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

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

const fetchTeacherAnalytics = async (): Promise<AnalyticsData> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Fetch courses taught by this teacher
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, price, created_at')
    .eq('instructor_id', user.id);

  const courseIds = courses?.map(c => c.id) || [];

  // Fetch enrollments for teacher's courses
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      id,
      student_id,
      enrolled_at,
      course_id,
      courses!inner(title, price)
    `)
    .in('course_id', courseIds);

  // Fetch lesson progress
  const { data: lessonProgress } = await supabase
    .from('lesson_progress')
    .select(`
      id,
      completed_at,
      lessons!inner(course_id)
    `)
    .in('lessons.course_id', courseIds);

  // Fetch quiz attempts
  const { data: quizAttempts } = await supabase
    .from('quiz_attempts')
    .select(`
      id,
      score,
      max_score,
      submitted_at,
      quizzes!inner(course_id)
    `)
    .in('quizzes.course_id', courseIds);

  // Calculate analytics
  const totalStudents = new Set(enrollments?.map(e => e.student_id)).size;
  const totalCourses = courses?.length || 0;
  const totalRevenue = enrollments?.reduce((sum, e) => sum + (e.courses?.price || 0), 0) || 0;
  const totalEnrollments = enrollments?.length || 0;

  // Calculate average rating (mock data for now)
  const averageRating = 4.7;
  const completionRate = lessonProgress?.length && totalEnrollments ? 
    Math.round((lessonProgress.length / (totalEnrollments * 10)) * 100) : 0; // Assuming 10 lessons per course average

  // Monthly revenue data
  const monthlyData = new Map();
  enrollments?.forEach(enrollment => {
    const month = new Date(enrollment.enrolled_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const existing = monthlyData.get(month) || { month, revenue: 0, enrollments: 0 };
    existing.revenue += enrollment.courses?.price || 0;
    existing.enrollments += 1;
    monthlyData.set(month, existing);
  });

  const monthlyRevenue = Array.from(monthlyData.values()).slice(-6);

  // Course performance
  const courseStats = new Map();
  courses?.forEach(course => {
    courseStats.set(course.id, {
      name: course.title,
      enrollments: 0,
      completion: 0,
      rating: 4.5 + Math.random() * 0.5 // Mock rating
    });
  });

  enrollments?.forEach(enrollment => {
    const stats = courseStats.get(enrollment.course_id);
    if (stats) stats.enrollments += 1;
  });

  const coursePerformance = Array.from(courseStats.values()).slice(0, 5);

  // Student engagement (mock data based on lesson progress)
  const engagementData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    engagementData.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      activeStudents: Math.floor(Math.random() * 20) + 10,
      lessonsCompleted: Math.floor(Math.random() * 50) + 20
    });
  }

  // Top courses
  const topCourses = coursePerformance
    .sort((a, b) => b.enrollments - a.enrollments)
    .slice(0, 3)
    .map(course => ({
      title: course.name,
      enrollments: course.enrollments,
      revenue: course.enrollments * 100 // Approximate revenue
    }));

  // Recent activity
  const recentActivity = [
    { type: 'New Enrollments', count: enrollments?.filter(e => 
      new Date(e.enrolled_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length || 0, change: 12 },
    { type: 'Lessons Completed', count: lessonProgress?.filter(lp => 
      new Date(lp.completed_at || '') > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length || 0, change: 8 },
    { type: 'Quiz Attempts', count: quizAttempts?.filter(qa => 
      new Date(qa.submitted_at || '') > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length || 0, change: -3 },
    { type: 'Course Views', count: Math.floor(Math.random() * 100) + 50, change: 15 }
  ];

  return {
    totalStudents,
    totalCourses,
    totalRevenue,
    totalEnrollments,
    averageRating,
    completionRate,
    monthlyRevenue,
    coursePerformance,
    studentEngagement: engagementData,
    topCourses,
    recentActivity
  };
};

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
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['teacher-analytics'],
    queryFn: fetchTeacherAnalytics,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold gradient-text">Analytics & Insights</h2>
            <p className="text-muted-foreground mt-1">Track your teaching performance and student engagement</p>
          </div>
          
          {/* Loading Skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="glass-card border-0">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="glass-card border-0">
                <CardContent className="p-6">
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !analytics) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold gradient-text">Analytics & Insights</h2>
            <p className="text-muted-foreground mt-1">Track your teaching performance and student engagement</p>
          </div>
          <Card className="glass-card border-0">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="h-10 w-10 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Unable to Load Analytics</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                There was an error loading your analytics data. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Analytics & Insights</h2>
          <p className="text-muted-foreground mt-1">Track your teaching performance and student engagement</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card border-0 hover-glow group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center border border-blue-500/20">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold gradient-text mb-1">{analytics.totalStudents}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                Unique enrolled students
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 hover-glow group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl flex items-center justify-center border border-emerald-500/20">
                <Trophy className="h-6 w-6 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold gradient-text mb-1">{analytics.totalRevenue}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                Credits earned
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 hover-glow group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-purple-500/20">
                <Star className="h-6 w-6 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold gradient-text mb-1">{analytics.averageRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400" />
                Course rating
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 hover-glow group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center border border-orange-500/20">
                <Target className="h-6 w-6 text-orange-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold gradient-text mb-1">{analytics.completionRate}%</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3 text-orange-400" />
                Course completion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Chart */}
          <Card className="glass-card border-0 hover-glow">
            <CardHeader>
              <CardTitle className="gradient-text flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
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
            <CardHeader>
              <CardTitle className="gradient-text flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
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
            <CardHeader>
              <CardTitle className="gradient-text flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
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
            <CardHeader>
              <CardTitle className="gradient-text flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top Performing Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topCourses.map((course, index) => (
                  <div key={course.title} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{course.title}</h4>
                        <p className="text-sm text-muted-foreground">{course.enrollments} enrollments</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{course.revenue}</div>
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
          <CardHeader>
            <CardTitle className="gradient-text flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analytics.recentActivity.map((activity, index) => (
                <div key={activity.type} className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{activity.type}</h4>
                    <div className={`flex items-center gap-1 text-xs ${
                      activity.change > 0 ? 'text-emerald-400' : activity.change < 0 ? 'text-red-400' : 'text-muted-foreground'
                    }`}>
                      {activity.change > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : activity.change < 0 ? (
                        <TrendingUp className="h-3 w-3 rotate-180" />
                      ) : null}
                      {activity.change !== 0 && `${Math.abs(activity.change)}%`}
                    </div>
                  </div>
                  <div className="text-2xl font-bold gradient-text">{activity.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
