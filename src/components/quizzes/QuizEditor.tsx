import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, Save, Sparkles, Zap, FileJson, ArrowDown, ArrowUp } from 'lucide-react';
import { PdfQuestionExtractor } from './PdfQuestionExtractor';
import { answerSingleQuestion, answerAllQuestions } from '@/utils/geminiApi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Quiz {
  id: string;
  title: string;
  description: string;
  type: string;
  time_limit: number | null;
  max_attempts: number;
  shuffle_questions: boolean;
  show_results: boolean;
  show_correct_answers: boolean;
  allow_review: boolean;
  question_navigation: boolean;
}

interface Question {
  id?: string;
  question_text: string;
  question_type: 'mcq' | 'written';
  options?: string[];
  correct_answer?: string;
  points: number;
  order_index: number;
}

interface QuizEditorProps {
  courseId?: string;
  quizId: string;
  onQuizUpdated?: () => void;
  onBack?: () => void;
}

export const QuizEditor = ({ courseId, quizId, onQuizUpdated, onBack }: QuizEditorProps) => {
  const { toast } = useToast();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [answeringAll, setAnsweringAll] = useState(false);
  const [answeringQuestion, setAnsweringQuestion] = useState<number | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    type: 'quiz' as 'quiz' | 'assignment',
    time_limit: 60,
    max_attempts: 1,
    shuffle_questions: false,
    show_results: true,
    show_correct_answers: true,
    allow_review: true,
    question_navigation: true
  });

  const [attempts, setAttempts] = useState<any[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [attemptsSearch, setAttemptsSearch] = useState('');
  const [searchField, setSearchField] = useState<'name' | 'email' | 'score'>('name');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'not_submitted'>('all');
  const [scoreMin, setScoreMin] = useState('');
  const [scoreMax, setScoreMax] = useState('');
  const [sortField, setSortField] = useState<'name' | 'email' | 'score' | 'started_at' | 'submitted_at'>('submitted_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [openAnswersModal, setOpenAnswersModal] = useState(false);
  const [modalAnswers, setModalAnswers] = useState<any>(null);
  const [modalAttempt, setModalAttempt] = useState<any>(null);
  const [modalQuestions, setModalQuestions] = useState<any[]>([]);
  const [modalScore, setModalScore] = useState<number | null>(null);
  const [modalSort, setModalSort] = useState<'none' | 'correct' | 'incorrect'>('none');

  const isNewQuiz = quizId === 'new';

  useEffect(() => {
    if (courseId) {
      if (isNewQuiz) {
        setLoading(false);
      } else {
        fetchQuizData();
      }
    }
  }, [courseId, quizId]);

  useEffect(() => {
    const fetchAttempts = async () => {
      setAttemptsLoading(true);
      try {
        const { data: attemptsData, error: attemptsError } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('quiz_id', quizId)
          .order('submitted_at', { ascending: false });
        if (attemptsError) throw attemptsError;
        // Fetch student profiles
        const studentIds = Array.from(new Set((attemptsData || []).map(a => a.student_id)));
        let profilesMap: Record<string, { full_name: string; email: string }> = {};
        if (studentIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', studentIds);
          profilesMap = (profilesData || []).reduce((acc, p) => {
            acc[p.id] = { full_name: p.full_name, email: p.email };
            return acc;
          }, {} as Record<string, { full_name: string; email: string }>);
        }
        setAttempts((attemptsData || []).map(a => ({
          ...a,
          student_name: profilesMap[a.student_id]?.full_name || 'Unknown',
          student_email: profilesMap[a.student_id]?.email || '',
        })));
      } catch (error) {
        setAttempts([]);
      } finally {
        setAttemptsLoading(false);
      }
    };
    fetchAttempts();
  }, [quizId]);

  useEffect(() => {
    if (openAnswersModal && modalAttempt) {
      setModalScore(typeof modalAttempt.score === 'number' ? modalAttempt.score : null);
      // Fetch questions for this quiz
      (async () => {
        const { data: questionsData } = await supabase
          .from('quiz_questions')
          .select('id, question_text, correct_answer, question_type, points')
          .eq('quiz_id', quizId)
          .order('order_index');
        setModalQuestions(questionsData || []);
      })();
    } else if (!openAnswersModal) {
      setModalQuestions([]);
    }
  }, [openAnswersModal, modalAttempt, quizId]);

  const fetchQuizData = async () => {
    try {
      // Fetch quiz details
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizError) throw quizError;
      setQuiz(quizData);
      setQuizForm({
        title: quizData.title,
        description: quizData.description || '',
        type: quizData.type as 'quiz' | 'assignment',
        time_limit: quizData.time_limit || 60,
        max_attempts: quizData.max_attempts || 1,
        shuffle_questions: quizData.shuffle_questions || false,
        show_results: quizData.show_results !== false,
        show_correct_answers: quizData.show_correct_answers !== false,
        allow_review: quizData.allow_review !== false,
        question_navigation: quizData.question_navigation !== false
      });

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index');

      if (questionsError) throw questionsError;
      
      const transformedQuestions: Question[] = questionsData?.map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type as 'mcq' | 'written',
        options: q.options && typeof q.options === 'object' && 'options' in q.options 
          ? (q.options as { options: string[] }).options 
          : ['', '', '', ''],
        correct_answer: q.correct_answer || '',
        points: q.points || 1,
        order_index: q.order_index
      })) || [];

      setQuestions(transformedQuestions);
    } catch (error: any) {
      console.error('Error fetching quiz data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quiz data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJsonImport = () => {
    try {
      const parsedData = JSON.parse(jsonInput);
      if (!Array.isArray(parsedData)) {
        throw new Error('JSON must be an array of questions');
      }

      const newQuestions: Question[] = parsedData.map((item, index) => {
        if (!item.question || !item.correctAnswer) {
          throw new Error(`Question ${index + 1} is missing required fields`);
        }

        const choices = [
          item.choice_1,
          item.choice_2,
          item.choice_3,
          item.choice_4
        ].filter(Boolean);

        return {
          question_text: item.question,
          question_type: 'mcq' as const,
          options: choices.length > 0 ? choices : ['', '', '', ''],
          correct_answer: item.correctAnswer,
          points: item.points || 1,
          order_index: questions.length + index
        };
      });

      setQuestions([...questions, ...newQuestions]);
      setJsonInput('');
      toast({
        title: 'Success',
        description: `Imported ${newQuestions.length} questions from JSON`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleAnswerSingleQuestion = async (questionIndex: number) => {
    const question = questions[questionIndex];
    if (!question.question_text.trim()) {
      toast({
        title: 'Error',
        description: 'Please add question text first',
        variant: 'destructive',
      });
      return;
    }

    setAnsweringQuestion(questionIndex);
    try {
      const response = await answerSingleQuestion({
        question_text: question.question_text,
        options: question.options,
        question_type: question.question_type
      });

      updateQuestion(questionIndex, 'correct_answer', response.answer);
      
      toast({
        title: 'Success',
        description: 'Answer generated successfully!',
      });
    } catch (error: any) {
      console.error('Error answering question:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setAnsweringQuestion(null);
    }
  };

  const handleAnswerAllQuestions = async () => {
    const validQuestions = questions.filter(q => q.question_text.trim());
    if (validQuestions.length === 0) {
      toast({
        title: 'Error',
        description: 'No valid questions to answer',
        variant: 'destructive',
      });
      return;
    }

    setAnsweringAll(true);
    try {
      const questionData = questions.map(q => ({
        question_text: q.question_text,
        options: q.options,
        question_type: q.question_type
      }));

      const response = await answerAllQuestions(questionData);
      
      response.answers.forEach(answer => {
        if (answer.question_index < questions.length) {
          updateQuestion(answer.question_index, 'correct_answer', answer.answer);
        }
      });

      toast({
        title: 'Success',
        description: `Generated answers for ${response.answers.length} questions!`,
      });
    } catch (error: any) {
      console.error('Error answering all questions:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setAnsweringAll(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      question_text: '',
      question_type: 'mcq',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1,
      order_index: questions.length
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleExtractedQuestions = (extractedQuestions: any[]) => {
    const newQuestions: Question[] = extractedQuestions.map((q, index) => ({
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.question_type === 'mcq' ? (Array.isArray(q.options) && q.options.length > 0 ? q.options : ['', '', '', '']) : ['', '', '', ''],
      correct_answer: q.correct_answer || '',
      points: typeof q.points === 'number' ? q.points : 1,
      order_index: questions.length + index
    }));
    
    setQuestions([...questions, ...newQuestions]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    setQuestions(questions.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions(questions.map((q, i) => 
      i === questionIndex 
        ? { ...q, options: q.options?.map((opt, oi) => oi === optionIndex ? value : opt) }
        : q
    ));
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const saveQuiz = async () => {
    setSaving(true);
    try {
      let quizId_actual = quizId;

      if (isNewQuiz) {
        // Create new quiz
        const { data: newQuiz, error: quizError } = await supabase
          .from('quizzes')
          .insert({
            course_id: courseId,
            title: quizForm.title,
            description: quizForm.description,
            type: quizForm.type,
            time_limit: quizForm.time_limit,
            max_attempts: quizForm.max_attempts,
            shuffle_questions: quizForm.shuffle_questions,
            show_results: quizForm.show_results,
            show_correct_answers: quizForm.show_correct_answers,
            allow_review: quizForm.allow_review,
            question_navigation: quizForm.question_navigation
          })
          .select()
          .single();

        if (quizError) throw quizError;
        quizId_actual = newQuiz.id;
      } else {
        // Update existing quiz
        const { error: quizError } = await supabase
          .from('quizzes')
          .update({
            title: quizForm.title,
            description: quizForm.description,
            type: quizForm.type,
            time_limit: quizForm.time_limit,
            max_attempts: quizForm.max_attempts,
            shuffle_questions: quizForm.shuffle_questions,
            show_results: quizForm.show_results,
            show_correct_answers: quizForm.show_correct_answers,
            allow_review: quizForm.allow_review,
            question_navigation: quizForm.question_navigation
          })
          .eq('id', quizId);

        if (quizError) throw quizError;
      }

      // Delete existing questions if updating
      if (!isNewQuiz) {
        const { error: deleteError } = await supabase
          .from('quiz_questions')
          .delete()
          .eq('quiz_id', quizId);

        if (deleteError) throw deleteError;
      }

      // Insert questions
      if (questions.length > 0) {
        const questionsToInsert = questions.map((q, index) => ({
          quiz_id: quizId_actual,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.question_type === 'mcq' ? { options: q.options } : null,
          correct_answer: q.correct_answer,
          points: q.points,
          order_index: index
        }));

        const { error: questionsError } = await supabase
          .from('quiz_questions')
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;
      }

      toast({
        title: 'Success',
        description: `Quiz ${isNewQuiz ? 'created' : 'updated'} successfully!`,
      });

      if (onQuizUpdated) {
        onQuizUpdated();
      }
    } catch (error: any) {
      console.error('Error saving quiz:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getFilteredAttempts = () => {
    let filtered = attempts.filter(a => {
      const q = attemptsSearch.toLowerCase();
      if (q) {
        if (searchField === 'name' && !a.student_name?.toLowerCase().includes(q)) return false;
        if (searchField === 'email' && !a.student_email?.toLowerCase().includes(q)) return false;
        if (searchField === 'score' && !(typeof a.score === 'number' && a.score.toString().includes(q))) return false;
      }
      if (statusFilter === 'submitted' && !a.submitted_at) return false;
      if (statusFilter === 'not_submitted' && a.submitted_at) return false;
      if (scoreMin && (typeof a.score !== 'number' || a.score < Number(scoreMin))) return false;
      if (scoreMax && (typeof a.score !== 'number' || a.score > Number(scoreMax))) return false;
      return true;
    });
    filtered = filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortField) {
        case 'name':
          aVal = a.student_name?.toLowerCase() || '';
          bVal = b.student_name?.toLowerCase() || '';
          break;
        case 'email':
          aVal = a.student_email?.toLowerCase() || '';
          bVal = b.student_email?.toLowerCase() || '';
          break;
        case 'score':
          aVal = typeof a.score === 'number' ? a.score : -Infinity;
          bVal = typeof b.score === 'number' ? b.score : -Infinity;
          break;
        case 'started_at':
          aVal = a.started_at || '';
          bVal = b.started_at || '';
          break;
        case 'submitted_at':
          aVal = a.submitted_at || '';
          bVal = b.submitted_at || '';
          break;
        default:
          aVal = '';
          bVal = '';
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  };
  const filteredAttempts = getFilteredAttempts();

  function normalizeAnswers(answers: any): Record<string, string> {
    if (!answers) return {};
    if (typeof answers === 'string') {
      try {
        return JSON.parse(answers);
      } catch {
        return {};
      }
    }
    if (typeof answers === 'object') return answers;
    return {};
  }

  const computeScoreFromAnswers = (answers: Record<string, string>) => {
    let newScore = 0;
    modalQuestions.forEach((q: any) => {
      const a = answers[q.id];
      if (typeof q.points === 'number' && q.correct_answer && a === q.correct_answer) {
        newScore += q.points;
      }
    });
    return newScore;
  };

  const markWrittenAnswerCorrect = async (questionId: string) => {
    if (!modalAttempt) return;
    const q = modalQuestions.find((mq: any) => mq.id === questionId);
    if (!q) return;
    const studentAnswer = modalAnswers?.[questionId];
    if (!studentAnswer) return;
    if (q.question_type !== 'written') return;
    if (!q.correct_answer) return; // require a canonical correct answer to align state/UI

    const updatedAnswers = { ...(modalAnswers || {}), [questionId]: q.correct_answer };
    const newScore = computeScoreFromAnswers(updatedAnswers);

    try {
      const { error } = await supabase
        .from('quiz_attempts')
        .update({ answers: updatedAnswers, score: newScore })
        .eq('id', modalAttempt.id);
      if (error) throw error;

      setModalAnswers(updatedAnswers);
      setModalScore(newScore);
      // reflect in attempts table list
      setAttempts(prev => prev.map(a => a.id === modalAttempt.id ? { ...a, score: newScore, answers: updatedAnswers } : a));
      toast({ title: 'Updated', description: 'Answer marked as correct.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to update attempt', variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold">
          {isNewQuiz ? 'Create Quiz' : 'Edit Quiz'}
        </h1>
        <div className="sm:ml-auto">
          <Button onClick={saveQuiz} disabled={saving} variant='default'>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Quiz'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6 pb-0">
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              placeholder="Quiz Title"
              value={quizForm.title}
              onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
            />
            <Select value={quizForm.type} onValueChange={(value: 'quiz' | 'assignment') => setQuizForm({ ...quizForm, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Textarea
            placeholder="Quiz Description"
            value={quizForm.description}
            onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Time Limit (minutes)</label>
              <Input
                type="number"
                value={quizForm.time_limit}
                onChange={(e) => setQuizForm({ ...quizForm, time_limit: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Attempts</label>
              <Input
                type="number"
                value={quizForm.max_attempts}
                onChange={(e) => setQuizForm({ ...quizForm, max_attempts: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quiz Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="shuffle-questions"
                  checked={quizForm.shuffle_questions}
                  onCheckedChange={(checked) => setQuizForm({ ...quizForm, shuffle_questions: checked })}
                />
                <Label htmlFor="shuffle-questions">Shuffle Questions</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="question-navigation"
                  checked={quizForm.question_navigation}
                  onCheckedChange={(checked) => setQuizForm({ ...quizForm, question_navigation: checked })}
                />
                <Label htmlFor="question-navigation">Allow Question Navigation</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-results"
                  checked={quizForm.show_results}
                  onCheckedChange={(checked) => setQuizForm({ ...quizForm, show_results: checked })}
                />
                <Label htmlFor="show-results">Show Results to Students</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-correct-answers"
                  checked={quizForm.show_correct_answers}
                  onCheckedChange={(checked) => setQuizForm({ ...quizForm, show_correct_answers: checked })}
                />
                <Label htmlFor="show-correct-answers">Show Correct Answers</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="allow-review"
                  checked={quizForm.allow_review}
                  onCheckedChange={(checked) => setQuizForm({ ...quizForm, allow_review: checked })}
                />
                <Label htmlFor="allow-review">Allow Answer Review</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="questions" className="space-y-6 mt-6 sm:mt-8">
        <TabsList className="card border border-border bg-card p-2 overflow-x-auto">
          <TabsTrigger value="questions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-500/20 data-[state=active]:to-secondary-500/20 data-[state=active]:text-primary-300 data-[state=active]:border data-[state=active]:border-primary-500/30 transition-all duration-300">
            Questions
          </TabsTrigger>
          <TabsTrigger value="attempts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-500/20 data-[state=active]:to-secondary-500/20 data-[state=active]:text-primary-300 data-[state=active]:border data-[state=active]:border-primary-500/30 transition-all duration-300">
            Attempts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-0">
              <CardTitle>Add Questions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Tabs defaultValue="manual" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  <TabsTrigger value="json">JSON Import</TabsTrigger>
                  <TabsTrigger value="pdf">PDF Extraction</TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-muted-foreground">Add questions manually</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAnswerAllQuestions}
                        disabled={answeringAll || questions.length === 0}
                        variant="outline"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        {answeringAll ? 'Answering All...' : 'Answer All with AI'}
                      </Button>
                      <Button onClick={addQuestion}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="json" className="space-y-4">
                  <div className="space-y-2">
                    <Label>JSON Format: [{`{question, correctAnswer, choice_1, choice_2, choice_3, choice_4}`}, ...]</Label>
                    <Textarea
                      placeholder='[{"question": "What is 2+2?", "correctAnswer": "4", "choice_1": "3", "choice_2": "4", "choice_3": "5", "choice_4": "6"}]'
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      rows={8}
                    />
                    <Button onClick={handleJsonImport} disabled={!jsonInput.trim()}>
                      <FileJson className="h-4 w-4 mr-2" />
                      Import Questions
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="pdf" className="space-y-4">
                  <PdfQuestionExtractor onQuestionsExtracted={handleExtractedQuestions} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6 pb-0">
              <CardTitle>Questions ({questions.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              {questions.map((question, index) => (
                <Card key={index}>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <h4 className="font-medium">Question {index + 1}</h4>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAnswerSingleQuestion(index)}
                          disabled={answeringQuestion === index || !question.question_text.trim()}
                          className="bg-gradient-to-r from-blue-500 to-accent-500 text-white border-0 hover:from-blue-600 hover:to-accent-600"
                        >
                          <Sparkles className="h-4 w-4 mr-1" />
                          {answeringQuestion === index ? 'AI Answering...' : 'AI Answer'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeQuestion(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Textarea
                      placeholder="Question text"
                      value={question.question_text}
                      onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Select
                        value={question.question_type}
                        onValueChange={(value) => updateQuestion(index, 'question_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mcq">Multiple Choice</SelectItem>
                          <SelectItem value="written">Written Answer</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        type="number"
                        placeholder="Points"
                        value={question.points}
                        onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                      />
                    </div>

                    {question.question_type === 'mcq' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Options:</label>
                        {question.options?.map((option, optIndex) => (
                          <div key={optIndex} className="flex gap-2">
                            <Input
                              placeholder={`Option ${optIndex + 1}`}
                              value={option}
                              onChange={(e) => updateOption(index, optIndex, e.target.value)}
                            />
                            <Button
                              type="button"
                              variant={question.correct_answer === option ? "default" : "outline"}
                              onClick={() => updateQuestion(index, 'correct_answer', option)}
                            >
                              Correct
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {question.question_type === 'written' && (
                      <Input
                        placeholder="Expected answer/keywords"
                        value={question.correct_answer}
                        onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No questions added yet. Use the tabs above to add questions.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="attempts" className="space-y-6">
          <Card className="card border border-border bg-card">
            <CardHeader className="p-4 sm:p-6 pb-0">
              <CardTitle className="text-xl text-primary-400">Student Attempts</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="mb-4 flex items-center gap-2">
                <Select value={searchField} onValueChange={v => setSearchField(v as 'name' | 'email' | 'score')}>
                  <SelectTrigger className="w-36 text-primary-200 focus:ring-primary-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="score">Score</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="text"
                  className="w-full  text-primary-200 placeholder:text-primary-300/60 focus:ring-primary-400"
                  placeholder={`Search by ${searchField}...`}
                  value={attemptsSearch}
                  onChange={e => setAttemptsSearch(e.target.value)}
                />
              </div>
              {/* Filters and sorting row */}
              <div className="mb-4 flex flex-col md:flex-row flex-wrap items-stretch gap-2 w-full">
                <Select value={statusFilter} onValueChange={v => setStatusFilter(v as 'all' | 'submitted' | 'not_submitted')}>
                  <SelectTrigger className="w-full md:w-36 text-primary-200 focus:ring-primary-400 flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="not_submitted">Not Submitted</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min=""
                  className="w-full md:w-24  text-primary-200 placeholder:text-primary-300/60 focus:ring-primary-400 flex-1"
                  placeholder="Min Score"
                  value={scoreMin}
                  onChange={e => setScoreMin(e.target.value)}
                />
                <Input
                  type="number"
                  min=""
                  className="w-full md:w-24  text-primary-200 placeholder:text-primary-300/60 focus:ring-primary-400 flex-1"
                  placeholder="Max Score"
                  value={scoreMax}
                  onChange={e => setScoreMax(e.target.value)}
                />
                <Select value={sortField} onValueChange={v => setSortField(v as typeof sortField)}>
                  <SelectTrigger className="w-full md:w-40 text-primary-200 focus:ring-primary-400 flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Sort by Name</SelectItem>
                    <SelectItem value="email">Sort by Email</SelectItem>
                    <SelectItem value="score">Sort by Score</SelectItem>
                    <SelectItem value="started_at">Sort by Started At</SelectItem>
                    <SelectItem value="submitted_at">Sort by Submitted At</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  className=" text-primary-400 px-2 py-2 h-10 w-full md:w-auto flex-1"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                </Button>
              </div>
              {attemptsLoading ? (
                <div className="text-muted-foreground">Loading attempts...</div>
              ) : filteredAttempts.length === 0 ? (
                <div className="text-muted-foreground">No attempts found for this quiz.</div>
              ) : (
                <div className="overflow-x-auto -mx-2 sm:mx-0 hidden sm:block">
                  <div className="min-w-[720px] sm:min-w-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Student</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Email</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Score</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Max Score</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Started At</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Submitted At</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAttempts.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                              <Link
                                to={`/profile/${a.student_id}`}
                                className="text-primary-400 hover:underline hover:text-primary-300 transition-colors"
                              >
                                {a.student_name}
                              </Link>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm whitespace-nowrap">{a.student_email}</TableCell>
                            <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                              {a.submitted_at && typeof a.score === 'number' ? a.score : <span className="text-destructive">Not submitted yet</span>}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm whitespace-nowrap">{a.max_score ?? '-'}</TableCell>
                            <TableCell className="text-xs sm:text-sm whitespace-nowrap">{a.started_at ? new Date(a.started_at).toLocaleString() : '-'}</TableCell>
                            <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                              {a.submitted_at ? new Date(a.submitted_at).toLocaleString() : <span className="text-destructive">Not submitted yet</span>}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                              {a.answers && Object.keys(a.answers || {}).length > 0 ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-primary-400"
                                  onClick={() => {
                                    setModalAnswers(normalizeAnswers(a.answers));
                                    setModalAttempt(a);
                                    setOpenAnswersModal(true);
                                  }}
                                >
                                  View Answers
                                </Button>
                              ) : (
                                <span className="text-destructive">No answers</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Mobile list view for attempts */}
              {!attemptsLoading && filteredAttempts.length > 0 && (
                <div className="space-y-3 sm:hidden">
                  {filteredAttempts.map((a) => (
                    <div key={a.id} className="rounded-xl border border-primary-500/20 p-4 bg-card/50">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-primary-300 truncate">{a.student_name}</div>
                          <div className="text-xs text-muted-foreground break-all">{a.student_email}</div>
                        </div>
                        {a.answers && Object.keys(a.answers || {}).length > 0 ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-primary-400 shrink-0"
                            onClick={() => {
                              setModalAnswers(normalizeAnswers(a.answers));
                              setModalAttempt(a);
                              setOpenAnswersModal(true);
                            }}
                          >
                            View
                          </Button>
                        ) : (
                          <span className="text-destructive text-xs shrink-0">No answers</span>
                        )}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="text-muted-foreground">Score</div>
                        <div>
                          {a.submitted_at && typeof a.score === 'number' ? a.score : <span className="text-destructive">Not submitted</span>}
                          {typeof a.max_score === 'number' && <span className="text-muted-foreground"> / {a.max_score}</span>}
                        </div>
                        <div className="text-muted-foreground">Started</div>
                        <div>{a.started_at ? new Date(a.started_at).toLocaleString() : '-'}</div>
                        <div className="text-muted-foreground">Submitted</div>
                        <div>{a.submitted_at ? new Date(a.submitted_at).toLocaleString() : <span className="text-destructive">Not submitted</span>}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={openAnswersModal} onOpenChange={setOpenAnswersModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary-500 scrollbar-track-background">
          <DialogHeader>
            <DialogTitle>Student Answers</DialogTitle>
            <DialogDescription>
              {modalAttempt && (
                <div className="mb-2 text-sm text-muted-foreground">
                  {modalAttempt.student_name} ({modalAttempt.student_email})
                </div>
              )}
              {modalScore !== null && (
                <div className="mb-2 text-lg font-semibold text-primary-400">Score: {modalScore} / {modalAttempt?.max_score ?? '-'}</div>
              )}
            </DialogDescription>
          </DialogHeader>
          {/* Sorting dropdown */}
          <div className="mb-4">
            <Select value={modalSort} onValueChange={v => setModalSort(v as 'none' | 'correct' | 'incorrect')}>
              <SelectTrigger className="w-full text-primary-200 focus:ring-primary-400">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Sorting</SelectItem>
                <SelectItem value="correct">Correct First</SelectItem>
                <SelectItem value="incorrect">Incorrect First</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            {modalAnswers && typeof modalAnswers === 'object' && Object.keys(modalAnswers).length > 0 ? (
              <ul className="space-y-2">
                {modalQuestions.length > 0 ? (
                  [...modalQuestions].sort((a, b) => {
                    if (modalSort === 'none') return 0;
                    const aCorrect = modalAnswers[a.id] === a.correct_answer;
                    const bCorrect = modalAnswers[b.id] === b.correct_answer;
                    if (modalSort === 'correct') return aCorrect === bCorrect ? 0 : aCorrect ? -1 : 1;
                    if (modalSort === 'incorrect') return aCorrect === bCorrect ? 0 : aCorrect ? 1 : -1;
                    return 0;
                  }).map((q) => {
                    const studentAnswer = modalAnswers[q.id];
                    const correct = studentAnswer === q.correct_answer;
                    return (
                      <li key={q.id} className="border-b border-border pb-2">
                        <div className="font-medium text-primary-300">{q.question_text}</div>
                        <div className="text-sm text-muted-foreground">Correct Answer: <span className="text-primary-400">{q.correct_answer ?? '-'}</span></div>
                        <div className="text-sm">Student Answer: <span className={correct ? 'text-primary-400' : 'text-destructive'}>{studentAnswer ?? '-'}</span></div>
                        <div className="text-xs mt-1">
                          {studentAnswer == null ? (
                            <span className="text-destructive">No answer</span>
                          ) : correct ? (
                            <span className="text-primary-400 font-semibold">Correct</span>
                          ) : (
                            <span className="text-destructive font-semibold">Incorrect</span>
                          )}
                        </div>
                        {q.question_type === 'written' && studentAnswer && studentAnswer !== q.correct_answer && (
                          <div className="mt-2">
                            <Button size="sm" variant="outline" onClick={() => markWrittenAnswerCorrect(q.id)}>
                              Mark Correct
                            </Button>
                          </div>
                        )}
                      </li>
                    );
                  })
                ) : (
                  Object.entries(modalAnswers).map(([q, ans]) => (
                    <li key={q} className="border-b border-border pb-2">
                      <div className="font-medium text-primary-300">Question ID: {q}</div>
                      <div className="text-primary-100">Answer: {typeof ans === 'string' ? ans : JSON.stringify(ans)}</div>
                    </li>
                  ))
                )}
              </ul>
            ) : (
              <div className="text-muted-foreground">No answers found for this attempt.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
