import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CreateLessonModal } from './CreateLessonModal';
import { LessonEditor } from './LessonEditor';
import { ContentManagementSkeleton } from '@/components/ui/skeletons';
import { ArrowLeft, Plus, Edit, Trash2, Video, Eye, Clock, Sparkles, Play, Zap } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  device_limit: number | null;
  view_limit: number | null;
  order_index: number;
  created_at: string;
}

interface LessonManagerProps {
  courseId: string;
  onBack?: () => void;
}

export const LessonManager = ({ courseId, onBack }: LessonManagerProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id: courseIdFromParams } = useParams<{ id: string }>();
  const actualCourseId = courseId || courseIdFromParams;
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const { t } = useTranslation('dashboard');

  useEffect(() => {
    fetchLessons();
  }, [courseId]);

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (error) throw error;
      setLessons(data || []);
    } catch (error: any) {
      console.error('Error fetching lessons:', error);
      toast({
        title: t('error'),
        description: t('lessonManager.failedToLoadLessons'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteLesson = async (lessonId: string, title: string) => {
    if (!confirm(t('lessonManager.deleteConfirmation', { title }))) return;

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('lessonManager.lessonDeleted'),
      });

      fetchLessons();
    } catch (error: any) {
      console.error('Error deleting lesson:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleLessonCreated = () => {
    setShowCreator(false);
    fetchLessons();
  };

  const handleLessonUpdated = () => {
    setEditingLesson(null);
    fetchLessons();
  };

  if (loading) {
    return <ContentManagementSkeleton />;
  }

  if (editingLesson) {
    return (
      <LessonEditor 
        lessonId={editingLesson}
        onBack={() => setEditingLesson(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 relative z-10 p-3 sm:p-4 lg:p-8">
        {/* Header */}
        <div className="card p-3 sm:p-4 lg:p-8 border border-border bg-card">
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-6">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/teacher/courses/${actualCourseId}/manage`)}
                size="sm"
                className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t('lessonManager.back')}</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-primary">
                  {t('lessonManager.lessonManagement')}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm lg:text-base xl:text-lg">{t('lessonManager.createAndManageLessons')}</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreator(true)}
              variant="default"
              size="sm"
              className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t('lessonManager.createLesson')}</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </div>
        </div>

        {showCreator && (
          <div className="card border border-border bg-card">
            <CreateLessonModal 
              open={showCreator}
              onOpenChange={setShowCreator}
              courseId={courseId} 
              onLessonCreated={handleLessonCreated}
            />
          </div>
        )}

        {/* Lessons Grid */}
        <div className="grid gap-3 sm:gap-4 lg:gap-6">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="card border border-border bg-card group">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2 sm:space-y-3 flex-1">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300">
                        <Video className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                      </div>
                      <CardTitle className="text-base sm:text-lg lg:text-xl text-primary-300 group-hover:text-primary-400 transition-colors duration-300">
                        {lesson.title}
                      </CardTitle>
                    </div>
                    {lesson.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed sm:ml-13">
                        {lesson.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 sm:gap-2 lg:gap-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/teacher/courses/${actualCourseId}/manage/lessons/${lesson.id}`)}
                      className="bg-primary-500/10 border-primary-500/30 hover:bg-primary-500/20 hover:border-primary-500/50 text-primary-300 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20"
                    >
                      {t('lessonManager.edit')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteLesson(lesson.id, lesson.title)}
                      className="bg-red-500/10 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 text-red-300 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
                    >
                      {t('lessonManager.delete')}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 sm:gap-2 lg:gap-3 flex-wrap">
                  {lesson.video_url && (
                    <Badge className="bg-primary-500/20 text-primary-300 border-primary-500/40 hover:bg-primary-500/30 transition-colors duration-300 text-xs sm:text-sm px-2 sm:px-3 py-1">
                      <Video className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">{t('lessonManager.video')}</span>
                      <span className="sm:hidden">Video</span>
                    </Badge>
                  )}
                  {lesson.view_limit && (
                    <Badge className="bg-secondary-500/20 text-secondary-300 border-secondary-500/40 hover:bg-secondary-500/30 transition-colors duration-300 text-xs sm:text-sm px-2 sm:px-3 py-1">
                      <Eye className="h-3 w-3 mr-1" />
                      {t('lessonManager.views', { count: lesson.view_limit })}
                    </Badge>
                  )}
                  <Badge className="bg-accent-500/20 text-accent-300 border-accent-500/40 hover:bg-accent-500/30 transition-colors duration-300 text-xs sm:text-sm px-2 sm:px-3 py-1">
                    <Zap className="h-3 w-3 mr-1" />
                    {t('lessonManager.order', { index: lesson.order_index })}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {lessons.length === 0 && (
          <Card className="card border border-border bg-card">
            <CardContent className="text-center py-8 sm:py-12 lg:py-16 space-y-4 sm:space-y-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center mx-auto border border-primary-500/30">
                <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-primary-400" />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                  {t('lessonManager.noLessonsYet')}
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-md mx-auto leading-relaxed">
                  {t('lessonManager.noLessonsDescription')}
                </p>
              </div>
              <Button 
                onClick={() => setShowCreator(true)}
                className="bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-600 hover:from-primary-600 hover:via-secondary-600 hover:to-primary-700 text-black font-semibold px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-xl sm:rounded-2xl shadow-lg shadow-primary-500/25 border border-primary-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/30 text-sm sm:text-base"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t('lessonManager.createFirstLesson')}</span>
                <span className="sm:hidden">Create Lesson</span>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
