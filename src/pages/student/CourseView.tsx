import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { PurchaseModal } from '@/components/courses/PurchaseModal';
import { DiscussionForum } from '@/components/discussions/DiscussionForum';
import { StudentLectureView } from '@/components/lectures/StudentLectureView';
import { 
  BookOpen, 
  Play, 
  CheckCircle,
  Clock,
  Users,
  MessageSquare,
  ArrowRight,
  Star,
  Trophy,
  Target,
  Globe,
  Award,
  TrendingUp,
  User,
  Calendar,
  PlayCircle,
  FileText,
  Heart,
  Share2,
  Download,
  Smartphone,
  Monitor,
  Infinity,
  AlertTriangle,
  Search,
  Home,
  HelpCircle
} from 'lucide-react';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useRandomBackground } from "../../hooks/useRandomBackground";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  instructor_id: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  chapter_id: string;
  course_id: string;
  order_index: number;
  video_url?: string;
  duration_minutes?: number;
}

export const CourseView = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userWallet, setUserWallet] = useState(0);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [activeTab, setActiveTab] = useState('lessons');
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  const bgClass = useRandomBackground();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    }
    fetchUser();
  }, []);

  const progress = useCourseProgress(id, userId);

  useEffect(() => {
    if (id) {
      fetchCourseData();
      fetchUserWallet();
    }
  }, [id]);

  const fetchUserWallet = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('wallet')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserWallet(profile.wallet);
        }
      }
    } catch (error) {
      console.error('Error fetching user wallet:', error);
    }
  };

  const fetchCourseData = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          profiles!courses_instructor_id_fkey(full_name)
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Check enrollment
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('*')
          .eq('course_id', id)
          .eq('student_id', user.id)
          .maybeSingle();

        setIsEnrolled(!!enrollment);
      }

      // Fetch all lessons for this course
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_index');

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      // Fetch quizzes for all users
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('course_id', id)
        .order('order_index');
      if (quizzesError) throw quizzesError;
      setQuizzes(quizzesData || []);
    } catch (error: unknown) {
      console.error('Error fetching course:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseSuccess = () => {
    setIsEnrolled(true);
    setShowPurchaseModal(false);
    fetchCourseData();
    fetchUserWallet();
  };

  // Share logic
  const handleShareClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareModal(true);
      toast({
        title: 'Link copied!',
        description: 'Course URL copied to clipboard.',
      });
    } catch (err: unknown) {
      toast({
        title: 'Error',
        description: 'Failed to copy link.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyAgain = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied!',
        description: 'Course URL copied to clipboard.',
      });
    } catch (err: unknown) {
      toast({
        title: 'Error',
        description: 'Failed to copy link.',
        variant: 'destructive',
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: course?.title || 'Course',
          text: course?.description || '',
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      handleCopyAgain();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 flex items-center justify-center p-6">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Animated Background Elements */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-3xl blur-3xl animate-pulse"></div>
            <div className="relative">
              {/* Main Error Card */}
              <Card className="glass-card border-white/10 shadow-2xl backdrop-blur-xl">
                <CardContent className="p-12">
                  {/* Icon */}
                  <div className="relative mb-8">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                      <BookOpen className="h-12 w-12 text-red-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  {/* Error Message */}
                  <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
                      Course Not Found
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                      The course you're looking for doesn't exist or may have been removed.
                    </p>
                    <p className="text-sm text-muted-foreground/80">
                      It might be a draft, unpublished, or the URL might be incorrect.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
                    <Button 
                      onClick={() => navigate('/courses')}
                      className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Browse Courses
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/student/dashboard')}
                      className="border-primary/20 text-primary hover:bg-primary/10 transition-all duration-200"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Go to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card border-blue-500/20 bg-blue-500/5">
              <CardContent className="p-4 text-center">
                <Search className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                <h3 className="font-medium text-sm">Check the URL</h3>
                <p className="text-xs text-muted-foreground">Make sure the course link is correct</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-green-500/20 bg-green-500/5">
              <CardContent className="p-4 text-center">
                <BookOpen className="h-6 w-6 mx-auto mb-2 text-green-400" />
                <h3 className="font-medium text-sm">Browse Available</h3>
                <p className="text-xs text-muted-foreground">Explore our published courses</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-purple-500/20 bg-purple-500/5">
              <CardContent className="p-4 text-center">
                <HelpCircle className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                <h3 className="font-medium text-sm">Need Help?</h3>
                <p className="text-xs text-muted-foreground">Contact support if you need assistance</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total course minutes
  const totalCourseMinutes = lessons.reduce((sum, lesson) => sum + (lesson.duration_minutes || 0), 0);

  return (
    <div className={bgClass + " min-h-screen"}>
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5"></div>
        
        <div className="relative container mx-auto px-6 py-16 ">
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Course Header */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  {/* Show Category If There is  */}
                  { course?.category && 
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
                    {course.category}
                  </Badge>
                  }
                  <Badge variant="outline" className="px-3 py-1">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    4.8
                  </Badge>
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent leading-tight">
                  {course.title}
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                  {course.description}
                </p>

                {/* Course Stats */}
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Created by <span className="font-medium text-foreground">{course.profiles?.full_name || 'Unknown Instructor'}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Last updated {new Date(course.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>English</span>
                  </div>
                </div>

                {/* Course Highlights */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                    <PlayCircle className="h-8 w-8 text-emerald-500" />
                    <div>
                      <div className="font-semibold">{progress.totalLessons} Lessons, {progress.totalQuizzes} Quizzes</div>
                      <div className="text-xs text-muted-foreground">High-quality content</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                    <Clock className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="font-semibold">{Math.round(totalCourseMinutes / 60) > 0 ? `${Math.round(totalCourseMinutes / 60)}+ Hours` : `${totalCourseMinutes} Minutes`}</div>
                      <div className="text-xs text-muted-foreground">On-demand video</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <Infinity className="h-8 w-8 text-purple-500" />
                    <div>
                      <div className="font-semibold">Lifetime</div>
                      <div className="text-xs text-muted-foreground">Full access</div>
                    </div>
                  </div>
                </div>

                {isEnrolled && (
                  <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Trophy className="h-6 w-6 text-green-500" />
                          <div>
                            <h3 className="font-semibold text-green-700 dark:text-green-300">Your Progress</h3>
                            <p className="text-sm text-green-600 dark:text-green-400">Keep up the great work!</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {Math.round(progress.progressPercentage)}%
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-400">Complete</div>
                        </div>
                      </div>
                      <div className="w-full bg-green-100 dark:bg-green-900/40 rounded-full h-3 mb-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${progress.progressPercentage}%` }}
                        />
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {progress.completedLessons + progress.completedQuizzes} of {progress.totalLessons + progress.totalQuizzes} items completed
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Lessons: {progress.completedLessons}/{progress.totalLessons}, Quizzes: {progress.completedQuizzes}/{progress.totalQuizzes}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* What You'll Learn */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Target className="h-6 w-6 text-primary" />
                    What you&apos;ll learn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      "Master the fundamentals and advanced concepts",
                      "Build real-world projects from scratch",
                      "Understand best practices and industry standards",
                      "Develop problem-solving skills",
                      "Learn modern tools and techniques",
                      "Get hands-on experience with practical exercises"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Course Content */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <BookOpen className="h-6 w-6 text-primary" />
                    Course Content
                    <Badge variant="secondary" className="ml-auto">
                      {progress.totalLessons} lessons, {progress.totalQuizzes} quizzes
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lessons.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No content available yet</h3>
                      <p>The instructor is still preparing the course content.</p>
                    </div>
                  ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="lessons">Lessons</TabsTrigger>
                        <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                        <TabsTrigger value="lectures">Live Lectures</TabsTrigger>
                      </TabsList>

                      <TabsContent value="lessons" className="space-y-6">
                        <Accordion type="single" collapsible className="w-full space-y-2">
                          {lessons.map((lesson: Lesson) => (
                            <AccordionItem key={lesson.id} value={lesson.id} className="border border-border/50 rounded-lg overflow-hidden bg-muted/20">
                              <AccordionTrigger className="hover:bg-muted/50 px-6 py-4 hover:no-underline">
                                <div className="flex items-center justify-between w-full mr-4">
                                  <div className="text-left space-y-1">
                                    <div className="font-semibold text-base">{lesson.title}</div>
                                    {lesson.description && (
                                      <div className="text-sm text-muted-foreground">
                                        {lesson.description}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <PlayCircle className="h-4 w-4" />
                                    <span>~{lesson.duration_minutes ? lesson.duration_minutes : 15} min</span>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-6 pb-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/30 bg-background/50 hover:bg-muted/40 transition-colors">
                                    <div className="flex items-center gap-4">
                                      {isEnrolled ? (
                                        progress.completedLessonIds.includes(lesson.id) ? (
                                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                        ) : (
                                          <Play className="h-5 w-5 text-primary flex-shrink-0" />
                                        )
                                      ) : (
                                        <Play className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                      )}
                                      <div className="space-y-1">
                                        <div className="font-medium">{lesson.title}</div>
                                        {lesson.description && (
                                          <div className="text-sm text-muted-foreground">
                                            {lesson.description}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </TabsContent>

                      <TabsContent value="quizzes" className="space-y-6">
                        {/* Render quizzes for all users, restrict quiz-taking in the UI for non-enrolled students */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {quizzes.length === 0 ? (
                            <div className="text-center col-span-full text-muted-foreground py-8">
                              No quizzes available for this course yet.
                            </div>
                          ) : (
                            quizzes.map((quiz) => (
                              <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                  <CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
                                  {quiz.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{quiz.description}</p>}
                                </CardHeader>
                                <CardContent>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                    <span>Max Attempts: {quiz.max_attempts}</span>
                                    {quiz.time_limit && <span>• Time Limit: {quiz.time_limit} min</span>}
                                  </div>
                                  <Button
                                    className="w-full"
                                    variant={isEnrolled ? 'default' : 'outline'}
                                    disabled={!isEnrolled}
                                    onClick={() => isEnrolled && window.location.assign(`/courses/${id}/quiz/${quiz.id}`)}
                                  >
                                    {isEnrolled ? 'Take Quiz' : 'Enroll to Take Quiz'}
                                  </Button>
                                </CardContent>
                              </Card>
                            ))
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="lectures" className="space-y-6">
                        <StudentLectureView courseId={id!} isEnrolled={isEnrolled} />
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              </Card>

              {/* Instructor Section */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <User className="h-6 w-6 text-primary" />
                    Instructor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-6">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                      {course.profiles?.full_name?.charAt(0) || 'I'}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-xl font-semibold">{course.profiles?.full_name || 'Unknown Instructor'}</h3>
                        <p className="text-muted-foreground">Senior Developer & Educator</p>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span>4.8 Instructor Rating</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-blue-500" />
                          <span>15,234 Students</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <PlayCircle className="h-4 w-4 text-green-500" />
                          <span>12 Courses</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Expert in modern development with 10+ years of experience. Passionate about teaching and helping students achieve their goals through practical, hands-on learning.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Discussions Section */}
              {isEnrolled && (
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <MessageSquare className="h-6 w-6 text-primary" />
                      Course Discussions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DiscussionForum courseId={course.id} />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <Card className="glass-card border-white/10 shadow-2xl">
                  <CardContent className="p-8 space-y-6">
                    {/* Price */}
                    <div className="text-center space-y-2">
                      <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {course.price} credits
                      </div>
                      <p className="text-sm text-muted-foreground">One-time purchase • Lifetime access</p>
                    </div>
                    
                    {/* Action Button */}
                    {!isEnrolled ? (
                      <Button 
                        onClick={() => setShowPurchaseModal(true)}
                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                      >
                        Enroll Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                          <Trophy className="h-6 w-6" />
                          <span className="font-semibold">You&apos;re enrolled!</span>
                        </div>
                        <Button asChild className="w-full h-14 text-lg font-semibold rounded-xl">
                          <Link to={`/courses/${course.id}/progress`}>
                            Continue Learning
                            <Play className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                      </div>
                    )}

                    {/* Course Features */}
                    <div className="space-y-4 pt-4 border-t border-border/20">
                      <h4 className="font-semibold">This course includes:</h4>
                      <div className="space-y-3">
                        {[
                          { icon: PlayCircle, text: `${progress.totalLessons} on-demand video lessons` },
                          { icon: FileText, text: "Downloadable resources" },
                          { icon: Infinity, text: "Full lifetime access" },
                          { icon: Smartphone, text: "Access on mobile and TV" },
                          { icon: Award, text: "Certificate of completion" }
                        ].map((feature, index) => (
                          <div key={index} className="flex items-center gap-3 text-sm">
                            <feature.icon className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{feature.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Share */}
                    <div className="flex gap-2 pt-4 border-t border-border/20">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Heart className="h-4 w-4 mr-2" />
                        Wishlist
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={handleShareClick}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {course && (
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          course={course}
          userWallet={userWallet}
          onPurchaseSuccess={handlePurchaseSuccess}
        />
      )}

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share this Course</DialogTitle>
            <DialogDescription>Send this link to invite others to this course.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <Input readOnly value={window.location.href} className="font-mono text-xs" />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleCopyAgain}>
                <Share2 className="h-4 w-4 mr-2" />Copy Link
              </Button>
              <Button className="flex-1" variant="secondary" onClick={handleNativeShare}>
                <Smartphone className="h-4 w-4 mr-2" />Share...
              </Button>
            </div>
            <div className="text-xs text-muted-foreground text-center">Link copied! You can now share it anywhere.</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
