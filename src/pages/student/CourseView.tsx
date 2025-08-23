import React, { useState, useEffect, useCallback } from 'react';
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
import { useTenantItemValidation } from '@/hooks/useTenantItemValidation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useRandomBackground } from "../../hooks/useRandomBackground";
import { CourseViewSkeleton } from '@/components/student/skeletons/CourseViewSkeleton';
import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo';
import { getDynamicSEOMetadata } from '@/data/seo';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  instructor_id: string;
  created_at: string;
  cover_image_url?: string;
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

interface TeacherProfile {
  display_name: string;
  profile_image_url?: string;
  bio?: string;
  specialization?: string;
  experience_years?: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  max_attempts?: number;
  time_limit?: number;
}

export const CourseView = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { t } = useTranslation('dashboard');
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userWallet, setUserWallet] = useState(0);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('lessons');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  const bgClass = useRandomBackground();
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    }
    fetchUser();
  }, []);

  const progress = useCourseProgress(id, userId);
  
  // Tenant item validation hook
  const { validateAndHandle, validateWithCreatorId } = useTenantItemValidation({
    redirectTo: '/courses',
  });

  const fetchCourseData = useCallback(async () => {
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
      
      // Validate that this course belongs to the current tenant
      validateWithCreatorId(courseData.instructor_id);
      
      setCourse(courseData);

      // Fetch teacher profile from teachers table
      if (courseData?.instructor_id) {
        const { data: teacherData } = await supabase
          .from('teachers')
          .select('display_name,profile_image_url,bio,specialization,experience_years')
          .eq('user_id', courseData.instructor_id)
          .eq('is_active', true)
          .single();
        if (teacherData) setTeacherProfile(teacherData);
      }

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
        title: t('studentCourseView.error'),
        description: t('studentCourseView.failedToLoadCourse'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  const fetchUserWallet = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (id) {
      fetchCourseData();
      fetchUserWallet();
    }
  }, [id, fetchCourseData, fetchUserWallet]);

  const handlePurchaseSuccess = () => {
    setIsEnrolled(true);
    setShowPurchaseModal(false);
    fetchCourseData();
    fetchUserWallet();
  };

  const handleEnrollClick = () => {
    if (!userId) {
      setShowAuthModal(true);
    } else {
      setShowPurchaseModal(true);
    }
  };

  // Share logic
  const handleShareClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareModal(true);
      toast({
        title: t('studentCourseView.linkCopiedToast'),
        description: t('studentCourseView.courseUrlCopied'),
      });
          } catch (err: unknown) {
      toast({
        title: t('studentCourseView.error'),
        description: t('studentCourseView.failedToCopyLink'),
        variant: 'destructive',
      });
    }
  };

  const handleCopyAgain = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: t('studentCourseView.linkCopiedToast'),
        description: t('studentCourseView.courseUrlCopied'),
      });
    } catch (err: unknown) {
      toast({
        title: t('studentCourseView.error'),
        description: t('studentCourseView.failedToCopyLink'),
        variant: 'destructive',
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: course?.title || t('studentCourseView.title'),
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
    return <CourseViewSkeleton />;
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
                      {t('studentCourseView.courseNotFound')}
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                      {t('studentCourseView.courseNotFoundDescription')}
                    </p>
                    <p className="text-sm text-muted-foreground/80">
                      {t('studentCourseView.courseNotFoundSubtext')}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
                    <Button 
                      onClick={() => navigate('/courses')}
                      className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      {t('studentCourseView.backToCourses')}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/student/dashboard')}
                      className="border-primary/20 text-primary hover:bg-primary/10 transition-all duration-200"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      {t('studentCourseView.home')}
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
                <h3 className="font-medium text-sm">{t('studentCourseView.checkUrl')}</h3>
                <p className="text-xs text-muted-foreground">{t('studentCourseView.checkUrlDescription')}</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-primary-500/20 bg-primary-500/5">
              <CardContent className="p-4 text-center">
                <BookOpen className="h-6 w-6 mx-auto mb-2 text-primary-400" />
                <h3 className="font-medium text-sm">{t('studentCourseView.browseAvailable')}</h3>
                <p className="text-xs text-muted-foreground">{t('studentCourseView.browseAvailableDescription')}</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-purple-500/20 bg-purple-500/5">
              <CardContent className="p-4 text-center">
                <HelpCircle className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                <h3 className="font-medium text-sm">{t('studentCourseView.needHelp')}</h3>
                <p className="text-xs text-muted-foreground">{t('studentCourseView.needHelpDescription')}</p>
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
    <>
      <SEOHead 

        contentTitle={course?.title || 'Course'}
        contentDescription={course?.description || 'Explore course content, lessons, and learning materials.'}
      />
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
                  <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
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
                    <span>{t('studentCourseView.createdBy')} <span className="font-medium text-foreground">{course.profiles?.full_name || t('studentCourseView.unknownInstructor')}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{t('studentCourseView.lastUpdated')} {new Date(course.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>{t('studentCourseView.language')}</span>
                  </div>
                </div>

                {/* Course Highlights */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/20">
                    <PlayCircle className="h-8 w-8 text-primary-500" />
                    <div>
                      <div className="font-semibold">{progress.totalLessons} {t('studentCourseView.lessons')}, {progress.totalQuizzes} {t('studentCourseView.quizzes')}</div>
                      <div className="text-xs text-muted-foreground">{t('studentCourseView.highQualityContent')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-accent-500/10 border border-blue-500/20">
                    <Clock className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="font-semibold">{Math.round(totalCourseMinutes / 60) > 0 ? `${Math.round(totalCourseMinutes / 60)}+ ${t('studentCourseView.hours')}` : `${totalCourseMinutes} ${t('studentCourseView.minutes')}`}</div>
                      <div className="text-xs text-muted-foreground">{t('studentCourseView.onDemandVideo')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <Infinity className="h-8 w-8 text-purple-500" />
                    <div>
                      <div className="font-semibold">{t('studentCourseView.lifetime')}</div>
                      <div className="text-xs text-muted-foreground">{t('studentCourseView.fullAccess')}</div>
                    </div>
                  </div>
                </div>

                {isEnrolled && (
                  <Card className="bg-gradient-to-r from-primary-500/10 to-primary-500/10 border-primary-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Trophy className="h-6 w-6 text-primary-500" />
                          <div>
                            <h3 className="font-semibold text-primary-700 dark:text-primary-300">{t('studentCourseView.yourProgress')}</h3>
                            <p className="text-sm text-primary-600 dark:text-primary-400">{t('studentCourseView.keepUpGreatWork')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {Math.round(progress.progressPercentage)}%
                          </div>
                          <div className="text-xs text-primary-600 dark:text-primary-400">{t('studentCourseView.complete')}</div>
                        </div>
                      </div>
                      <div className="w-full bg-primary-100 dark:bg-primary-900/40 rounded-full h-3 mb-2">
                        <div 
                          className="bg-gradient-to-r from-primary-500 to-primary-500 h-3 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${progress.progressPercentage}%` }}
                        />
                      </div>
                      <p className="text-sm text-primary-600 dark:text-primary-400">
                        {progress.completedLessons + progress.completedQuizzes} {t('studentCourseView.itemsCompleted')} {progress.totalLessons + progress.totalQuizzes}
                      </p>
                      <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                        {t('studentCourseView.lessonsCompleted')} {progress.completedLessons}/{progress.totalLessons}, {t('studentCourseView.quizzesCompleted')} {progress.completedQuizzes}/{progress.totalQuizzes}
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
                    {t('studentCourseView.whatYoullLearn')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      t('studentCourseView.masterFundamentals'),
                      t('studentCourseView.buildRealWorldProjects'),
                      t('studentCourseView.understandBestPractices'),
                      t('studentCourseView.developProblemSolving'),
                      t('studentCourseView.learnModernTools'),
                      t('studentCourseView.getHandsOnExperience')
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
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
                    {t('studentCourseView.courseContent')}
                    <Badge variant="default" className="ml-auto">
                      {progress.totalLessons} {t('studentCourseView.lessons')}, {progress.totalQuizzes} {t('studentCourseView.quizzes')}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lessons.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">{t('studentCourseView.noLessonsYet')}</h3>
                      <p>{t('studentCourseView.instructorStillPreparing')}</p>
                    </div>
                  ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="lessons">{t('studentCourseView.lessons')}</TabsTrigger>
                        <TabsTrigger value="quizzes">{t('studentCourseView.quizzes')}</TabsTrigger>
                        <TabsTrigger value="lectures">{t('studentCourseView.liveLectures')}</TabsTrigger>
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
                                    <span>~{lesson.duration_minutes ? lesson.duration_minutes : 15} {t('studentCourseView.minutes')}</span>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-6 pb-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/30 bg-background/50 hover:bg-muted/40 transition-colors">
                                    <div className="flex items-center gap-4">
                                      {isEnrolled ? (
                                        progress.completedLessonIds.includes(lesson.id) ? (
                                          <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0" />
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
                              {t('studentCourseView.noQuizzesYet')}
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
                                    <span>{t('studentCourseView.maxAttempts')} {quiz.max_attempts}</span>
                                    {quiz.time_limit && <span>• {t('studentCourseView.timeLimit')} {quiz.time_limit} {t('studentCourseView.minutes')}</span>}
                                  </div>
                                  <Button
                                    className="w-full"
                                    variant={isEnrolled ? 'default' : 'outline'}
                                    disabled={!isEnrolled}
                                    onClick={() => isEnrolled && window.location.assign(`/courses/${id}/quiz/${quiz.id}`)}
                                  >
                                    {isEnrolled ? t('studentCourseView.takeQuiz') : t('studentCourseView.enrollToTakeQuiz')}
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
                    {t('studentCourseView.instructor')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-6">
                    {teacherProfile?.profile_image_url ? (
                      <img
                        src={teacherProfile.profile_image_url}
                        alt={teacherProfile.display_name}
                        className="h-20 w-20 rounded-full object-cover border border-primary/30 shadow"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                        {teacherProfile?.display_name?.charAt(0) || t('studentCourseView.instructor').charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-xl font-semibold">{teacherProfile?.display_name || t('studentCourseView.unknownInstructor')}</h3>
                        {teacherProfile?.specialization && <p className="text-muted-foreground">{teacherProfile.specialization}</p>}
                        {teacherProfile?.bio && <p className="text-muted-foreground text-sm mt-1">{teacherProfile.bio}</p>}
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span>4.8 {t('studentCourseView.instructorRating')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-blue-500" />
                          <span>15,234 {t('studentCourseView.students')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <PlayCircle className="h-4 w-4 text-primary-500" />
                          <span>12 {t('studentCourseView.courses')}</span>
                        </div>
                      </div>
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
                      {t('studentCourseView.courseDiscussions')}
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
                    {/* Course Thumbnail */}
                    {course.cover_image_url && (
                      <div className="text-center">
                        <img 
                          src={course.cover_image_url} 
                          alt={course.title}
                          className="w-full mx-auto rounded-lg object-cover border border-border/20 shadow-lg"
                        />
                      </div>
                    )}
                    
                    {/* Price */}
                    <div className="text-center space-y-2">
                      <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {course.price} {t('studentCourseView.egp')}
                      </div>
                      <p className="text-sm text-muted-foreground">{t('studentCourseView.oneTimePurchase')}</p>
                    </div>
                    
                    {/* Action Button */}
                    {!isEnrolled ? (
                      <Button 
                        onClick={handleEnrollClick}
                        variant='default'
                        className="w-full h-14 text-lg rounded-xl"
                      >
                        {t('studentCourseView.enrollNow')}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl">
                          <Trophy className="h-6 w-6" />
                          <span className="font-semibold">{t('studentCourseView.youreEnrolled')}</span>
                        </div>
                        <Button asChild className="w-full h-14 text-lg font-semibold rounded-xl">
                          <Link to={`/courses/${course.id}/progress`}>
                            {t('studentCourseView.continueLearning')}
                            <Play className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                      </div>
                    )}

                    {/* Course Features */}
                    <div className="space-y-4 pt-4 border-t border-border/20">
                      <h4 className="font-semibold">{t('studentCourseView.thisCourseIncludes')}</h4>
                      <div className="space-y-3">
                        {[
                          { icon: PlayCircle, text: `${progress.totalLessons} ${t('studentCourseView.onDemandVideoLessons')}` },
                          { icon: FileText, text: t('studentCourseView.downloadableResources') },
                          { icon: Infinity, text: t('studentCourseView.fullLifetimeAccess') },
                          { icon: Smartphone, text: t('studentCourseView.accessOnMobileAndTv') },
                          { icon: Award, text: t('studentCourseView.certificateOfCompletion') }
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
                        {t('studentCourseView.wishlist')}
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={handleShareClick}>
                        <Share2 className="h-4 w-4 mr-2" />
                        {t('studentCourseView.share')}
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
            <DialogTitle>{t('studentCourseView.shareThisCourse')}</DialogTitle>
            <DialogDescription>{t('studentCourseView.shareDescription')}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <Input readOnly value={window.location.href} className="font-mono text-xs" />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleCopyAgain}>
                <Share2 className="h-4 w-4 mr-2" />{t('studentCourseView.copyLink')}
              </Button>
              <Button className="flex-1" variant="default" onClick={handleNativeShare}>
                <Smartphone className="h-4 w-4 mr-2" />{t('studentCourseView.shareNative')}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground text-center">{t('studentCourseView.linkCopied')}</div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('studentCourseView.authenticationRequired')}</DialogTitle>
            <DialogDescription>
              {t('studentCourseView.authDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowAuthModal(false)}>
              {t('studentCourseView.cancel')}
            </Button>
            <Button onClick={() => navigate('/auth/login')}>
              {t('studentCourseView.signIn')}
            </Button>
            <Button onClick={() => navigate('/auth/signup')}>
              {t('studentCourseView.createAccount')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
};
