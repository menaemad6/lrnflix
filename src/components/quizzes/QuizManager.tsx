import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { QuizCreator } from './QuizCreator';
import { QuizEditor } from './QuizEditor';
import { ContentManagementSkeleton } from '@/components/ui/skeletons';
import { ArrowLeft, Plus, Edit, Trash2, Clock, Users, FileText, Brain, Target, Zap } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  type: string;
  time_limit: number | null;
  max_attempts: number | null;
  created_at: string;
}

interface QuizManagerProps {
  courseId: string;
  onBack?: () => void;
  editingQuizId?: string | null;
}

export const QuizManager = ({ courseId, onBack, editingQuizId }: QuizManagerProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id: courseIdFromParams } = useParams<{ id: string }>();
  const actualCourseId = courseId || courseIdFromParams;
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<string | null>(editingQuizId || null);
  const { t } = useTranslation('dashboard');

  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

  useEffect(() => {
    if (editingQuizId) {
      setEditingQuiz(editingQuizId);
    }
  }, [editingQuizId]);

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
      toast({
        title: t('error'),
        description: t('quizManager.failedToLoadQuizzes'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (quizId: string, title: string) => {
    if (!confirm(t('quizManager.deleteConfirmation', { title }))) return;

    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('quizManager.quizDeleted'),
      });

      fetchQuizzes();
    } catch (error: unknown) {
      console.error('Error deleting quiz:', error);
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('quizManager.failedToDeleteQuiz'),
        variant: 'destructive',
      });
    }
  };

  const handleQuizCreated = () => {
    setShowCreator(false);
    fetchQuizzes();
  };

  const handleQuizUpdated = () => {
    setEditingQuiz(null);
    fetchQuizzes();
  };

  if (loading) {
    return <ContentManagementSkeleton />;
  }

  if (editingQuiz) {
    return (
      <QuizEditor 
        courseId={courseId} 
        quizId={editingQuiz}
        onQuizUpdated={handleQuizUpdated}
        onBack={() => {
          setEditingQuiz(null);
          if (onBack) onBack();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="space-y-6 sm:space-y-8 relative z-10 p-4 sm:p-8">
        {/* Header */}
        <div className="card p-4 sm:p-8 border border-border bg-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-6">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/teacher/courses/${actualCourseId}/manage`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                                 {t('quizManager.back')}
              </Button>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
                                     {t('quizManager.quizManagement')}
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
                                     {t('quizManager.createAndManageQuizzes')}
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreator(true)}
              variant='default'
            >
              <Plus className="h-5 w-5 mr-2" />
                             {t('quizManager.createQuiz')}
            </Button>
          </div>
        </div>

        {showCreator && (
          <div className="card border border-border bg-card">
            <QuizCreator 
              courseId={courseId} 
              onQuizCreated={handleQuizCreated}
              onCancel={() => setShowCreator(false)}
            />
          </div>
        )}

        {/* Quizzes Grid */}
        <div className="grid gap-4 sm:gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="card border border-border bg-card group">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300">
                        <Brain className="h-5 w-5 text-black" />
                      </div>
                      <CardTitle className="text-xl text-primary-300 group-hover:text-primary-400 transition-colors duration-300">
                        {quiz.title}
                      </CardTitle>
                    </div>
                    {quiz.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed sm:ml-13">
                        {quiz.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/teacher/courses/${actualCourseId}/manage/quizzes/${quiz.id}`)}
                      className="bg-primary-500/10 border-primary-500/30 hover:bg-primary-500/20 hover:border-primary-500/50 text-primary-300 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteQuiz(quiz.id, quiz.title)}
                      className="bg-red-500/10 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 text-red-300 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 sm:gap-3 flex-wrap">
                  <Badge 
                    className={
                      quiz.type === 'quiz' 
                        ? "bg-primary-500/20 text-primary-300 border-primary-500/40 hover:bg-primary-500/30 transition-colors duration-300" 
                        : "bg-secondary-500/20 text-secondary-300 border-secondary-500/40 hover:bg-secondary-500/30 transition-colors duration-300"
                    }
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    {quiz.type}
                  </Badge>
                  {quiz.time_limit && (
                    <Badge className="bg-accent-500/20 text-accent-300 border-accent-500/40 hover:bg-accent-500/30 transition-colors duration-300">
                      <Clock className="h-3 w-3 mr-1" />
                      {quiz.time_limit} {t('minutes')}
                    </Badge>
                  )}
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30 transition-colors duration-300">
                    <Target className="h-3 w-3 mr-1" />
                                           {t('quizManager.maxAttempts', { count: quiz.max_attempts })}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {quizzes.length === 0 && (
          <Card className="card border border-border bg-card">
            <CardContent className="text-center py-16 space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center mx-auto border border-primary-500/30">
                <Brain className="h-10 w-10 text-primary-400" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                                     {t('quizManager.noQuizzesYet')}
                </h3>
                <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                                     {t('quizManager.noQuizzesDescription')}
                </p>
              </div>
              <Button 
                onClick={() => setShowCreator(true)}
                className="bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-600 hover:from-primary-600 hover:via-secondary-600 hover:to-primary-700 text-black font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-primary-500/25 border border-primary-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/30"
              >
                <Plus className="h-5 w-5 mr-2" />
                                 {t('quizManager.createFirstQuiz')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
