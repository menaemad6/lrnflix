import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenantItemValidation } from '@/hooks/useTenantItemValidation';
import { CourseSidebar } from '@/components/courses/CourseSidebar';
import { LessonContent } from '@/components/lessons/LessonContent';
import { StudentQuizTaker } from '@/components/quizzes/StudentQuizTaker';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

export const CourseProgress = () => {
  const { id, lessonId, quizId, attemptId } = useParams<{ id: string; lessonId?: string; quizId?: string; attemptId?: string }>();
  const { toast } = useToast();
  const { validateAndHandle, validateWithCreatorId } = useTenantItemValidation({
    redirectTo: '/student/courses',
  });
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<string[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    if (lessons.length > 0 || quizzes.length > 0) {
      if (lessonId) {
        const lesson = lessons.find(l => l.id === lessonId);
        if (lesson) {
          setCurrentLesson(lesson);
          setCurrentQuiz(null);
        }
      } else if (quizId) {
        const quiz = quizzes.find(q => q.id === quizId);
        if (quiz) {
          setCurrentQuiz(quiz);
          setCurrentLesson(null);
        }
      } else {
        // Auto-select the first available content (lesson or quiz) when no specific content is selected
        const firstLesson = lessons.sort((a, b) => a.order_index - b.order_index)[0];
        const firstQuiz = quizzes.sort((a, b) => a.order_index - b.order_index)[0];
        
        if (firstLesson && firstQuiz) {
          // If both exist, select the one with lower order_index
          if (firstLesson.order_index <= firstQuiz.order_index) {
            setCurrentLesson(firstLesson);
            setCurrentQuiz(null);
          } else {
            setCurrentQuiz(firstQuiz);
            setCurrentLesson(null);
          }
        } else if (firstLesson) {
          setCurrentLesson(firstLesson);
          setCurrentQuiz(null);
        } else if (firstQuiz) {
          setCurrentQuiz(firstQuiz);
          setCurrentLesson(null);
        }
      }
    }
  }, [lessons, quizzes, lessonId, quizId]);

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
          toast({
            title: t('courseProgress.accessDenied'),
            description: t('courseProgress.accessDeniedDescription'),
            variant: 'destructive',
          });
          return;
        }

        // Fetch progress if enrolled
        const { data: progressData } = await supabase
          .from('lesson_progress')
          .select('lesson_id')
          .eq('student_id', user.id);

        setProgress(progressData?.map(p => p.lesson_id) || []);

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

  const handleQuizSelect = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setCurrentLesson(null);
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setCurrentQuiz(null);
    navigate(`/courses/${id}/progress/lesson/${lesson.id}`);
  };

  const handleBackToCourse = () => {
    navigate(`/courses/${id}/progress`);
  };

  if (loading) {
    return <CourseProgressSkeleton />;
  }

  if (!course || !isEnrolled) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{t('courseProgress.accessDenied')}</h2>
          <p className="text-muted-foreground">{t('courseProgress.accessDeniedDescription')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        contentTitle={course?.title || 'Course Progress'}
        contentDescription={`Track your progress in ${course?.title || 'this course'} and continue your learning journey.`}
      />
      <div className={bgClass + " min-h-screen"}>
        <div className="min-h-screen bg-background flex pt-20">
        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {currentQuiz ? (
            <StudentQuizTaker
              quiz={currentQuiz}
              courseId={id!}
              onBackToCourse={handleBackToCourse}
              attemptId={attemptId}
            />
          ) : currentLesson ? (
                         <LessonContent
               lesson={currentLesson}
               course={course}
               isCompleted={progress.includes(currentLesson.id)}
               onLessonComplete={handleLessonComplete}
               onBackToCourse={handleBackToCourse}
             />
                     ) : lessons.length === 0 && quizzes.length === 0 ? (
             <div className="flex items-center justify-center h-full">
               <div className="text-center space-y-4">
                 <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                                   <h2 className="text-xl font-semibold mb-2">{t('courseProgress.noContentAvailable')}</h2>
                  <p className="text-muted-foreground">{t('courseProgress.noContentDescription')}</p>
               </div>
             </div>
                     ) : (
             <div className="flex items-center justify-center h-full">
               <div className="text-center space-y-4">
                 <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                                   <h2 className="text-xl font-semibold mb-2">{t('courseProgress.loadingContent')}</h2>
                  <p className="text-muted-foreground">{t('courseProgress.loadingContentDescription')}</p>
               </div>
             </div>
           )}
        </div>
        
        {/* Right Sidebar */}
        <div className={`transition-all duration-300 ease-in-out border-l bg-card/50 backdrop-blur-sm relative ${
          sidebarCollapsed ? 'w-16' : 'w-80'
        }`}>
          {/* Collapse/Expand Button */}
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

          {!sidebarCollapsed ? (
            <CourseSidebar
              course={course}
              currentLesson={currentLesson}
              onLessonSelect={handleLessonSelect}
              lessons={lessons}
              quizzes={quizzes}
              quizAttempts={quizAttempts}
              onQuizSelect={handleQuizSelect}
              currentQuiz={currentQuiz}
            />
          ) : (
            <div className="p-4 flex flex-col items-center gap-4">
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
