
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { useToast } from '@/hooks/use-toast';
import { StudentCardSkeleton } from '@/components/student/skeletons';

import { 
  Users, 
  Search, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Star,
  GraduationCap,
  Filter,
  ArrowUpRight
} from 'lucide-react';

interface StudentData {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  enrollmentCount: number;
  totalSpent: number;
  averageScore: number;
  lastActive: string;
  enrollments: Array<{
    course: {
      id: string;
      title: string;
      price: number;
    };
    enrolled_at: string;
  }>;
  completedQuizzes: number;
  totalQuizzes: number;
}

interface Enrollment {
  student_id: string;
  enrolled_at: string;
  course: {
    id: string;
    title: string;
    price: number;
    instructor_id: string;
  };
}

export const StudentStudents = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'top_spenders'>('all');
  const [user, setUser] = useState<{ id: string } | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // Get all students who purchased courses from this teacher
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          student_id,
          enrolled_at,
          course:courses!inner (
            id,
            title,
            price,
            instructor_id
          )
        `)
        .eq('course.instructor_id', user.id);

      if (enrollmentsError) throw enrollmentsError;

      // Group by student and get unique students
      const studentMap = new Map<string, { id: string; enrollments: Enrollment[]; totalSpent: number; enrollmentCount: number }>();
      
      (enrollmentsData as Enrollment[])?.forEach(enrollment => {
        const studentId = enrollment.student_id;
        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            id: studentId,
            enrollments: [],
            totalSpent: 0,
            enrollmentCount: 0
          });
        }
        
        const student = studentMap.get(studentId);
        student.enrollments.push(enrollment);
        student.totalSpent += enrollment.course.price;
        student.enrollmentCount += 1;
      });

      // Get student profiles
      const studentIds = Array.from(studentMap.keys());
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', studentIds);

      // Get quiz performance for each student
      const studentsWithDetails = await Promise.all(
        Array.from(studentMap.values()).map(async (student) => {
          const profile = profilesData?.find(p => p.id === student.id);
          
          // Get quiz attempts for courses taught by this teacher
          const courseIds = student.enrollments.map((e: Enrollment) => e.course.id);
          const { data: quizAttempts } = await supabase
            .from('quiz_attempts')
            .select(`
              score,
              max_score,
              quiz:quizzes!inner (
                course_id
              )
            `)
            .eq('student_id', student.id)
            .in('quiz.course_id', courseIds);

          // Calculate average score
          let averageScore = 0;
          let completedQuizzes = 0;
          let totalQuizzes = 0;

          if (quizAttempts && quizAttempts.length > 0) {
            const scores = quizAttempts
              .filter(attempt => attempt.score !== null && attempt.max_score !== null)
              .map(attempt => (attempt.score / attempt.max_score) * 100);
            
            averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
            completedQuizzes = scores.length;
          }

          // Get total quizzes available
          const { count: totalQuizzesCount } = await supabase
            .from('quizzes')
            .select('*', { count: 'exact', head: true })
            .in('course_id', courseIds);

          totalQuizzes = totalQuizzesCount || 0;

          // Get last activity (most recent enrollment)
          const lastEnrollment = student.enrollments.sort((a: Enrollment, b: Enrollment) => 
            new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime()
          )[0];

          return {
            ...student,
            full_name: profile?.full_name || 'Unknown Student',
            email: profile?.email || '',
            avatar_url: profile?.avatar_url,
            averageScore: Math.round(averageScore),
            lastActive: lastEnrollment?.enrolled_at || '',
            completedQuizzes,
            totalQuizzes
          };
        })
      );

      setStudents(studentsWithDetails);
    } catch (error: unknown) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = students
    .filter(student => 
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(student => {
      switch (filterBy) {
        case 'active':
          return new Date(student.lastActive) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        case 'top_spenders':
          return student.totalSpent > 0;
        default:
          return true;
      }
    })
    .sort((a, b) => b.totalSpent - a.totalSpent);

  const formatLastActive = (lastActive: string) => {
    const date = new Date(lastActive);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const totalRevenue = students.reduce((sum, student) => sum + student.totalSpent, 0);
  const activeStudents = students.filter(student => 
    new Date(student.lastActive) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <TeacherPageHeader 
          title="My Students" 
          subtitle="Manage and track your students' progress"
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold gradient-text">{students.length}</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold gradient-text">{activeStudents}</p>
                  <p className="text-sm text-muted-foreground">Active Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold gradient-text">{totalRevenue}</p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center">
                  <Star className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold gradient-text">
                    {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.averageScore, 0) / students.length) : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterBy === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterBy('all')}
                  size="sm"
                >
                  All Students
                </Button>
                <Button
                  variant={filterBy === 'active' ? 'default' : 'outline'}
                  onClick={() => setFilterBy('active')}
                  size="sm"
                >
                  Active
                </Button>
                <Button
                  variant={filterBy === 'top_spenders' ? 'default' : 'outline'}
                  onClick={() => setFilterBy('top_spenders')}
                  size="sm"
                >
                  Top Spenders
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <StudentCardSkeleton key={index} />
            ))
          ) : filteredStudents.length === 0 ? (
            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  No students found matching your criteria.
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredStudents.map((student) => (
              <Card key={student.id} className="glass-card border-0 hover-glow group">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <Avatar className="w-12 h-12 border-2 border-primary/20">
                        <AvatarImage src={student.avatar_url} alt={student.full_name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                          {student.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0 sm:hidden">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {student.full_name}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0 hidden sm:block">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {student.full_name}
                        </h3>
                        {student.averageScore >= 80 && (
                          <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Top Performer
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{student.email}</p>
                    </div>

                    <div className="w-full sm:w-auto sm:flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mt-4 sm:mt-0">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-400" />
                        <span className="text-muted-foreground">
                          {student.enrollmentCount} course{student.enrollmentCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                        <span className="text-muted-foreground">
                          {student.totalSpent} credits spent
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-muted-foreground">
                          {student.averageScore}% avg score
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-400" />
                        <span className="text-muted-foreground">
                          {formatLastActive(student.lastActive)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-full sm:w-auto flex justify-end mt-4 sm:mt-0">
                      <Link to={`/teacher/students/${student.id}`} className="w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="group-hover:bg-primary/10 w-full">
                          View Details
                          <ArrowUpRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
