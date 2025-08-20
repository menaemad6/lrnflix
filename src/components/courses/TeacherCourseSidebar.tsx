import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DraggableCourseContent } from './DraggableCourseContent';
import { CreateLessonModal } from '@/components/lessons/CreateLessonModal';
import { CreateQuizModal } from '@/components/quizzes/CreateQuizModal';
import { BookOpen, FileQuestion, Plus, Users, Clock, Video, GraduationCap, Settings, ArrowLeft } from 'lucide-react';

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

interface CourseItem {
  id: string;
  type: 'lesson' | 'quiz';
  order_index: number;
}

type ViewMode = 'overview' | 'lessons' | 'quizzes' | 'edit-lesson' | 'edit-quiz' | 'live-lectures';

interface TeacherCourseSidebarProps {
  course: Course;
  lessons: Lesson[];
  quizzes: Quiz[];
  currentItem: { type: 'lesson' | 'quiz' | null; id: string | null };
  onItemSelect: (type: 'lesson' | 'quiz', id: string) => void;
  onDeleteLesson: (lessonId: string) => void;
  onDeleteQuiz: (quizId: string) => void;
  onContentUpdate: () => void;
  viewMode: ViewMode;
}

export const TeacherCourseSidebar: React.FC<TeacherCourseSidebarProps> = ({
  course,
  lessons,
  quizzes,
  currentItem,
  onItemSelect,
  onDeleteLesson,
  onDeleteQuiz,
  onContentUpdate,
  onViewModeChange,
  viewMode
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  const handleContentReorder = async (items: CourseItem[]) => {
    try {
      console.log('Reordering items:', items);
      
      // Update lessons
      const lessonItems = items.filter(item => item.type === 'lesson');
      if (lessonItems.length > 0) {
        for (const item of lessonItems) {
          const { error } = await supabase
            .from('lessons')
            .update({ order_index: item.order_index })
            .eq('id', item.id);
          
          if (error) {
            console.error('Error updating lesson order:', error);
            throw error;
          }
        }
      }

      // Update quizzes
      const quizItems = items.filter(item => item.type === 'quiz');
      if (quizItems.length > 0) {
        for (const item of quizItems) {
          const { error } = await supabase
            .from('quizzes')
            .update({ order_index: item.order_index })
            .eq('id', item.id);
          
          if (error) {
            console.error('Error updating quiz order:', error);
            throw error;
          }
        }
      }

      toast({
        title: 'Success',
        description: 'Content reordered successfully!',
      });
    } catch (error: unknown) {
      console.error('Error reordering content:', error);
      const message = error instanceof Error ? error.message : 'Failed to reorder content';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      onContentUpdate(); // Refresh to revert changes
    }
  };

  const handleItemClick = (type: 'lesson' | 'quiz', id: string) => {
    console.log('Sidebar item clicked:', type, id);
    onItemSelect(type, id);
    onViewModeChange(type === 'lesson' ? 'edit-lesson' : 'edit-quiz');
    // Navigate to the edit page for the selected item
    navigate(`/teacher/courses/${course.id}/manage/${type === 'lesson' ? 'lessons' : 'quizzes'}/${id}`);
  };

  const totalContent = lessons.length + quizzes.length;

  return (
    <div className="h-full flex flex-col bg-card/30 backdrop-blur-sm w-full">
      <div className="p-4 sm:p-6 border-b">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-semibold gradient-text line-clamp-2">
                {course.title}
              </h2>
              {course.description && (
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  {course.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-3 text-xs sm:text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>Total {totalContent}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Video className="h-4 w-4" />
                  <span>{lessons.length} Lessons</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileQuestion className="h-4 w-4" />
                  <span>{quizzes.length} Quizzes</span>
                </div>
              </div>
            </div>
            <Link to={`/teacher/courses/${course.id}`} className="shrink-0">
              <Button variant="outline" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Management Buttons */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Management</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Button 
              onClick={() => navigate(`/teacher/courses/${course.id}/manage/lessons`)}
              variant={viewMode === 'lessons' ? 'default' : 'outline'}
              className="h-auto p-4 flex flex-col gap-2"
            >
              <GraduationCap className="h-5 w-5" />
              <span className="text-sm">Lessons</span>
              <Badge variant="outline" className="text-xs">
                {lessons.length}
              </Badge>
            </Button>
            <Button 
              onClick={() => navigate(`/teacher/courses/${course.id}/manage/quizzes`)}
              variant={viewMode === 'quizzes' ? 'default' : 'outline'}
              className="h-auto p-4 flex flex-col gap-2"
            >
              <FileQuestion className="h-5 w-5" />
              <span className="text-sm">Quizzes</span>
              <Badge variant="outline" className="text-xs">
                {quizzes.length}
              </Badge>
            </Button>
          </div>
          
          <Button 
            onClick={() => onViewModeChange('live-lectures')}
            variant={viewMode === 'live-lectures' ? 'default' : 'outline'}
            className="w-full h-auto p-4 flex flex-col gap-2"
          >
            <Video className="h-5 w-5" />
            <span className="text-sm">Live Lectures</span>
            <Badge variant="outline" className="text-xs">
              Google Meet
            </Badge>
          </Button>
        </div>

        {/* Course Content Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Course Content</h3>
            <Badge variant="outline">{totalContent}</Badge>
          </div>

          {totalContent > 0 ? (
            <DraggableCourseContent
              lessons={lessons}
              quizzes={quizzes}
              onReorder={handleContentReorder}
              onSelect={handleItemClick}
              selectedItemId={currentItem.id}
              selectedItemType={currentItem.type}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No content yet</p>
            </div>
          )}

          {/* Create Buttons */}
          <div className="space-y-3 pt-4 border-t">
            <Button 
              onClick={() => setShowLessonModal(true)}
              className="btn-primary w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Lesson
            </Button>
            <Button 
              onClick={() => setShowQuizModal(true)}
              variant="outline"
              className="glass-card border-orange-500/20 hover:border-orange-500/50 hover:bg-orange-500/10 w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateLessonModal
        open={showLessonModal}
        onOpenChange={setShowLessonModal}
        courseId={course.id}
        onLessonCreated={onContentUpdate}
      />
      
      <CreateQuizModal
        open={showQuizModal}
        onOpenChange={setShowQuizModal}
        courseId={course.id}
        onQuizCreated={onContentUpdate}
      />
    </div>
  );
};
