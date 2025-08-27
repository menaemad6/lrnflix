import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenantItemValidation } from '@/hooks/useTenantItemValidation';
import { CourseSidebar } from '@/components/courses/CourseSidebar';
import { LessonContent } from '@/components/lessons/LessonContent';
import { StudentQuizTaker } from '@/components/quizzes/StudentQuizTaker';
import { AttachmentContent } from '@/components/attachments/AttachmentContent';
import { EnrollmentPrompt } from '@/components/courses/EnrollmentPrompt';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useRandomBackground } from "../../hooks/useRandomBackground";
import { CourseProgressSkeleton, LessonContentSkeleton, QuizTakerSkeleton } from '@/components/student/skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { SEOHead } from '@/components/seo';
import { getDynamicSEOMetadata } from '@/data/seo';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  profiles?: {
    full_name: string;
  };
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  chapter_id: string;
  course_id: string;
  order_index: number;
  video_url: string | null;
  view_limit: number | null;
  device_limit: number | null;
  duration_minutes: number | null;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  type: string;
  time_limit: number | null;
  max_attempts: number | null;
  created_at: string;
  order_index: number;
  shuffle_questions: boolean;
  show_results: boolean;
  show_correct_answers: boolean;
  allow_review: boolean;
  question_navigation: boolean;
}

interface QuizAttempt {
  quiz_id: string;
  score: number;
  max_score: number;
}

interface Attachment {
  id: string;
  title: string;
  description: string | null;
  attachment_url: string | null;
  type: string;
  order_index: number;
  course_id: string;
  size: number | null;
}

export const CourseProgress = () => {
  const { id, lessonId, quizId, attachmentId, attemptId } = useParams<{ id: string; lessonId?: string; quizId?: string; attachmentId?: string; attemptId?: string }>();
  const { toast } = useToast();
  const { validateAndHandle, validateWithCreatorId } = useTenantItemValidation({
    redirectTo: '/student/courses',
  });
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentAttachment, setCurrentAttachment] = useState<Attachment | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<string[]>([]);
  const [attachmentProgress, setAttachmentProgress] = useState<string[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const bgClass = useRandomBackground();
  const { t } = useTranslation('courses');

  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
  }, [id]);

  // Set the first lesson as default when lessons are loaded, or select based on URL params
  useEffect(() => {
    if (lessons.length > 0 || quizzes.length > 0 || attachments.length > 0) {
      if (lessonId) {
        const lesson = lessons.find(l => l.id === lessonId);
        if (lesson) {
          setCurrentLesson(lesson);
          setCurrentQuiz(null);
          setCurrentAttachment(null);
        }
      } else if (quizId) {
        const quiz = quizzes.find(q => q.id === quizId);
        if (quiz) {
          setCurrentQuiz(quiz);
          setCurrentLesson(null);
          setCurrentAttachment(null);
        }
      } else if (attachmentId) {
        const attachment = attachments.find(a => a.id === attachmentId);
        if (attachment) {
          setCurrentAttachment(attachment);
          setCurrentLesson(null);
          setCurrentQuiz(null);
        }
      } else {
        // Auto-select the first available content (lesson, quiz, or attachment) when no specific content is selected
        const firstLesson = lessons.sort((a, b) => a.order_index - b.order_index)[0];
        const firstQuiz = quizzes.sort((a, b) => a.order_index - b.order_index)[0];
        const firstAttachment = attachments.sort((a, b) => a.order_index - b.order_index)[0];
        
        // Find the item with the lowest order_index
        const allContent = [
          { type: 'lesson', item: firstLesson, order: firstLesson?.order_index || 999 },
          { type: 'quiz', item: firstQuiz, order: firstQuiz?.order_index || 999 },
          { type: 'attachment', item: firstAttachment, order: firstAttachment?.order_index || 999 }
        ].sort((a, b) => a.order - b.order);
        
        if (allContent[0].item) {
          if (allContent[0].type === 'lesson') {
            setCurrentLesson(allContent[0].item as Lesson);
            setCurrentQuiz(null);
            setCurrentAttachment(null);
          } else if (allContent[0].type === 'quiz') {
            setCurrentQuiz(allContent[0].item as Quiz);
            setCurrentLesson(null);
            setCurrentAttachment(null);
          } else if (allContent[0].type === 'attachment') {
            setCurrentAttachment(allContent[0].item as Attachment);
            setCurrentLesson(null);
            setCurrentQuiz(null);
          }
        }
      }
    }
  }, [lessons, quizzes, attachments, lessonId, quizId, attachmentId]);

  // Auto-close sidebar on mobile when content changes
  useEffect(() => {
    if (window.innerWidth < 1024) { // lg breakpoint
      if (currentLesson || currentQuiz || currentAttachment) {
        setSidebarOpen(false);
      }
    }
  }, [currentLesson, currentQuiz, currentAttachment]);

  const fetchCourseData = async () => {
    try {
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          profiles!courses_instructor_id_fkey(full_name)
        `)
        .eq('id', id)
        .single();

      if (courseError) throw courseError;
      
      // Validate course access before setting it
      validateWithCreatorId(courseData.instructor_id);
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

        const enrolled = !!enrollment;
        setIsEnrolled(enrolled);

        if (!enrolled) {
          setIsEnrolled(false);
          setLoading(false);
          return;
        }

        // Fetch progress if enrolled
        const { data: progressData } = await supabase
          .from('lesson_progress')
          .select('lesson_id')
          .eq('student_id', user.id);

        setProgress(progressData?.map(p => p.lesson_id) || []);

        // Note: Attachment progress tracking will be implemented later
        setAttachmentProgress([]);

        // Fetch quiz attempts
        const { data: attemptsData } = await supabase
          .from('quiz_attempts')
          .select('quiz_id, score, max_score')
          .eq('student_id', user.id)
          .not('submitted_at', 'is', null);

        setQuizAttempts(attemptsData || []);
      }

      // Fetch all lessons for this course
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_index');

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      // Fetch quizzes with proper ordering and all quiz options
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('course_id', id)
        .order('order_index');

      if (quizzesError) throw quizzesError;
      setQuizzes(quizzesData || []);

      // Fetch attachments for this course
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from('attachments')
        .select('*')
        .eq('course_id', id)
        .is('chapter_id', null)
        .order('order_index');

      if (attachmentsError) throw attachmentsError;
      setAttachments(attachmentsData || []);
    } catch (error: unknown) {
      console.error('Error fetching course:', error);
      toast({
        title: t('courseProgress.accessDenied'),
        description: t('courseProgress.failedToLoadCourse'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLessonComplete = (lessonId: string) => {
    setProgress(prev => [...prev, lessonId]);
  };

  const handleAttachmentComplete = (attachmentId: string) => {
    setAttachmentProgress(prev => [...prev, attachmentId]);
  };

  const handleQuizSelect = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setCurrentLesson(null);
    setCurrentAttachment(null);
    navigate(`/courses/${id}/progress/quiz/${quiz.id}`);
    // Close sidebar on mobile when quiz is selected
    if (window.innerWidth < 1024) { // lg breakpoint
      setSidebarOpen(false);
    }
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setCurrentQuiz(null);
    setCurrentAttachment(null);
    navigate(`/courses/${id}/progress/lesson/${lesson.id}`);
    // Close sidebar on mobile when lesson is selected
    if (window.innerWidth < 1024) { // lg breakpoint
      setSidebarOpen(false);
    }
  };

  const handleAttachmentSelect = (attachment: Attachment) => {
    setCurrentAttachment(attachment);
    setCurrentLesson(null);
    setCurrentQuiz(null);
    navigate(`/courses/${id}/progress/attachment/${attachment.id}`);
    // Close sidebar on mobile when attachment is selected
    if (window.innerWidth < 1024) { // lg breakpoint
      setSidebarOpen(false);
    }
  };

  const handleBackToCourse = () => {
    navigate(`/courses/${id}/progress`);
  };

  if (loading) {
    return <CourseProgressSkeleton />;
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">{t('courseProgress.accessDenied')}</h2>
          <p className="text-muted-foreground text-sm sm:text-base">{t('courseProgress.accessDeniedDescription')}</p>
        </div>
      </div>
    );
  }

  if (!isEnrolled) {
    return <EnrollmentPrompt courseId={id!} courseTitle={course.title} />;
  }

  return (
    <>
      <SEOHead 
        contentTitle={course?.title || 'Course Progress'}
        contentDescription={`Track your progress in ${course?.title || 'this course'} and continue your learning journey.`}
      />
      <div className={bgClass + " min-h-screen"}>
        <div className="min-h-screen bg-background flex pt-20">
          {/* Mobile Sidebar Toggle Button - Only visible on small screens */}
          <div className="lg:hidden fixed bottom-4 left-4 z-50">
            <Button
              variant="default"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 border-0"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 px-1 sm:px-4">
            {currentQuiz ? (
              <StudentQuizTaker
                quiz={currentQuiz}
                courseId={id!}
                onBackToCourse={handleBackToCourse}
                attemptId={attemptId}
              />
            ) : currentAttachment ? (
              <AttachmentContent
                attachment={currentAttachment}
                course={course}
                isCompleted={attachmentProgress.includes(currentAttachment.id)}
                onAttachmentComplete={handleAttachmentComplete}
                onBackToCourse={handleBackToCourse}
              />
            ) : currentLesson ? (
              <LessonContent
                lesson={currentLesson}
                course={course}
                isCompleted={progress.includes(currentLesson.id)}
                onLessonComplete={handleLessonComplete}
                onBackToCourse={handleBackToCourse}
              />
            ) : lessons.length === 0 && quizzes.length === 0 && attachments.length === 0 ? (
               <div className="flex items-center justify-center h-full min-h-[60vh]">
                 <div className="text-center space-y-3 sm:space-y-4 px-4">
                   <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 rounded-full mx-auto" />
                   <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2">{t('courseProgress.noContentAvailable')}</h2>
                   <p className="text-muted-foreground text-xs sm:text-sm md:text-base">{t('courseProgress.noContentDescription')}</p>
                 </div>
               </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[60vh]">
                <div className="text-center space-y-3 sm:space-y-4 px-4">
                  <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 rounded-full mx-auto" />
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2">{t('courseProgress.loadingContent')}</h2>
                  <p className="text-muted-foreground text-xs sm:text-sm md:text-base">{t('courseProgress.loadingContentDescription')}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Sidebar - Hidden on mobile, collapsible on desktop */}
          <div className={`transition-all duration-300 ease-in-out border-l bg-card shadow-lg relative ${
            // Mobile: shown when sidebarOpen is true - full width
            // Desktop: collapsible with sidebarCollapsed state
            sidebarOpen ? 'w-full sm:w-80' : sidebarCollapsed ? 'w-16' : 'w-80'
          } ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            {/* Desktop Collapse/Expand Button - Only visible on large screens */}
            <div className="hidden lg:block">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="absolute -left-4 top-8 z-50 h-8 w-8 rounded-full bg-background border border-border shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {sidebarCollapsed ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Mobile Close Button - Only visible on small screens */}
            <div className="lg:hidden absolute -left-4 top-8 z-50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="h-8 w-8 rounded-full bg-background border border-border shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* Sidebar Content */}
            {(sidebarOpen || (!sidebarCollapsed && !sidebarOpen)) && (
              <CourseSidebar
                course={course}
                currentLesson={currentLesson}
                onLessonSelect={handleLessonSelect}
                lessons={lessons}
                quizzes={quizzes}
                attachments={attachments}
                quizAttempts={quizAttempts}
                onQuizSelect={handleQuizSelect}
                onAttachmentSelect={handleAttachmentSelect}
                currentQuiz={currentQuiz}
                currentAttachment={currentAttachment}
              />
            )}
            
            {/* Desktop Collapsed State */}
            {!sidebarOpen && sidebarCollapsed && (
              <div className="hidden lg:flex p-4 flex-col items-center gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-sm">C</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                  <span className="writing-mode-vertical transform rotate-180">{t('courseProgress.courseProgress')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
