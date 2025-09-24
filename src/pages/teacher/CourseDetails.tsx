import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { LessonManager } from '@/components/lessons/LessonManager';
import { CourseCodesManager } from '@/components/courses/CourseCodesManager';
import { StudentManager } from '@/components/students/StudentManager';
import { DiscussionForum } from '@/components/discussions/DiscussionForum';
import { CourseAiAssistantTab } from '@/components/teacher/CourseAiAssistantTab';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { ImageGenerator } from '@/components/ui/ImageGenerator';
import { IMAGE_UPLOAD_BUCKETS } from '@/data/constants';
import type { UploadedImage } from '@/hooks/useImageUpload';
import { useTranslation } from 'react-i18next';
import { useTenantItemValidation } from '@/hooks/useTenantItemValidation';
import { useItemOwnershipValidation } from '@/hooks/useItemOwnershipValidation';
import { 
  ArrowLeft, 
  MessageSquare, 
  Edit, 
  Tag, 
  Users, 
  Settings, 
  Save,
  BarChart3,
  Trophy,
  Target,
  Sparkles,
  TrendingUp,
  Globe,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  Cog,
  Trash2,
  AlertTriangle,
  X,
  Bot
} from 'lucide-react';
import { useIsLargeScreen } from '@/hooks/use-mobile';
import { SEOHead } from '@/components/seo';

interface Course {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  enrollment_code: string | null;
  created_at: string;
  category: string | null;
  price: number;
  cover_image_url?: string;
  instructor_id?: string;
  creator_id?: string;
  user_id?: string;
  teacher_id?: string;
  [key: string]: unknown;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  type: string;
  time_limit: number | null;
  max_attempts: number | null;
  created_at: string;
}

export const CourseDetails = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation('courses');
  const { validateAndHandle } = useTenantItemValidation({ redirectTo: '/teacher/courses' });
  const { validateOwnership } = useItemOwnershipValidation({ redirectTo: '/teacher/courses' });
  const [course, setCourse] = useState<Course | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    price: 0
  });
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchEnrollmentCount();
      fetchQuizzes();
    }
  }, [courseId]);

  useEffect(() => {
    if (course) {
      // Validate course access before allowing editing
      validateAndHandle(course);
      validateOwnership(course.creator_id || course.instructor_id || course.user_id || course.teacher_id || '');
      setEditForm({
        title: course.title,
        description: course.description || '',
        category: course.category || '',
        price: course.price
      });
    }
  }, [course, validateAndHandle, validateOwnership]);

  const islarge = useIsLargeScreen();
  useEffect(() => {
    if (islarge) {
      setSidebarCollapsed(false);
    } else {
      setSidebarCollapsed(true);
    }
  }, [islarge])

  const fetchCourseDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      setCourse(data);
    } catch (error: unknown) {
      console.error('Error fetching course:', error);
      toast({
        title: t('teacherCourseDetails.error'),
        description: error instanceof Error ? error.message : t('teacherCourseDetails.failedToLoadCourse'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollmentCount = async () => {
    try {
      const { count, error } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId);

      if (error) throw error;
      setEnrollmentCount(count || 0);
    } catch (error: unknown) {
      console.error('Error fetching enrollment count:', error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error: unknown) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const updateCourseStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ status })
        .eq('id', courseId);

      if (error) throw error;

      setCourse(prev => prev ? { ...prev, status } : null);
      toast({
        title: t('teacherCourseDetails.success'),
        description: status === 'published' ? t('teacherCourseDetails.coursePublished') : t('teacherCourseDetails.courseSavedAsDraft'),
      });
    } catch (error: unknown) {
      console.error('Error updating course status:', error);
      toast({
        title: t('teacherCourseDetails.error'),
        description: error instanceof Error ? error.message : t('teacherCourseDetails.failedToUpdateCourseStatus'),
        variant: 'destructive',
      });
    }
  };

  const handleImageUploaded = (image: UploadedImage) => {
    setUploadedImage(image);
    toast({
      title: t('teacherCourseDetails.success'),
      description: t('teacherCourseDetails.courseThumbnailUploaded'),
    });
  };

  const handleImageDeleted = (path: string) => {
    setUploadedImage(null);
    toast({
      title: t('teacherCourseDetails.success'),
      description: t('teacherCourseDetails.courseThumbnailRemoved'),
    });
  };

  const updateCourseDetails = async () => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          title: editForm.title,
          description: editForm.description,
          category: editForm.category,
          price: editForm.price,
          cover_image_url: uploadedImage?.url || course?.cover_image_url || null
        })
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: t('teacherCourseDetails.success'),
        description: t('teacherCourseDetails.courseDetailsUpdated'),
      });

      // Refresh course data
      fetchCourseDetails();
      setUploadedImage(null);
    } catch (error: unknown) {
      console.error('Error updating course:', error);
      toast({
        title: t('teacherCourseDetails.error'),
        description: error instanceof Error ? error.message : t('teacherCourseDetails.failedToUpdateCourse'),
        variant: 'destructive',
      });
    }
  };

  const deleteCourse = async () => {
    setIsDeleting(true);
    try {
      // Delete related data first (enrollments, lessons, quizzes, etc.)
      const { error: enrollmentsError } = await supabase
        .from('enrollments')
        .delete()
        .eq('course_id', courseId);

      if (enrollmentsError) throw enrollmentsError;

      const { error: lessonsError } = await supabase
        .from('lessons')
        .delete()
        .eq('course_id', courseId);

      if (lessonsError) throw lessonsError;

      const { error: quizzesError } = await supabase
        .from('quizzes')
        .delete()
        .eq('course_id', courseId);

      if (quizzesError) throw quizzesError;



      // Finally delete the course
      const { error: courseError } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (courseError) throw courseError;

      toast({
        title: t('teacherCourseDetails.success'),
        description: t('teacherCourseDetails.courseDeleted'),
      });

      // Navigate back to teacher dashboard
      navigate('/teacher/courses');
    } catch (error: unknown) {
      console.error('Error deleting course:', error);
      toast({
        title: t('teacherCourseDetails.error'),
        description: error instanceof Error ? error.message : t('teacherCourseDetails.failedToDeleteCourse'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <Card className="glass-card border-white/10">
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Course not found</h2>
            <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const sidebarItems = [
    { id: 'overview', label: t('teacherCourseDetails.overview'), icon: BarChart3, description: t('teacherCourseDetails.overviewDescription') },
    { id: 'manage', label: t('teacherCourseDetails.manageContent'), icon: Cog, description: t('teacherCourseDetails.manageContentDescription'), isLink: true, href: `/teacher/courses/${courseId}/manage` },
    { id: 'students', label: t('teacherCourseDetails.students'), icon: Users, description: t('teacherCourseDetails.studentsDescription') },
    { id: 'ai-assistant', label: t('teacherCourseDetails.aiAssistant'), icon: Bot, description: t('teacherCourseDetails.aiAssistantDescription') },
    { id: 'codes', label: t('teacherCourseDetails.courseCodes'), icon: Tag, description: t('teacherCourseDetails.courseCodesDescription') },
    { id: 'settings', label: t('teacherCourseDetails.settings'), icon: Settings, description: t('teacherCourseDetails.settingsDescription') },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-6">
              <Card className="glass-card border-white/10 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border-primary-500/20">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400">{t('teacherCourseDetails.totalStudents')}</p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-700 dark:text-primary-300">{enrollmentCount}</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-primary-500/20 rounded-xl">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10 bg-gradient-to-br from-blue-500/10 to-accent-500/10 border-blue-500/20">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">{t('teacherCourseDetails.revenue')}</p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-300">{enrollmentCount * course.price}</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-blue-500/20 rounded-xl">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400">{t('teacherCourseDetails.completionRate')}</p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-700 dark:text-purple-300">87%</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-purple-500/20 rounded-xl">
                      <Trophy className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-orange-600 dark:text-orange-400">{t('teacherCourseDetails.rating')}</p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-700 dark:text-orange-300">4.8</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-orange-500/20 rounded-xl">
                      <Target className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Course header moved above tabs; removed here to avoid duplication */}
            {/* Course Discussions */}
            <Card className="glass-card border-white/10">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                  {t('teacherCourseDetails.courseDiscussions')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DiscussionForum courseId={courseId!} />
              </CardContent>
            </Card>
          </div>
        );

      case 'students':
        return (
          <Card className="glass-card border-white/10">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                {t('teacherCourseDetails.studentManagement')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StudentManager courseId={courseId!} />
            </CardContent>
          </Card>
        );

      case 'ai-assistant':
        return <CourseAiAssistantTab courseId={courseId!} />;

      case 'codes':
        return (
          <Card className="glass-card border-white/10">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
                {t('teacherCourseDetails.courseCodesAndDiscounts')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CourseCodesManager courseId={courseId!} />
            </CardContent>
          </Card>
        );

      case 'settings':
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Course Settings */}
            <Card className="glass-card border-white/10">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  {t('teacherCourseDetails.courseSettings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">


                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium">{t('teacherCourseDetails.courseTitle')}</label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={t('teacherCourseDetails.enterCourseTitle')}
                      className="glass-input text-sm sm:text-base"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs sm:text-sm font-medium">{t('teacherCourseDetails.description')}</label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={t('teacherCourseDetails.enterCourseDescription')}
                      rows={4}
                      className="glass-input text-sm sm:text-base"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs sm:text-sm font-medium">{t('teacherCourseDetails.category')}</label>
                    <Input
                      value={editForm.category}
                      onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                      placeholder={t('teacherCourseDetails.enterCourseCategory')}
                      className="glass-input text-sm sm:text-base"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs sm:text-sm font-medium">{t('teacherCourseDetails.priceCredits')}</label>
                    <Input
                      type="number"
                      min="0"
                      value={editForm.price}
                      onChange={(e) => setEditForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                      placeholder={t('teacherCourseDetails.enterCoursePrice')}
                      className="glass-input text-sm sm:text-base"
                    />
                  </div>
                  
                  {/* Current Thumbnail Display */}
                  <div>
                    <label className="text-xs sm:text-sm font-medium mb-2 block">{t('teacherCourseDetails.currentThumbnail')}</label>
                    <div className="w-full h-32 sm:h-40 md:h-48 overflow-hidden rounded-xl border border-white/10">
                      {course?.cover_image_url ? (
                        <img
                          src={course.cover_image_url}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/10 to-muted/20 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-primary/60" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail Uploader */}
                  <div>
                    <label className="text-xs sm:text-sm font-medium mb-2 block">{t('teacherCourseDetails.updateThumbnail')}</label>
                    <ImageUploader
                      bucket={IMAGE_UPLOAD_BUCKETS.LECTURES_THUMBNAILS}
                      folder="courses"
                      compress={true}
                      generateThumbnail={true}
                      onImageUploaded={handleImageUploaded}
                      onImageDeleted={handleImageDeleted}
                      onError={(error) => {
                        toast({
                          title: t('teacherCourseDetails.error'),
                          description: error,
                          variant: 'destructive',
                        });
                      }}
                      variant="compact"
                      size="sm"
                      placeholder={t('teacherCourseDetails.uploadCourseThumbnail')}
                    />
                  </div>

                  {/* AI Image Generator */}
                  {/* <div className="pt-4 border-t border-white/10">
                    <ImageGenerator
                      bucket={IMAGE_UPLOAD_BUCKETS.LECTURES_THUMBNAILS}
                      folder="courses"
                      title="AI Course Thumbnail Generator"
                      description="Generate custom course thumbnails using AI based on your course description"
                      placeholder="Describe the perfect thumbnail for your course (e.g., 'A modern classroom with students learning programming, clean and professional')"
                      onImageUploaded={(url) => {
                        handleImageUploaded({ url, path: '', size: 0, type: 'image/png', name: 'ai-generated-thumbnail.png' });
                        toast({
                          title: t('teacherCourseDetails.success'),
                          description: 'AI-generated thumbnail uploaded successfully!',
                        });
                      }}
                      onError={(error) => {
                        toast({
                          title: t('teacherCourseDetails.error'),
                          description: error,
                          variant: 'destructive',
                        });
                      }}
                    />
                  </div> */}
                  
                  <Button onClick={updateCourseDetails} className="w-full btn-primary text-sm sm:text-base py-2 sm:py-3">
                    <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    {t('teacherCourseDetails.saveChanges')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="glass-card border-red-500/20 bg-red-500/5">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-red-400 text-base sm:text-lg">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                  {t('teacherCourseDetails.dangerZone')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-400 mb-1 text-sm sm:text-base">{t('teacherCourseDetails.deleteCourse')}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                        {t('teacherCourseDetails.deleteCourseDescription')}
                      </p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>• {t('teacherCourseDetails.deleteCourseBullet1')}</p>
                        <p>• {t('teacherCourseDetails.deleteCourseBullet2')}</p>
                        <p>• {t('teacherCourseDetails.deleteCourseBullet3')}</p>
                        <p>• {t('teacherCourseDetails.deleteCourseBullet4')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 sm:mt-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          className="w-full bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700 text-sm sm:text-base py-2 sm:py-3"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          {t('teacherCourseDetails.deleteCourse')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-card border-red-500/20">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2 text-red-400">
                            <AlertTriangle className="h-5 w-5" />
                            {t('teacherCourseDetails.deleteCourseConfirmTitle')}
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            {t('teacherCourseDetails.deleteCourseConfirmDescription', { courseTitle: course?.title })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="my-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• {t('teacherCourseDetails.deleteCourseConfirmBullet1')}</li>
                            <li>• {t('teacherCourseDetails.deleteCourseConfirmBullet2')}</li>
                            <li>• {t('teacherCourseDetails.deleteCourseConfirmBullet3', { enrollmentCount })}</li>
                            <li>• {t('teacherCourseDetails.deleteCourseConfirmBullet4')}</li>
                          </ul>
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-border hover:bg-muted">
                            {t('teacherCourseDetails.cancel')}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={deleteCourse}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                          >
                            {isDeleting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                {t('teacherCourseDetails.deleting')}
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('teacherCourseDetails.deleteCourse')}
                              </>
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <Card className="glass-card border-white/10">
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">{t('teacherCourseDetails.courseNotFound')}</h2>
            <p className="text-muted-foreground">{t('teacherCourseDetails.courseNotFoundDescription')}</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <>
      <SEOHead 
        contentTitle={course.title}
        contentDescription={course.description || 'Manage your course content, lessons, quizzes, and student enrollments.'}
      />
      <DashboardLayout>
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-6rem)] bg-background relative overflow-hidden">
        {/* Left Sidebar - hidden on mobile, collapsible on desktop */}
        <div className={`hidden md:block transition-all duration-300 ease-in-out border-r border-white/10 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-xl ${sidebarCollapsed ? 'md:w-20' : 'md:w-80'} md:relative z-30 shrink-0`}>
          {/* Collapse/Expand Button - Only visible on desktop */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:block absolute -right-4 top-8 z-50 h-8 w-8 rounded-full bg-background border border-border shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
          
          {/* Mobile close button removed since sidebar is hidden on mobile */}

          <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
            {/* Header */}
            <div className="space-y-3 sm:space-y-4">
              <Link to="/teacher/dashboard">
                <Button variant="outline" size="sm" className={`glass-card transition-all duration-200 text-xs sm:text-sm ${sidebarCollapsed ? 'w-8 h-8 p-0' : 'px-2 sm:px-3 py-1 sm:py-2'}`}>
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  {!sidebarCollapsed && <span className="ml-1 sm:ml-2">{t('teacherCourseDetails.backToDashboard')}</span>}
                </Button>
              </Link>
              
              {!sidebarCollapsed && (
                <div className="p-3 sm:p-4 md:p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                    {t('teacherCourseDetails.courseManagement')}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t('teacherCourseDetails.manageAllAspects')}
                  </p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="space-y-1 sm:space-y-2">
              

              {sidebarItems.map((item) => {
                if (item.isLink) {
                  return (
                    <Link key={item.id} to={item.href!} onClick={() => setSidebarCollapsed(true)}>
                      <button
                        className={`w-full group flex items-center gap-2 sm:gap-3 px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-2xl transition-all duration-300 relative overflow-hidden hover:bg-white/10 hover:text-primary hover-glow hover:shadow-lg hover:shadow-white/10 ${
                          sidebarCollapsed ? 'justify-center' : ''
                        }`}
                        title={sidebarCollapsed ? item.label : ''}
                      >
                        <div className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 group-hover:bg-primary/10 group-hover:shadow-md`}>
                          <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        {!sidebarCollapsed && (
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-xs sm:text-sm">{item.label}</div>
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          </div>
                        )}
                      </button>
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarCollapsed(true);
                    }}
                    className={`w-full group flex items-center gap-2 sm:gap-3 px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-primary glow border border-primary/30 shadow-lg shadow-primary/20'
                        : 'hover:bg-white/10 hover:text-primary hover-glow hover:shadow-lg hover:shadow-white/10'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    <div className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 ${
                      activeTab === item.id
                        ? 'bg-primary/20 text-primary shadow-lg shadow-primary/25'
                        : 'group-hover:bg-primary/10 group-hover:shadow-md'
                    }`}>
                      <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    {!sidebarCollapsed && (
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-xs sm:text-sm">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    )}
                    {activeTab === item.id && (
                      <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-primary to-secondary rounded-r shadow-lg shadow-primary/50" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 min-w-0 min-h-0 overflow-y-auto">
          <div className="w-full max-w-6xl mx-auto space-y-3 sm:space-y-4">
            {/* Course Header - persistent on all tabs */}
            <Card className="glass-card border-white/10">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                      {course.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2">
                      <Badge variant={course.status === 'published' ? 'default' : 'secondary'} className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                        {course.status || 'draft'}
                      </Badge>
                      {course.category && <Badge variant="outline" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">{course.category}</Badge>}
                      <Badge variant="outline" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">{course.price} Credits</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <Button asChild variant="default" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">
                      <Link to={`/teacher/courses/${courseId}/manage`}>
                        <Cog className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">{t('teacherCourseDetails.manage')}</span>
                        <span className="sm:hidden">Manage</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">
                      <Link to={`/courses/${courseId}`}>
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">{t('teacherCourseDetails.preview')}</span>
                        <span className="sm:hidden">Preview</span>
                      </Link>
                    </Button>
                    {course.status !== 'published' ? (
                      <Button onClick={() => updateCourseStatus('published')} size="sm" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">{t('teacherCourseDetails.publishCourse')}</span>
                        <span className="sm:hidden">Publish</span>
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => updateCourseStatus('draft')} size="sm" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">
                        <span className="hidden sm:inline">{t('teacherCourseDetails.unpublish')}</span>
                        <span className="sm:hidden">Unpublish</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  {course.description || t('teacherCourseDetails.noDescriptionAvailable')}
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 md:gap-6 mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{t('teacherCourseDetails.created')} {new Date(course.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{t('teacherCourseDetails.code')}: {course.enrollment_code || t('teacherCourseDetails.none')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Tabs - under header, replaces sidebar on small screens */}
            <div className="md:hidden">
              <Tabs value={activeTab} onValueChange={(v) => {
                if (v === 'manage') {
                  navigate(`/teacher/courses/${courseId}/manage`);
                  return;
                }
                setActiveTab(v);
              }}>
                <div className="w-full overflow-x-auto">
                  <TabsList className="flex p-1 gap-1 whitespace-nowrap">
                    <TabsTrigger className="shrink-0 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2" value="overview">{t('teacherCourseDetails.overview')}</TabsTrigger>
                    <TabsTrigger className="shrink-0 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2" value="students">{t('teacherCourseDetails.students')}</TabsTrigger>
                    <TabsTrigger className="shrink-0 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2" value="ai-assistant">{t('teacherCourseDetails.aiAssistant')}</TabsTrigger>
                    <TabsTrigger className="shrink-0 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2" value="codes">{t('teacherCourseDetails.courseCodes')}</TabsTrigger>
                    <TabsTrigger className="shrink-0 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2" value="settings">{t('teacherCourseDetails.settings')}</TabsTrigger>
                    
                  </TabsList>
                </div>
              </Tabs>
            </div>

            {/* Tab Content */}
            <div>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
    </>
  );
};
