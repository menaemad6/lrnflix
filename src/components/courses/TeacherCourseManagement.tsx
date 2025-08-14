import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TeacherCourseSidebar } from './TeacherCourseSidebar';
import { LessonManager } from '@/components/lessons/LessonManager';
import { QuizManager } from '@/components/quizzes/QuizManager';
import { Card, CardContent } from '@/components/ui/card';
import { QuizEditor } from '@/components/quizzes/QuizEditor';
import { LessonEditor } from '@/components/lessons/LessonEditor';
import { TeacherCourseOverview } from './TeacherCourseOverview';
import { GoogleMeetIntegration } from '../lectures/GoogleMeetIntegration';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  order_index: number;
  created_at: string;
  course_id: string;
  view_limit: number | null;
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

type ViewMode = 'overview' | 'lessons' | 'quizzes' | 'edit-lesson' | 'edit-quiz'| 'live-lectures';

export const TeacherCourseManagement = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentItem, setCurrentItem] = useState<{ type: 'lesson' | 'quiz' | null; id: string | null }>({ type: null, id: null });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCourseData = async () => {
    try {
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) throw courseError;
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
    } catch (error: unknown) {
      console.error('Error fetching course data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (type: 'lesson' | 'quiz', id: string) => {
    setCurrentItem({ type, id });
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Lesson deleted successfully',
      });

      fetchCourseData();
    } catch (error: unknown) {
      console.error('Error deleting lesson:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete lesson',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Quiz deleted successfully',
      });

      fetchCourseData();
    } catch (error: unknown) {
      console.error('Error deleting quiz:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete quiz',
        variant: 'destructive',
      });
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const renderMainContent = (itemId? : string) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
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
          // onQuizUpdated={handleQuizUpdated}
          // onQuizUpdated={() => console.log('quiz updated')}
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
            onViewModeChange={(mode) => setViewMode(mode)}
            onItemSelect={(type, id) => {
              setCurrentItem({ type, id });
              setViewMode(type === 'lesson' ? 'edit-lesson' : 'edit-quiz');
            }}
          />
        );
    }
  };

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 flex lg:flex-row">
      {/* Static sidebar on large screens */}
      <div className="hidden lg:flex w-80 shrink-0 border-r h-[calc(100vh-5rem)] bg-card/30 sticky top-20 self-start">
        <TeacherCourseSidebar
          course={course}
          lessons={lessons}
          quizzes={quizzes}
          currentItem={currentItem}
          onItemSelect={(type, id) => {
            handleItemSelect(type, id);
          }}
          onDeleteLesson={handleDeleteLesson}
          onDeleteQuiz={handleDeleteQuiz}
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
        className="lg:hidden fixed bottom-4 left-4 z-[60] rounded-full w-12 h-12 p-0 shadow-lg shadow-emerald-500/25 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
        aria-label="Open course management sidebar"
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
            currentItem={currentItem}
            onItemSelect={(type, id) => {
              handleItemSelect(type, id);
              setMobileSidebarOpen(false);
            }}
            onDeleteLesson={handleDeleteLesson}
            onDeleteQuiz={handleDeleteQuiz}
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
  );
};
