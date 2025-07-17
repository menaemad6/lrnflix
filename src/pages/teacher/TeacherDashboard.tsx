
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, BarChart3, MessageSquare, Gift, Plus, TrendingUp, Target, Zap, Brain, Sparkles, GraduationCap, Calendar, Trophy, Star, Clock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
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
            <span className="text-muted-foreground">Loading your dashboard...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Welcome Section */}
        <div className="glass-card p-8 border-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center animate-pulse-glow shadow-2xl shadow-emerald-500/25">
                  <Brain className="h-10 w-10 text-black" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    Welcome back, <span className="gradient-text">Educator</span>
                  </h1>
                  <p className="text-muted-foreground text-lg">Ready to inspire and educate minds today?</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-emerald-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-3 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Educator
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Link to="/teacher/create-course">
                <Button className="btn-primary group">
                  <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
                  Create Course
                </Button>
              </Link>
              <Link to="/teacher/analytics">
                <Button className="btn-secondary group">
                  <Target className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  View Analytics
                </Button>
              </Link>
              <Link to="/teacher/codes">
                <Button variant="outline" className="glass hover-glow group">
                  <Gift className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                  Generate Codes
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card border-0 hover-glow group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-500/20">
                <BookOpen className="h-6 w-6 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold gradient-text mb-1">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                Published courses
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 hover-glow group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform border border-emerald-500/20">
                <Users className="h-6 w-6 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold gradient-text mb-1">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                Enrolled learners
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 hover-glow group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform border border-purple-500/20">
                <Trophy className="h-6 w-6 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold gradient-text mb-1">{stats.totalRevenue}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-purple-400" />
                Credits earned
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 hover-glow group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">Discussions</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform border border-yellow-500/20">
                <MessageSquare className="h-6 w-6 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold gradient-text mb-1">{stats.activeDiscussions}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3 text-yellow-400" />
                Active threads
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Courses */}
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

          {/* Quick Actions & Tools */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="gradient-text">Quick Actions</CardTitle>
              <CardDescription>Common teaching tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/teacher/create-course">
                <Button className="w-full btn-secondary justify-start group hover-glow">
                  <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
                  Create New Course
                </Button>
              </Link>
              <Link to="/teacher/groups">
                <Button className="w-full btn-secondary justify-start group hover-glow">
                  <Users className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Manage Groups
                </Button>
              </Link>
              <Link to="/teacher/codes">
                <Button className="w-full btn-secondary justify-start group hover-glow">
                  <Gift className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                  Generate Wallet Codes
                </Button>
              </Link>
              <Link to="/teacher/analytics">
                <Button className="w-full btn-secondary justify-start group hover-glow">
                  <BarChart3 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  View Analytics
                </Button>
              </Link>
              <Button className="w-full btn-secondary justify-start group hover-glow">
                <Zap className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                AI Course Builder
                <Badge className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                  Soon
                </Badge>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Achievement & Progress Section */}
        <Card className="glass-card border-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-purple-500/5" />
          <CardHeader className="relative z-10">
            <CardTitle className="gradient-text text-xl flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              Teaching Progress
            </CardTitle>
            <CardDescription>Your impact as an educator</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <BookOpen className="h-8 w-8 text-black" />
                </div>
                <h3 className="font-semibold mb-2">Course Creator</h3>
                <p className="text-sm text-muted-foreground">
                  You've created <span className="text-emerald-400 font-bold">{stats.totalCourses}</span> courses
                </p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <Users className="h-8 w-8 text-black" />
                </div>
                <h3 className="font-semibold mb-2">Student Mentor</h3>
                <p className="text-sm text-muted-foreground">
                  Teaching <span className="text-blue-400 font-bold">{stats.totalStudents}</span> students
                </p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <Star className="h-8 w-8 text-black" />
                </div>
                <h3 className="font-semibold mb-2">Revenue Generator</h3>
                <p className="text-sm text-muted-foreground">
                  Earned <span className="text-purple-400 font-bold">{stats.totalRevenue}</span> credits
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
