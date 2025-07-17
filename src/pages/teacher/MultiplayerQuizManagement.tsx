
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, ArrowLeft, Brain, Zap, Target, Clock } from 'lucide-react';

interface Question {
  id?: string;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  time_limit: number;
}

export const MultiplayerQuizManagement = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('multiplayer_quiz_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedQuestions: Question[] = data?.map(q => ({
        id: q.id,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
        correct_answer: q.correct_answer,
        difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
        time_limit: q.time_limit
      })) || [];

      setQuestions(formattedQuestions);
    } catch (error: any) {
      console.error('Error fetching questions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load questions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveQuestion = async (question: Question) => {
    setSaving(true);
    try {
      const questionData = {
        question: question.question,
        options: JSON.stringify(question.options),
        correct_answer: question.correct_answer,
        difficulty: question.difficulty,
        time_limit: question.time_limit
      };

      if (question.id) {
        const { error } = await supabase
          .from('multiplayer_quiz_questions')
          .update(questionData)
          .eq('id', question.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('multiplayer_quiz_questions')
          .insert(questionData);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `Question ${question.id ? 'updated' : 'created'} successfully!`,
      });

      setEditingQuestion(null);
      fetchQuestions();
    } catch (error: any) {
      console.error('Error saving question:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const { error } = await supabase
        .from('multiplayer_quiz_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Question deleted successfully',
      });

      fetchQuestions();
    } catch (error: any) {
      console.error('Error deleting question:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const startNewQuestion = () => {
    setEditingQuestion({
      question: '',
      options: ['', '', '', ''],
      correct_answer: '',
      difficulty: 'medium',
      time_limit: 15
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="space-y-8 relative z-10 p-8">
        {/* Header */}
        <div className="card p-8 border border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Multiplayer Quiz Management
              </h3>
              <p className="text-muted-foreground text-lg">Create and manage multiplayer quiz questions</p>
            </div>
            <Button 
              onClick={startNewQuestion}
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 text-black font-semibold px-8 py-3 rounded-2xl shadow-lg shadow-emerald-500/25 border border-emerald-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Question
            </Button>
          </div>
        </div>

        {/* Question Editor */}
        {editingQuestion && (
          <Card className="card border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-xl text-emerald-300">
                {editingQuestion.id ? 'Edit Question' : 'Create New Question'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Question Text</label>
                <Textarea
                  placeholder="Enter your question..."
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({
                    ...editingQuestion,
                    question: e.target.value
                  })}
                  className="bg-background/50 border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Answer Options</label>
                <div className="grid grid-cols-2 gap-4">
                  {editingQuestion.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...editingQuestion.options];
                          newOptions[index] = e.target.value;
                          setEditingQuestion({
                            ...editingQuestion,
                            options: newOptions
                          });
                        }}
                        className="bg-background/50 border-border"
                      />
                      <Button
                        type="button"
                        variant={editingQuestion.correct_answer === option ? "default" : "outline"}
                        onClick={() => setEditingQuestion({
                          ...editingQuestion,
                          correct_answer: option
                        })}
                        className={editingQuestion.correct_answer === option 
                          ? "bg-emerald-500 text-black hover:bg-emerald-600" 
                          : "border-border hover:bg-muted"
                        }
                      >
                        Correct
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Difficulty</label>
                  <Select
                    value={editingQuestion.difficulty}
                    onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                      setEditingQuestion({
                        ...editingQuestion,
                        difficulty: value
                      })
                    }
                  >
                    <SelectTrigger className="bg-background/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Time Limit (seconds)</label>
                  <Input
                    type="number"
                    value={editingQuestion.time_limit}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      time_limit: parseInt(e.target.value)
                    })}
                    className="bg-background/50 border-border"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => saveQuestion(editingQuestion)}
                  disabled={saving || !editingQuestion.question.trim() || !editingQuestion.correct_answer}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-black"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Question'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingQuestion(null)}
                  className="border-border hover:bg-muted"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions List */}
        <div className="grid gap-6">
          {questions.map((question) => (
            <Card key={question.id} className="card border border-border bg-card group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300">
                        <Brain className="h-5 w-5 text-black" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-emerald-300 group-hover:text-emerald-400 transition-colors duration-300">
                          {question.question}
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingQuestion(question)}
                      className="bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-emerald-300 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => question.id && deleteQuestion(question.id)}
                      className="bg-red-500/10 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 text-red-300 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {question.options.map((option, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-xl border transition-all duration-300 ${
                          option === question.correct_answer 
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                            : 'bg-muted/30 border-border text-muted-foreground'
                        }`}
                      >
                        <span className="text-sm font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                        {option === question.correct_answer && (
                          <Badge className="ml-2 bg-emerald-500/30 text-emerald-300 border-emerald-500/50">
                            Correct
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-3 flex-wrap">
                    <Badge 
                      className={
                        question.difficulty === 'easy' 
                          ? "bg-green-500/20 text-green-300 border-green-500/40" 
                          : question.difficulty === 'medium'
                          ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
                          : "bg-red-500/20 text-red-300 border-red-500/40"
                      }
                    >
                      <Target className="h-3 w-3 mr-1" />
                      {question.difficulty}
                    </Badge>
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40">
                      <Clock className="h-3 w-3 mr-1" />
                      {question.time_limit}s
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {questions.length === 0 && (
          <Card className="card border border-border bg-card">
            <CardContent className="text-center py-16 space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                <Brain className="h-10 w-10 text-emerald-400" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  No questions yet
                </h3>
                <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                  Create your first multiplayer quiz question to get started
                </p>
              </div>
              <Button 
                onClick={startNewQuestion}
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 text-black font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-emerald-500/25 border border-emerald-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create First Question
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
