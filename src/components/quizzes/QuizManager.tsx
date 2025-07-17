import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { QuizCreator } from './QuizCreator';
import { QuizEditor } from './QuizEditor';
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
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<string | null>(editingQuizId || null);

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
    } catch (error: any) {
      console.error('Error fetching quizzes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quizzes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (quizId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

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

      fetchQuizzes();
    } catch (error: any) {
      console.error('Error deleting quiz:', error);
      toast({
        title: 'Error',
        description: error.message,
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
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
                  Quiz Management
                </h3>
                <p className="text-muted-foreground text-lg">Create and manage your course assessments</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreator(true)}
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 text-black font-semibold px-8 py-3 rounded-2xl shadow-lg shadow-emerald-500/25 border border-emerald-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Quiz
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
        <div className="grid gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="card border border-border bg-card group">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300">
                        <Brain className="h-5 w-5 text-black" />
                      </div>
                      <CardTitle className="text-xl text-emerald-300 group-hover:text-emerald-400 transition-colors duration-300">
                        {quiz.title}
                      </CardTitle>
                    </div>
                    {quiz.description && (
                      <p className="text-sm text-muted-foreground ml-13 leading-relaxed">
                        {quiz.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingQuiz(quiz.id)}
                      className="bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-emerald-300 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20"
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
                <div className="flex gap-3 flex-wrap">
                  <Badge 
                    className={
                      quiz.type === 'quiz' 
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30 transition-colors duration-300" 
                        : "bg-teal-500/20 text-teal-300 border-teal-500/40 hover:bg-teal-500/30 transition-colors duration-300"
                    }
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    {quiz.type}
                  </Badge>
                  {quiz.time_limit && (
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30 transition-colors duration-300">
                      <Clock className="h-3 w-3 mr-1" />
                      {quiz.time_limit} min
                    </Badge>
                  )}
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30 transition-colors duration-300">
                    <Target className="h-3 w-3 mr-1" />
                    Max attempts: {quiz.max_attempts}
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
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                <Brain className="h-10 w-10 text-emerald-400" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  No quizzes yet
                </h3>
                <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                  Create your first quiz to assess student learning and track their progress
                </p>
              </div>
              <Button 
                onClick={() => setShowCreator(true)}
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 text-black font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-emerald-500/25 border border-emerald-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create First Quiz
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
