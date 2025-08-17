
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { useToast } from '@/hooks/use-toast';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { 
  ArrowLeft,
  BookOpen, 
  Star, 
  TrendingUp, 
  Clock, 
  MessageSquare,
  Target,
  Calendar,
  Trophy,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface StudentDetailData {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  enrollments: Array<{
    id: string;
    enrolled_at: string;
    course: {
      id: string;
      title: string;
      price: number;
      description: string;
      cover_image_url?: string;
    };
  }>;
  quizAttempts: Array<{
    id: string;
    score: number;
    max_score: number;
    submitted_at: string;
    quiz: {
      id: string;
      title: string;
      course: {
        id: string;
        title: string;
      };
    };
  }>;
  discussions: Array<{
    id: string;
    title: string;
    content: string;
    created_at: string;
    course: {
      id: string;
      title: string;
    };
  }>;
}

interface CourseProgressData {
  courseId: string;
  courseTitle: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

const CourseProgressCard = ({ courseId, courseTitle, studentId }: { courseId: string; courseTitle: string; studentId: string }) => {
  const progress = useCourseProgress(courseId, studentId);

  return (
    <Card className="glass-card border-0">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">{courseTitle}</h4>
            <Badge variant="outline" className="text-xs">
              {progress.progressPercentage}%
            </Badge>
          </div>
          <Progress value={progress.progressPercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{progress.completedLessons}/{progress.totalLessons} lessons</span>
            <span>{progress.completedQuizzes}/{progress.totalQuizzes} quizzes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const StudentDetail = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const { toast } = useToast();
  const [student, setStudent] = useState<StudentDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    if (studentId) {
      fetchStudentDetails();
    }
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // Get student profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('id', studentId)
        .single();

      if (profileError) throw profileError;

      // Get enrollments for courses taught by this teacher
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          id,
          enrolled_at,
          course:courses!inner (
            id,
            title,
            price,
            description,
            cover_image_url,
            instructor_id
          )
        `)
        .eq('student_id', studentId)
        .eq('course.instructor_id', user.id);

      if (enrollmentsError) throw enrollmentsError;

      // Get course IDs for filtering other data
      const courseIds = enrollmentsData?.map(e => e.course.id) || [];

      // Get quiz attempts
      const { data: quizAttemptsData, error: quizError } = await supabase
        .from('quiz_attempts')
        .select(`
          id,
          score,
          max_score,
          submitted_at,
          quiz:quizzes!inner (
            id,
            title,
            course:courses!inner (
              id,
              title
            )
          )
        `)
        .eq('student_id', studentId)
        .in('quiz.course.id', courseIds)
        .not('submitted_at', 'is', null)
        .order('submitted_at', { ascending: false });

      if (quizError) throw quizError;

      // Get discussions
      const { data: discussionsData, error: discussionsError } = await supabase
        .from('discussions')
        .select(`
          id,
          title,
          content,
          created_at,
          course:courses!inner (
            id,
            title
          )
        `)
        .eq('student_id', studentId)
        .in('course.id', courseIds)
        .order('created_at', { ascending: false });

      if (discussionsError) throw discussionsError;

      const studentDetails: StudentDetailData = {
        ...profileData,
        enrollments: enrollmentsData || [],
        quizAttempts: quizAttemptsData || [],
        discussions: discussionsData || []
      };

      setStudent(studentDetails);
    } catch (error: unknown) {
      console.error('Error fetching student details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load student details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">Loading student details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">Student not found</div>
        </div>
      </DashboardLayout>
    );
  }

  const totalSpent = student.enrollments.reduce((sum, enrollment) => sum + enrollment.course.price, 0);
  const averageScore = student.quizAttempts.length > 0 
    ? Math.round(student.quizAttempts.reduce((sum, attempt) => sum + (attempt.score / attempt.max_score) * 100, 0) / student.quizAttempts.length)
    : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link to="/teacher/students">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <TeacherPageHeader 
            title={student.full_name} 
            description="Detailed student profile and performance"
          />
        </div>

        {/* Student Header */}
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20 border-4 border-primary/20">
                <AvatarImage src={student.avatar_url} alt={student.full_name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-xl">
                  {student.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold gradient-text mb-2">{student.full_name}</h1>
                <p className="text-muted-foreground mb-4">{student.email}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="text-lg font-bold text-blue-400">{student.enrollments.length}</div>
                    <div className="text-xs text-muted-foreground">Courses</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="text-lg font-bold text-emerald-400">{totalSpent}</div>
                    <div className="text-xs text-muted-foreground">Credits Spent</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <div className="text-lg font-bold text-yellow-400">{averageScore}%</div>
                    <div className="text-xs text-muted-foreground">Avg Score</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <div className="text-lg font-bold text-purple-400">{student.discussions.length}</div>
                    <div className="text-xs text-muted-foreground">Discussions</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 glass-card">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="quizzes">Quiz Performance</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {student.enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="glass-card border-0">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{enrollment.course.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {enrollment.course.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {enrollment.course.price} credits
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Enrolled: {formatDate(enrollment.enrolled_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {student.enrollments.length === 0 && (
              <Card className="glass-card border-0">
                <CardContent className="p-6 text-center text-muted-foreground">
                  No courses enrolled yet.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-4">
            <div className="space-y-4">
              {student.quizAttempts.map((attempt) => (
                <Card key={attempt.id} className="glass-card border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{attempt.quiz.title}</h4>
                        <p className="text-sm text-muted-foreground">{attempt.quiz.course.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(attempt.submitted_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          {(attempt.score / attempt.max_score) >= 0.7 ? (
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400" />
                          )}
                          <Badge 
                            variant="outline" 
                            className={
                              (attempt.score / attempt.max_score) >= 0.7 
                                ? "text-emerald-400 border-emerald-500/30" 
                                : "text-red-400 border-red-500/30"
                            }
                          >
                            {attempt.score}/{attempt.max_score} ({Math.round((attempt.score / attempt.max_score) * 100)}%)
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {student.quizAttempts.length === 0 && (
              <Card className="glass-card border-0">
                <CardContent className="p-6 text-center text-muted-foreground">
                  No quiz attempts yet.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="discussions" className="space-y-4">
            <div className="space-y-4">
              {student.discussions.map((discussion) => (
                <Card key={discussion.id} className="glass-card border-0">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{discussion.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {discussion.course.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(discussion.created_at)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {discussion.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {student.discussions.length === 0 && (
              <Card className="glass-card border-0">
                <CardContent className="p-6 text-center text-muted-foreground">
                  No discussions created yet.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {student.enrollments.map((enrollment) => (
                <CourseProgressCard
                  key={enrollment.course.id}
                  courseId={enrollment.course.id}
                  courseTitle={enrollment.course.title}
                  studentId={student.id}
                />
              ))}
            </div>
            {student.enrollments.length === 0 && (
              <Card className="glass-card border-0">
                <CardContent className="p-6 text-center text-muted-foreground">
                  No progress data available.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};
