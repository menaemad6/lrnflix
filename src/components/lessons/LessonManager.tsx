import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CreateLessonModal } from './CreateLessonModal';
import { LessonEditor } from './LessonEditor';
import { ArrowLeft, Plus, Edit, Trash2, Video, Eye, Clock, Sparkles, Play, Zap } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
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
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);

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
        title: 'Error',
        description: 'Failed to load lessons',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteLesson = async (lessonId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
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
      <div className="space-y-8 relative z-10 p-8">
        {/* Header */}
        <div className="card p-8 border border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {onBack && (
                <Button 
                  variant="outline" 
                  onClick={onBack}
                  className="bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-emerald-300 backdrop-blur-sm transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              <div className="space-y-2">
                <h3 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Lesson Management
                </h3>
                <p className="text-muted-foreground text-lg">Create and manage your course lessons</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreator(true)}
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 text-black font-semibold px-8 py-3 rounded-2xl shadow-lg shadow-emerald-500/25 border border-emerald-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Lesson
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
        <div className="grid gap-6">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="card border border-border bg-card group">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300">
                        <Video className="h-5 w-5 text-black" />
                      </div>
                      <CardTitle className="text-xl text-emerald-300 group-hover:text-emerald-400 transition-colors duration-300">
                        {lesson.title}
                      </CardTitle>
                    </div>
                    {lesson.description && (
                      <p className="text-sm text-muted-foreground ml-13 leading-relaxed">
                        {lesson.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingLesson(lesson.id)}
                      className="bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-emerald-300 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteLesson(lesson.id, lesson.title)}
                      className="bg-red-500/10 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 text-red-300 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 flex-wrap">
                  {lesson.video_url && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30 transition-colors duration-300">
                      <Video className="h-3 w-3 mr-1" />
                      Video
                    </Badge>
                  )}
                  {lesson.view_limit && (
                    <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/40 hover:bg-teal-500/30 transition-colors duration-300">
                      <Eye className="h-3 w-3 mr-1" />
                      {lesson.view_limit} views
                    </Badge>
                  )}
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30 transition-colors duration-300">
                    <Zap className="h-3 w-3 mr-1" />
                    Order: {lesson.order_index}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {lessons.length === 0 && (
          <Card className="card border border-border bg-card">
            <CardContent className="text-center py-16 space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                <Sparkles className="h-10 w-10 text-emerald-400" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  No lessons yet
                </h3>
                <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                  Create your first lesson to start building your course and engaging your students
                </p>
              </div>
              <Button 
                onClick={() => setShowCreator(true)}
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 text-black font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-emerald-500/25 border border-emerald-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create First Lesson
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
