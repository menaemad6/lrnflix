import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useItemOwnershipValidation } from '@/hooks/useItemOwnershipValidation';
import { TeacherCourseSidebar } from './TeacherCourseSidebar';
import { LessonManager } from '@/components/lessons/LessonManager';
import { QuizManager } from '@/components/quizzes/QuizManager';
import { AttachmentManager } from '@/components/attachments/AttachmentManager';
import { Card, CardContent } from '@/components/ui/card';
import { QuizEditor } from '@/components/quizzes/QuizEditor';
import { LessonEditor } from '@/components/lessons/LessonEditor';
import { AttachmentEditor } from '@/components/attachments/AttachmentEditor';
import { TeacherCourseOverview } from './TeacherCourseOverview';
import { GoogleMeetIntegration } from '../lectures/GoogleMeetIntegration';
import { TeacherCourseManagementSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { SEOHead } from '@/components/seo';
import { Attachment } from '@/lib/attachmentQueries';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id?: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  order_index: number;
  created_at: string;
  course_id: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  type: string;
  time_limit: number | null;
  max_attempts: number | null;
  order_index: number;
  created_at: string;
}

type ViewMode = 'overview' | 'lessons' | 'quizzes' | 'attachments' | 'edit-lesson' | 'edit-quiz' | 'edit-attachment' | 'live-lectures';

export const TeacherCourseManagement = () => {
  const { t } = useTranslation('courses');
  const { id, lessonId, quizId, attachmentId } = useParams<{ id: string; lessonId?: string; quizId?: string; attachmentId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [currentItem, setCurrentItem] = useState<{ type: 'lesson' | 'quiz' | 'attachment' | null; id: string | null }>({ type: null, id: null });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { validateOwnership } = useItemOwnershipValidation({
    redirectTo: '/teacher/courses',
  });

  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Handle URL parameters to set appropriate view mode
  useEffect(() => {
    if (lessonId) {
      setCurrentItem({ type: 'lesson', id: lessonId });
      setViewMode('edit-lesson');
    } else if (quizId) {
      setCurrentItem({ type: 'quiz', id: quizId });
      setViewMode('edit-quiz');
    } else if (attachmentId) {
      setCurrentItem({ type: 'attachment', id: attachmentId });
      setViewMode('edit-attachment');
    }
  }, [lessonId, quizId, attachmentId]);

  // Handle route-based view mode changes
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/manage/lessons') && !path.includes('/manage/lessons/')) {
      setViewMode('lessons');
      setCurrentItem({ type: null, id: null });
    } else if (path.includes('/manage/quizzes') && !path.includes('/manage/quizzes/')) {
      setViewMode('quizzes');
      setCurrentItem({ type: null, id: null });
    } else if (path.includes('/manage/attachments') && !path.includes('/manage/attachments/')) {
      setViewMode('attachments');
      setCurrentItem({ type: null, id: null });
    } else if (path.includes('/manage/live-lectures')) {
      setViewMode('live-lectures');
      setCurrentItem({ type: null, id: null });
    } else if (path.endsWith('/manage')) {
      setViewMode('overview');
      setCurrentItem({ type: null, id: null });
    }
  }, [location.pathname]);

  const fetchCourseData = async () => {
    try {
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) throw courseError;
      
      // Validate course access BEFORE setting any state
      if (courseData) {
        // Get the course creator/instructor ID
        const creatorId = courseData.instructor_id;
        
        if (!creatorId) {
                  toast({
          title: t('teacherCourseDetails.error'),
          description: 'Course ownership information not found',
          variant: 'destructive',
        });
          navigate('/teacher/courses');
          return;
        }

        // Use the hook to validate ownership - this will handle redirection automatically
        validateOwnership(creatorId);

        // Access validated, now set course data
        setCourse(courseData);

        // Fetch lessons
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', id)
          .order('order_index');

        if (lessonsError) throw lessonsError;
        setLessons(lessonsData || []);

        // Fetch quizzes
        const { data: quizzesData, error: quizzesError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('course_id', id)
          .order('order_index');

        if (quizzesError) throw quizzesError;
        setQuizzes(quizzesData || []);

        // Fetch attachments
        const { data: attachmentsData, error: attachmentsError } = await supabase
          .from('attachments')
          .select('*')
          .eq('course_id', id)
          .is('chapter_id', null)
          .order('order_index');

        if (attachmentsError) throw attachmentsError;
        setAttachments(attachmentsData || []);
      }
    } catch (error: unknown) {
      console.error('Error fetching course data:', error);
      toast({
        title: t('teacherCourseDetails.error'),
        description: 'Failed to load course data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (type: 'lesson' | 'quiz' | 'attachment', id: string) => {
    setCurrentItem({ type, id });
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm(t('teacherCourseDetails.deleteCourseConfirmDescription'))) return;

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      toast({
        title: t('teacherCourseDetails.success'),
        description: 'Lesson deleted successfully',
      });

      fetchCourseData();
    } catch (error: unknown) {
      console.error('Error deleting lesson:', error);
      toast({
        title: t('teacherCourseDetails.error'),
        description: error instanceof Error ? error.message : 'Failed to delete lesson',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm(t('teacherCourseDetails.deleteCourseConfirmDescription'))) return;

    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;

      toast({
        title: t('teacherCourseDetails.success'),
        description: 'Quiz deleted successfully',
      });

      fetchCourseData();
    } catch (error: unknown) {
      console.error('Error deleting quiz:', error);
      toast({
        title: t('teacherCourseDetails.error'),
        description: error instanceof Error ? error.message : 'Failed to delete quiz',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm(t('teacherCourseDetails.deleteCourseConfirmDescription'))) return;

    try {
      const { error } = await supabase
        .from('attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;

      toast({
        title: t('teacherCourseDetails.success'),
        description: 'Attachment deleted successfully',
      });

      fetchCourseData();
    } catch (error: unknown) {
      console.error('Error deleting attachment:', error);
      toast({
        title: t('teacherCourseDetails.error'),
        description: error instanceof Error ? error.message : 'Failed to delete attachment',
        variant: 'destructive',
      });
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    // Update URL based on the new view mode
    if (mode === 'lessons') {
      navigate(`/teacher/courses/${id}/manage/lessons`);
    } else if (mode === 'quizzes') {
      navigate(`/teacher/courses/${id}/manage/quizzes`);
    } else if (mode === 'attachments') {
      navigate(`/teacher/courses/${id}/manage/attachments`);
    } else if (mode === 'overview') {
      navigate(`/teacher/courses/${id}/manage`);
    }
  };

  const renderMainContent = (itemId? : string) => {
    if (loading) {
      return <TeacherCourseManagementSkeleton />;
    }

    // Check if we have URL parameters that should override the view mode
    if (lessonId && currentItem.type === 'lesson' && currentItem.id === lessonId) {
      return (
        <LessonEditor 
          lessonId={lessonId}
          onBack={() => {
            setViewMode('overview');
            setCurrentItem({ type: null, id: null });
            // Update URL to remove lessonId
            navigate(`/teacher/courses/${id}/manage`);
          }}
        />
      );
    }

    if (quizId && currentItem.type === 'quiz' && currentItem.id === quizId) {
      return (
        <QuizEditor 
          courseId={id!} 
          quizId={quizId}
          onBack={() => {
            setViewMode('overview');
            setCurrentItem({ type: null, id: null });
            // Update URL to remove quizId
            navigate(`/teacher/courses/${id}/manage`);
          }}
        />
      );
    }

    if (attachmentId && currentItem.type === 'attachment' && currentItem.id === attachmentId) {
      return (
        <AttachmentEditor 
          attachmentId={attachmentId}
          onBack={() => {
            setViewMode('overview');
            setCurrentItem({ type: null, id: null });
            // Update URL to remove attachmentId
            navigate(`/teacher/courses/${id}/manage`);
          }}
        />
      );
    }

    switch (viewMode) {
      case 'lessons':
        return (
          <LessonManager
            courseId={id!}
            onBack={() => setViewMode('overview')}
          />
        );
      case 'quizzes':
        return (
            <QuizManager
              courseId={id!}
              onBack={() => setViewMode('overview')}
            />
          );
      case 'attachments':
        return (
          <AttachmentManager
            courseId={id!}
            onBack={() => setViewMode('overview')}
          />
        );
      case 'edit-lesson':
        return (
          <LessonEditor 
            lessonId={currentItem.id!}
            onBack={() => {
              setViewMode('overview');
              setCurrentItem({ type: null, id: null });
            }}
          />
        );
      case 'edit-quiz':
        return (
          <QuizEditor 
            courseId={course.id!} 
            quizId={currentItem.id!}
            onBack={() => {
              setViewMode('overview');
              setCurrentItem({ type: null, id: null });
            }}
          />
        );
      case 'edit-attachment':
        return (
          <AttachmentEditor 
            attachmentId={currentItem.id!}
            onBack={() => {
              setViewMode('overview');
              setCurrentItem({ type: null, id: null });
            }}
          />
        );
      case 'live-lectures':
        return (
          <GoogleMeetIntegration
            courseId={id!}
            onBack={() => setViewMode('overview')}
          />
        );

              default:
          return (
            <TeacherCourseOverview
              course={course}
              lessons={lessons}
              quizzes={quizzes}
              attachments={attachments}
              onItemSelect={(type, id) => {
                setCurrentItem({ type, id });
                if (type === 'lesson') {
                  setViewMode('edit-lesson');
                  navigate(`/teacher/courses/${id}/manage/lessons/${id}`);
                } else if (type === 'quiz') {
                  setViewMode('edit-quiz');
                  navigate(`/teacher/courses/${id}/manage/quizzes/${id}`);
                } else if (type === 'attachment') {
                  setViewMode('edit-attachment');
                  navigate(`/teacher/courses/${id}/manage/attachments/${id}`);
                }
              }}
            />
          );
    }
  };

  if (!course) {
    return <TeacherCourseManagementSkeleton />;
  }

  // Additional security check - ensure course ownership is still valid
  if (course.instructor_id) {
    validateOwnership(course.instructor_id);
  }

  return (
    <>
      <SEOHead 
        contentTitle={`${course.title} - Management`}
        contentDescription={`Manage content, lessons, quizzes, attachments, and student progress for ${course.title}.`}
      />
      <div className="min-h-screen bg-background pt-20 flex lg:flex-row">
      {/* Static sidebar on large screens */}
      <div className="hidden lg:flex w-80 shrink-0 border-r h-[calc(100vh-5rem)] bg-card/30 sticky top-20 self-start">
        <TeacherCourseSidebar
          course={course}
          lessons={lessons}
          quizzes={quizzes}
          attachments={attachments}
          currentItem={currentItem}
          onItemSelect={(type, id) => {
            handleItemSelect(type, id);
          }}
          onDeleteLesson={handleDeleteLesson}
          onDeleteQuiz={handleDeleteQuiz}
          onDeleteAttachment={handleDeleteAttachment}
          onContentUpdate={fetchCourseData}
          onViewModeChange={(mode) => {
            handleViewModeChange(mode);
          }}
          viewMode={viewMode}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 p-3 sm:p-6 min-w-0 overflow-x-hidden">
        <div className="max-w-full">
          {renderMainContent()}
        </div>
      </div>

      {/* Floating mobile toggle button */}
      <Button
        onClick={() => setMobileSidebarOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 z-[60] rounded-full w-12 h-12 p-0 shadow-lg shadow-primary-500/25 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
        aria-label={t('courseManagementSidebar.management')}
      >
        <Menu className="h-5 w-5 text-black" />
      </Button>

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-[80vw] max-w-sm">
          <TeacherCourseSidebar
            course={course}
            lessons={lessons}
            quizzes={quizzes}
            attachments={attachments}
            currentItem={currentItem}
            onItemSelect={(type, id) => {
              handleItemSelect(type, id);
              setMobileSidebarOpen(false);
            }}
            onDeleteLesson={handleDeleteLesson}
            onDeleteQuiz={handleDeleteQuiz}
            onDeleteAttachment={handleDeleteAttachment}
            onContentUpdate={fetchCourseData}
            onViewModeChange={(mode) => {
              handleViewModeChange(mode);
              setMobileSidebarOpen(false);
            }}
            viewMode={viewMode}
          />
        </SheetContent>
      </Sheet>
    </div>
    </>
  );
};
