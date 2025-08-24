import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTenantItemValidation } from '@/hooks/useTenantItemValidation';
import { 
  BookOpen, 
  CheckCircle,
  Users,
  Star,
  ArrowRight,
  Trophy,
  Globe,
  User,
  Calendar
} from 'lucide-react';
import { useRandomBackground } from "../../hooks/useRandomBackground";
import { PremiumCourseCard } from '@/components/courses/PremiumCourseCard';
import { CourseViewSkeleton } from '@/components/student/skeletons/CourseViewSkeleton';
import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo';
import { getDynamicSEOMetadata } from '@/data/seo';
import { PurchaseChoicesModal } from '@/components/courses/PurchaseChoicesModal';
import { PurchaseModal } from '@/components/courses/PurchaseModal';
import AuthModal from '@/components/ui/AuthModal';
import AuthForm from '@/pages/auth/AuthForm';

interface Chapter {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number;
  created_at: string;
  cover_image_url?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  instructor_id: string;
  profiles?: {
    full_name: string;
  };
}

// Add a type for chapterCourses
interface ChapterCourse {
  id: string;
  course?: {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    instructor_id: string;
    cover_image_url?: string;
    created_at?: string;
    profiles?: {
      full_name?: string;
      avatar_url?: string;
    };
    avatar_url?: string;
    instructor_name?: string; // NEW
  };
  title?: string;
  description?: string;
}

export const ChapterDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { t } = useTranslation('dashboard');
  const { validateAndHandle, validateWithCreatorId } = useTenantItemValidation({
    redirectTo: '/chapters',
  });
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userWallet, setUserWallet] = useState(0);
  const navigate = useNavigate();
  const bgClass = useRandomBackground();
  const [chapterCourses, setChapterCourses] = useState<ChapterCourse[]>([]);
  const [instructorAvatars, setInstructorAvatars] = useState<Record<string, string | undefined>>({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPurchaseChoicesModal, setShowPurchaseChoicesModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (id) {
      fetchChapterData();
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

  const fetchChapterData = async () => {
    try {
      const { data: chapterData, error: chapterError } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (chapterError) throw chapterError;
      
      // Validate chapter access before setting it
      // Note: Chapters might not have instructor_id, so we'll validate the courses instead
      setChapter(chapterData);

      // Check enrollment
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: enrollment } = await supabase
          .from('chapter_enrollments')
          .select('*')
          .eq('chapter_id', id)
          .eq('student_id', user.id)
          .maybeSingle();

        setIsEnrolled(!!enrollment);
        
        // If enrolled, sync course enrollments to ensure they have access to all chapter courses
        if (enrollment) {
          try {
            const { syncChapterCourseEnrollments } = await import('@/utils/enrollmentUtils');
            const syncResult = await syncChapterCourseEnrollments(user.id, id);
            if (syncResult.success) {
              console.log('Course enrollments synced:', syncResult.message);
            } else {
              console.warn('Course enrollment sync failed:', syncResult.message);
            }
          } catch (syncError) {
            console.error('Error syncing course enrollments:', syncError);
          }
        }
      }

      // Fetch courses for this chapter using chapter_objects, including instructor profile
      const { data: objectsData, error: objectsError } = await supabase
        .from('chapter_objects')
        .select('*, course:courses!object_id(*, profiles:profiles!courses_instructor_id_fkey(full_name, avatar_url))')
        .eq('chapter_id', id)
        .eq('object_type', 'course');
      if (objectsError) throw objectsError;
      const chapterCoursesData = objectsData as ChapterCourse[] || [];
      // Attach avatar_url and instructor_name to each course from the joined profile
      setChapterCourses(
        chapterCoursesData.map(obj => obj.course ? {
          ...obj,
          course: {
            ...obj.course,
            instructor_name: obj.course.profiles?.full_name || t('studentChapterDetail.courseInstructor'),
            avatar_url: obj.course.profiles?.avatar_url || undefined,
          }
        } : obj)
      );

    } catch (error: unknown) {
      console.error('Error fetching chapter:', error);
      toast({
        title: t('studentChapterDetail.error'),
        description: t('studentChapterDetail.failedToLoadChapter'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseChapter = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setShowAuthModal(true);
        return;
      }

      const result = await supabase.rpc('enroll_chapter_with_payment', {
        p_chapter_id: id
      });

      if (result.error) throw result.error;

      const response = result.data as unknown;
      if (response && typeof response === 'object' && 'success' in response && (response as { success: boolean }).success) {
        toast({
          title: t('studentChapterDetail.success'),
          description: (response as { message?: string }).message,
        });
        setIsEnrolled(true);
        fetchChapterData();
        fetchUserWallet();
      } else {
        toast({
          title: t('studentChapterDetail.error'),
          description: (response && typeof response === 'object' && 'error' in response) ? (response as { error?: string }).error : 'Failed to enroll',
          variant: 'destructive',
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error purchasing chapter:', err);
      toast({
        title: t('studentChapterDetail.error'),
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleEnrollClick = () => {
    if (!userId) {
      setShowAuthModal(true);
    } else {
      setShowPurchaseChoicesModal(true);
    }
  };

  const handleWalletSelected = () => {
    setShowPurchaseModal(true);
  };

  const handlePurchaseSuccess = () => {
    setIsEnrolled(true);
    setShowPurchaseModal(false);
    fetchChapterData();
    fetchUserWallet();
  };

  if (loading) {
    return <CourseViewSkeleton />;
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 flex items-center justify-center p-6">
        <Card className="glass-card border-white/10 shadow-2xl backdrop-blur-xl">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
              {t('studentChapterDetail.chapterNotFound')}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mt-4">
              {t('studentChapterDetail.chapterNotFoundDescription')}
            </p>
            <div className="flex gap-4 mt-8 justify-center">
              <Button onClick={() => navigate('/chapters')}>
                {t('studentChapterDetail.backToChapters')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        contentTitle={chapter?.title || 'Chapter'}
        contentDescription={chapter?.description || 'Explore organized learning chapters and structured educational content.'}
      />
      <div className={bgClass + " min-h-screen"}>
        {/* Hero Section */}
        <div className="relative overflow-hidden pt-20 min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5"></div>
        
        <div className="relative container mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Chapter Header */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
                    {t('studentChapterDetail.chapter')}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    4.8
                  </Badge>
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent leading-tight">
                  {chapter.title}
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                  {chapter.description}
                </p>

                {/* Chapter Stats */}
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{chapterCourses.length} {t('studentChapterDetail.coursesIncluded')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{t('studentChapterDetail.created')} {new Date(chapter.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>{t('studentChapterDetail.language')}</span>
                  </div>
                </div>

                {isEnrolled && (
                  <Card className="bg-gradient-to-r from-primary-500/10 to-primary-500/10 border-primary-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <Trophy className="h-6 w-6 text-primary-500" />
                        <div>
                          <h3 className="font-semibold text-primary-700 dark:text-primary-300">{t('studentChapterDetail.enrolledSuccessfully')}</h3>
                          <p className="text-sm text-primary-600 dark:text-primary-400">{t('studentChapterDetail.enrolledSuccessfullyDescription')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Courses List */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">{t('studentChapterDetail.coursesInThisChapter')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {chapterCourses.map((obj) => (
                    obj.course ? (
                      <PremiumCourseCard
                        key={obj.course.id}
                        id={obj.course.id}
                        title={obj.course.title}
                        description={obj.course.description}
                        category={obj.course.category}
                        status="published"
                        instructor_name={obj.course.instructor_name}
                        enrollment_count={0}
                        is_enrolled={isEnrolled}
                        enrollment_code={''}
                        cover_image_url={obj.course.cover_image_url}
                        created_at={obj.course.created_at}
                        price={obj.course.price}
                        avatar_url={obj.course.avatar_url}
                        {...(isEnrolled ? {
                          onPreview: () => navigate(`/courses/${obj.course.id}`),
                          onEnroll: () => {},
                          onContinue: () => navigate(`/courses/${obj.course.id}`)
                        } : {})}
                      />
                    ) : null
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="glass-card sticky top-24">
                <CardContent className="p-6 space-y-6">
                  {/* Chapter Thumbnail */}
                  {chapter.cover_image_url && (
                    <div className="text-center">
                      <img 
                        src={chapter.cover_image_url} 
                        alt={chapter.title}
                        className="w-full mx-auto rounded-lg object-cover border border-border/20 shadow-lg"
                      />
                    </div>
                  )}
                  
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-primary">
                      {chapter.price} {t('studentChapterDetail.egp')}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('studentChapterDetail.oneTimePayment')}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{t('studentChapterDetail.accessToCourses')} {chapterCourses.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{t('studentChapterDetail.lifetimeAccess')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{t('studentChapterDetail.certificateOfCompletion')}</span>
                    </div>
                  </div>

                  {isEnrolled ? (
                    <Button disabled className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t('studentChapterDetail.enrolled')}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Button 
                        onClick={handleEnrollClick}
                        className="w-full btn-primary"
                        disabled={userWallet < chapter.price}
                      >
                        {userWallet < chapter.price ? t('studentChapterDetail.insufficientCredits') : t('studentChapterDetail.enrollInChapter')}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        {t('studentChapterDetail.yourBalance')} {userWallet}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Modals */}
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      >
        <AuthForm 
          mode="login" 
          setMode={() => {}} 
          onClose={() => setShowAuthModal(false)}
        />
      </AuthModal>

      <PurchaseChoicesModal
        isOpen={showPurchaseChoicesModal}
        onClose={() => setShowPurchaseChoicesModal(false)}
        item={{
          id: id || '',
          title: chapter?.title || '',
          price: chapter?.price || 0,
          instructor_id: chapterCourses[0]?.course?.instructor_id || '',
          type: 'chapter'
        }}
        onWalletSelected={handleWalletSelected}
      />

      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        item={{
          id: id || '',
          title: chapter?.title || '',
          price: chapter?.price || 0,
          instructor_id: chapterCourses[0]?.course?.instructor_id || '',
          type: 'chapter'
        }}
        userWallet={userWallet}
        onPurchaseSuccess={handlePurchaseSuccess}
      />
    </>
  );
};