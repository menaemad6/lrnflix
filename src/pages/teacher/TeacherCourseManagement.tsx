import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TeacherCourseSidebar } from '@/components/courses/TeacherCourseSidebar';
import { LessonManager } from '@/components/lessons/LessonManager';
import { QuizManager } from '@/components/quizzes/QuizManager';
import { LessonEditor } from '@/components/lessons/LessonEditor';
import { QuizEditor } from '@/components/quizzes/QuizEditor';
import { Card, CardContent } from '@/components/ui/card';
import { GoogleMeetIntegration } from '@/components/lectures/GoogleMeetIntegration';
import { CreateLectureModal } from '@/components/lectures/CreateLectureModal';

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

type ViewMode = 'overview' | 'lessons' | 'quizzes' | 'edit-lesson' | 'edit-quiz' | 'live-lectures';

export const TeacherCourseManagement = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { t } = useTranslation('teacher');
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentItem, setCurrentItem] = useState<{ type: 'lesson' | 'quiz' | null; id: string | null }>({ type: null, id: null });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
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
    } catch (error: any) {
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
    console.log('Item selected:', type, id);
    setCurrentItem({ type, id });
    // Automatically switch to edit mode when an item is selected
    if (type === 'lesson') {
      setViewMode('edit-lesson');
    } else if (type === 'quiz') {
      setViewMode('edit-quiz');
    }
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
    } catch (error: any) {
      console.error('Error deleting lesson:', error);
      toast({
        title: 'Error',
        description: error.message,
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
    } catch (error: any) {
      console.error('Error deleting quiz:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleBackToOverview = () => {
    setViewMode('overview');
    setCurrentItem({ type: null, id: null });
  };

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    console.log('Current view mode:', viewMode);
    console.log('Current item:', currentItem);

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
      case 'live-lectures':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Live Lectures</h2>
              <CreateLectureModal 
                courseId={id!} 
                onLectureCreated={fetchCourseData}
              />
            </div>
            <GoogleMeetIntegration courseId={id!} />
          </div>
        );
      case 'edit-lesson':
        return currentItem.id && currentItem.type === 'lesson' ? (
          <LessonEditor
            lessonId={currentItem.id}
            onBack={handleBackToOverview}
          />
        ) : (
          <div className="text-center p-8">
            <p className="text-muted-foreground">No lesson selected</p>
          </div>
        );
      case 'edit-quiz':
        return currentItem.id && currentItem.type === 'quiz' ? (
          <QuizEditor
            courseId={id!}
            quizId={currentItem.id}
            onBack={handleBackToOverview}
          />
        ) : (
          <div className="text-center p-8">
            <p className="text-muted-foreground">No quiz selected</p>
          </div>
        );
      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-semibold mb-4">Course Management</h2>
              <p className="text-muted-foreground mb-6">
                Welcome to your course management dashboard. Use the sidebar to manage your lessons, quizzes, and live lectures.
              </p>
              <div className="text-sm text-muted-foreground">
                <p>Total Lessons: {lessons.length}</p>
                <p>Total Quizzes: {quizzes.length}</p>
              </div>
            </CardContent>
          </Card>
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
    <div className="min-h-screen flex bg-background">
      <TeacherCourseSidebar
        course={course}
        lessons={lessons}
        quizzes={quizzes}
        currentItem={currentItem}
        onItemSelect={handleItemSelect}
        onDeleteLesson={handleDeleteLesson}
        onDeleteQuiz={handleDeleteQuiz}
        onContentUpdate={fetchCourseData}
        onViewModeChange={setViewMode}
        viewMode={viewMode}
      />
      
      <div className="flex-1 p-6">
        {renderMainContent()}
      </div>
    </div>
  );
};
