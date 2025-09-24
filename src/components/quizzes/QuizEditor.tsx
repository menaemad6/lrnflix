import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, Save, Sparkles, Zap, FileJson, ArrowDown, ArrowUp, Image as ImageIcon } from 'lucide-react';
import { PdfQuestionExtractor } from './PdfQuestionExtractor';
import { ImageQuestionExtractor } from './ImageQuestionExtractor';
import { AiQuestionGenerator } from './AiQuestionGenerator';
import { ContentManagementSkeleton } from '@/components/ui/skeletons';
import { answerSingleQuestion, answerAllQuestions } from '@/utils/geminiApi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { IMAGE_UPLOAD_BUCKETS } from '@/data/constants';
import { normalizeAnswers, setAnswerCorrectness, calculateScore as calculateScoreUtil } from '@/utils/quizAnswerUtils';
import { AddQuestionModal } from './AddQuestionModal';

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
  question_image?: string | null;
}

interface QuizEditorProps {
  courseId?: string;
  quizId: string;
  onQuizUpdated?: () => void;
  onBack?: () => void;
}

export const QuizEditor = ({ courseId, quizId, onQuizUpdated, onBack }: QuizEditorProps) => {
  const { toast } = useToast();
  const { t } = useTranslation('teacher');
  
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
  const [imageUploadModal, setImageUploadModal] = useState<{ isOpen: boolean; questionIndex: number | null }>({
    isOpen: false,
    questionIndex: null
  });
  const [addQuestionModal, setAddQuestionModal] = useState(false);

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
        order_index: q.order_index,
        question_image: q.question_image || null
      })) || [];

      setQuestions(transformedQuestions);
    } catch (error: any) {
      console.error('Error fetching quiz data:', error);
      toast({
        title: 'Error',
        description: t('quizEditor.toasts.failedToLoadQuiz'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSingleQuestion = async (questionIndex: number) => {
    const question = questions[questionIndex];
    if (!question.question_text.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a question text first',
        variant: 'destructive',
      });
      return;
    }

    setAnsweringQuestion(questionIndex);
    try {
      const response = await answerSingleQuestion(question);
      updateQuestion(questionIndex, 'correct_answer', response.answer);
      toast({
        title: 'Success',
        description: 'AI answer generated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate AI answer',
        variant: 'destructive',
      });
    } finally {
      setAnsweringQuestion(null);
    }
  };

  const handleAnswerAllQuestions = async () => {
    // Prevent multiple simultaneous requests
    if (answeringAll) {
      return;
    }
    
    if (questions.length === 0) {
      toast({
        title: 'Error',
        description: 'No questions to answer',
        variant: 'destructive',
      });
      return;
    }

    // Filter out questions without text and create mapping
    const validQuestionsWithIndex = questions
      .map((q, index) => ({ question: q, originalIndex: index }))
      .filter(item => item.question.question_text && item.question.question_text.trim());
    
    if (validQuestionsWithIndex.length === 0) {
      toast({
        title: 'Error',
        description: 'No questions with text to answer',
        variant: 'destructive',
      });
      return;
    }

    if (validQuestionsWithIndex.length !== questions.length) {
      toast({
        title: 'Warning',
        description: `Only answering ${validQuestionsWithIndex.length} out of ${questions.length} questions (some have no text)`,
        variant: 'destructive',
      });
    }

    setAnsweringAll(true);
    try {
      const validQuestions = validQuestionsWithIndex.map(item => item.question);
      const response = await answerAllQuestions(validQuestions);
      console.log('Answer All Questions Response:', response);
      console.log('Number of answers received:', response.answers?.length);
      console.log('Number of questions sent:', validQuestions.length);
      
      if (!response.answers || response.answers.length === 0) {
        throw new Error('No answers received from AI');
      }
      
      let answeredCount = 0;
      const updatedQuestions = [...questions]; // Create a copy of the questions array
      const failedUpdates: number[] = [];
      
      response.answers.forEach((answerData, index) => {
        console.log(`Processing answer ${index}:`, answerData);
        
        // Validate answer data
        if (!answerData || typeof answerData.question_index !== 'number' || !answerData.answer) {
          console.warn(`Invalid answer data at index ${index}:`, answerData);
          return;
        }
        
        // Map back to original question index using the question_index from Gemini
        if (answerData.question_index >= 0 && answerData.question_index < validQuestionsWithIndex.length) {
          const originalIndex = validQuestionsWithIndex[answerData.question_index].originalIndex;
          updatedQuestions[originalIndex] = {
            ...updatedQuestions[originalIndex],
            correct_answer: answerData.answer
          };
          answeredCount++;
          console.log(`Updated question ${originalIndex} with answer: ${answerData.answer}`);
        } else {
          console.warn(`Invalid question_index: ${answerData.question_index}. Valid questions length: ${validQuestions.length}`);
          failedUpdates.push(answerData.question_index);
        }
      });
      
      // Update all questions at once
      setQuestions(updatedQuestions);
      
      console.log(`Successfully answered ${answeredCount} out of ${validQuestions.length} questions`);
      
      // Show appropriate success message
      if (answeredCount === validQuestions.length) {
        toast({
          title: 'Success',
          description: 'AI answers generated for all questions',
        });
      } else if (answeredCount > 0) {
        toast({
          title: 'Partial Success',
          description: `AI answers generated for ${answeredCount} out of ${validQuestions.length} questions`,
        });
      } else {
        throw new Error('No questions were successfully updated');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate AI answers',
        variant: 'destructive',
      });
    } finally {
      setAnsweringAll(false);
    }
  };

  const handleImageUpload = (questionIndex: number, imageUrl: string) => {
    updateQuestion(questionIndex, 'question_image', imageUrl);
    setImageUploadModal({ isOpen: false, questionIndex: null });
    toast({
      title: 'Success',
      description: 'Question image uploaded successfully',
    });
  };

  const handleRemoveImage = (questionIndex: number) => {
    updateQuestion(questionIndex, 'question_image', null);
    toast({
      title: 'Success',
      description: 'Question image removed successfully',
    });
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
          order_index: questions.length + index,
        };
      });

      setQuestions([...questions, ...newQuestions]);
      setJsonInput('');
      toast({
        title: 'Success',
        description: t('quizEditor.toasts.questionsImported', { count: newQuestions.length }),
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const addQuestion = () => {
    setAddQuestionModal(true);
  };

  const handleAddQuestion = (newQuestion: Question) => {
    const questionWithIndex = {
      ...newQuestion,
      order_index: questions.length
    };
    setQuestions([...questions, questionWithIndex]);
  };

  const handleExtractedQuestions = (extractedQuestions: any[]) => {
    const newQuestions: Question[] = extractedQuestions.map((q, index) => ({
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.question_type === 'mcq' ? (Array.isArray(q.options) && q.options.length > 0 ? q.options : ['', '', '', '']) : ['', '', '', ''],
      correct_answer: q.correct_answer || '',
      points: typeof q.points === 'number' ? q.points : 1,
      order_index: questions.length + index,
      question_image: null
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
          order_index: index,
          question_image: q.question_image || null
        }));

        const { error: questionsError } = await supabase
          .from('quiz_questions')
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;
      }

      toast({
        title: 'Success',
        description: isNewQuiz ? t('quizEditor.toasts.quizCreated') : t('quizEditor.toasts.quizUpdated'),
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
    return <ContentManagementSkeleton />;
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
    return calculateScoreUtil(answers, modalQuestions);
  };

  const markWrittenAnswerCorrect = async (questionId: string) => {
    if (!modalAttempt) return;
    const q = modalQuestions.find((mq: any) => mq.id === questionId);
    if (!q) return;
    const studentAnswer = modalAnswers?.[questionId];
    if (!studentAnswer) return;
    if (q.question_type !== 'written') return;

    // Use the new answer structure - mark as correct without changing the student's answer
    const updatedAnswers = setAnswerCorrectness(modalAnswers || {}, questionId, true);
    const newScore = calculateScoreUtil(updatedAnswers, modalQuestions);

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
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to update attempt', variant: 'destructive' });
    }
  };

  const markWrittenAnswerIncorrect = async (questionId: string) => {
    if (!modalAttempt) return;
    const q = modalQuestions.find((mq: any) => mq.id === questionId);
    if (!q) return;
    const studentAnswer = modalAnswers?.[questionId];
    if (!studentAnswer) return;
    if (q.question_type !== 'written') return;

    // Use the new answer structure - mark as incorrect without changing the student's answer
    const updatedAnswers = setAnswerCorrectness(modalAnswers || {}, questionId, false);
    const newScore = calculateScoreUtil(updatedAnswers, modalQuestions);

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
      toast({ title: 'Updated', description: 'Answer marked as incorrect.' });
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to update attempt', variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:gap-4">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('quizEditor.header.back')}
          </Button>
        )}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center sm:text-left">
          {isNewQuiz ? t('quizEditor.header.createQuiz') : t('quizEditor.header.editQuiz')}
        </h1>
        <div className="sm:ml-auto w-full sm:w-auto">
          <Button onClick={saveQuiz} disabled={saving} variant='default' className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" />
            {saving ? t('quizEditor.header.saving') : t('quizEditor.header.saveQuiz')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6 pb-0">
          <CardTitle className="text-lg sm:text-xl">{t('quizEditor.quizDetails.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input
              placeholder={t('quizEditor.quizDetails.quizTitle')}
              value={quizForm.title}
              onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
            />
            <Select value={quizForm.type} onValueChange={(value: 'quiz' | 'assignment') => setQuizForm({ ...quizForm, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quiz">{t('quizEditor.quizDetails.quiz')}</SelectItem>
                <SelectItem value="assignment">{t('quizEditor.quizDetails.assignment')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Textarea
            placeholder={t('quizEditor.quizDetails.quizDescription')}
            value={quizForm.description}
            onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
            rows={3}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('quizEditor.quizDetails.timeLimit')}</label>
              <Input
                type="number"
                value={quizForm.time_limit}
                onChange={(e) => setQuizForm({ ...quizForm, time_limit: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('quizEditor.quizDetails.maxAttempts')}</label>
              <Input
                type="number"
                value={quizForm.max_attempts}
                onChange={(e) => setQuizForm({ ...quizForm, max_attempts: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold">{t('quizEditor.quizDetails.quizOptions')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="shuffle-questions"
                  checked={quizForm.shuffle_questions}
                  onCheckedChange={(checked) => setQuizForm({ ...quizForm, shuffle_questions: checked })}
                />
                <Label htmlFor="shuffle-questions" className="text-sm">{t('quizEditor.quizDetails.shuffleQuestions')}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="question-navigation"
                  checked={quizForm.question_navigation}
                  onCheckedChange={(checked) => setQuizForm({ ...quizForm, question_navigation: checked })}
                />
                <Label htmlFor="question-navigation" className="text-sm">{t('quizEditor.quizDetails.allowQuestionNavigation')}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-results"
                  checked={quizForm.show_results}
                  onCheckedChange={(checked) => setQuizForm({ ...quizForm, show_results: checked })}
                />
                <Label htmlFor="show-results" className="text-sm">{t('quizEditor.quizDetails.showResultsToStudents')}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-correct-answers"
                  checked={quizForm.show_correct_answers}
                  onCheckedChange={(checked) => setQuizForm({ ...quizForm, show_correct_answers: checked })}
                />
                <Label htmlFor="show-correct-answers" className="text-sm">{t('quizEditor.quizDetails.showCorrectAnswers')}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="allow-review"
                  checked={quizForm.allow_review}
                  onCheckedChange={(checked) => setQuizForm({ ...quizForm, allow_review: checked })}
                />
                <Label htmlFor="allow-review" className="text-sm">{t('quizEditor.quizDetails.allowAnswerReview')}</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="questions" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6 md:mt-8">
        <TabsList className="card border border-border bg-card p-1 sm:p-2 overflow-x-auto w-full">
          <TabsTrigger value="questions" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-500/20 data-[state=active]:to-secondary-500/20 data-[state=active]:text-primary-300 data-[state=active]:border data-[state=active]:border-primary-500/30 transition-all duration-300 text-sm sm:text-base">
            {t('quizEditor.questions.title')}
          </TabsTrigger>
          <TabsTrigger value="attempts" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-500/20 data-[state=active]:to-secondary-500/20 data-[state=active]:text-primary-300 data-[state=active]:border data-[state=active]:border-primary-500/20 data-[state=active]:border-primary-500/30 transition-all duration-300 text-sm sm:text-base">
            {t('quizEditor.attempts.title')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="questions" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6 pb-0">
              <CardTitle className="text-lg sm:text-xl">{t('quizEditor.questions.addQuestions')}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <Tabs defaultValue="manual" className="space-y-3 sm:space-y-4">
                <TabsList className="w-full">
                  <TabsTrigger value="manual">{t('quizEditor.questions.manualEntry')}</TabsTrigger>
                  <TabsTrigger value="image">{t('quizEditor.questions.imageExtraction')}</TabsTrigger>
                  <TabsTrigger value="pdf">{t('quizEditor.questions.pdfExtraction')}</TabsTrigger>
                  <TabsTrigger value="json">{t('quizEditor.questions.jsonImport')}</TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-muted-foreground text-sm sm:text-base">{t('quizEditor.questions.addQuestionsManually')}</p>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Button onClick={addQuestion} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        {t('quizEditor.questions.addQuestion')}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="json" className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('quizEditor.questions.jsonFormat')}</Label>
                    <Textarea
                      placeholder={t('quizEditor.questions.jsonPlaceholder')}
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      rows={8}
                    />
                    <Button onClick={handleJsonImport} disabled={!jsonInput.trim()}>
                      <FileJson className="h-4 w-4 mr-2" />
                      {t('quizEditor.questions.importQuestions')}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="pdf" className="space-y-4">
                  <PdfQuestionExtractor onQuestionsExtracted={handleExtractedQuestions} />
                </TabsContent>

                <TabsContent value="image" className="space-y-4">
                  <ImageQuestionExtractor onQuestionsExtracted={handleExtractedQuestions} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* AI Generation Card */}
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6 pb-0">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                {t('quizEditor.questions.ai')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="ai-generation">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">{t('quizEditor.questions.aiGenerationContent.title')}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <AiQuestionGenerator onQuestionsGenerated={handleExtractedQuestions} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Answer All Questions Button */}
              <div className="flex justify-center mt-4">
                <Button
                  onClick={handleAnswerAllQuestions}
                  disabled={answeringAll || questions.length === 0}
                  variant="outline"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {answeringAll ? t('quizEditor.questions.answeringAll') : t('quizEditor.questions.answerAllWithAI')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6 pb-0">
              <CardTitle className="text-lg sm:text-xl">{t('quizEditor.questions.questionsCount', { count: questions.length })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6">
              {questions.map((question, index) => (
                <Card key={index}>
                  <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                    <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between">
                      <h4 className="font-medium text-base sm:text-lg">{t('quizEditor.questions.questionNumber', { number: index + 1 })}</h4>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAnswerSingleQuestion(index)}
                          disabled={answeringQuestion === index || !question.question_text.trim()}
                          className="bg-gradient-to-r from-blue-500 to-accent-500 text-white border-0 hover:from-blue-600 hover:to-accent-600 w-full sm:w-auto"
                        >
                          <Sparkles className="h-4 w-4 mr-1" />
                          {answeringQuestion === index ? t('quizEditor.questions.aiAnswering') : t('quizEditor.questions.aiAnswer')}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeQuestion(index)}
                          className="w-full sm:w-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Textarea
                      placeholder={t('quizEditor.questions.questionText')}
                      value={question.question_text}
                      onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                    />

                    {/* Question Image Section */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                        <label className="text-sm font-medium">{t('quizEditor.questions.questionImage')}</label>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setImageUploadModal({ isOpen: true, questionIndex: index })}
                            className="w-full sm:w-auto"
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            {question.question_image ? t('quizEditor.questions.changeImage') : t('quizEditor.questions.addImage')}
                          </Button>
                          {question.question_image && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveImage(index)}
                              className="w-full sm:w-auto"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('quizEditor.questions.remove')}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {question.question_image && (
                        <div className="relative">
                          <img
                            src={question.question_image}
                            alt="Question"
                            className="max-w-full max-h-48 object-contain rounded-lg border border-border"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <Select
                        value={question.question_type}
                        onValueChange={(value) => updateQuestion(index, 'question_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mcq">{t('quizEditor.questions.multipleChoice')}</SelectItem>
                          <SelectItem value="written">{t('quizEditor.questions.writtenAnswer')}</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        type="number"
                        placeholder={t('quizEditor.questions.points')}
                        value={question.points}
                        onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                      />
                    </div>

                    {question.question_type === 'mcq' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t('quizEditor.questions.options')}</label>
                        {question.options?.map((option, optIndex) => (
                          <div key={optIndex} className="flex flex-col sm:flex-row gap-2">
                            <Input
                              placeholder={t('quizEditor.questions.optionNumber', { number: optIndex + 1 })}
                              value={option}
                              onChange={(e) => updateOption(index, optIndex, e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant={question.correct_answer === option ? "default" : "outline"}
                              onClick={() => updateQuestion(index, 'correct_answer', option)}
                              className="w-full sm:w-auto"
                            >
                              {t('quizEditor.questions.correct')}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {question.question_type === 'written' && (
                      <Input
                        placeholder={t('quizEditor.questions.expectedAnswerKeywords')}
                        value={question.correct_answer}
                        onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t('quizEditor.questions.noQuestionsYet')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="attempts" className="space-y-4 sm:space-y-6">
          <Card className="card border border-border bg-card">
            <CardHeader className="p-3 sm:p-4 md:p-6 pb-0">
              <CardTitle className="text-lg sm:text-xl text-primary-400">{t('quizEditor.attempts.studentAttempts')}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
              <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Select value={searchField} onValueChange={v => setSearchField(v as 'name' | 'email' | 'score')}>
                  <SelectTrigger className="w-full sm:w-36 text-primary-200 focus:ring-primary-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">{t('quizEditor.attempts.student')}</SelectItem>
                    <SelectItem value="email">{t('quizEditor.attempts.email')}</SelectItem>
                    <SelectItem value="score">{t('quizEditor.attempts.score')}</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="text"
                  className="w-full text-primary-200 placeholder:text-primary-300/60 focus:ring-primary-400"
                  placeholder={t('quizEditor.attempts.searchByField', { field: searchField === 'name' ? t('quizEditor.attempts.student') : searchField === 'email' ? t('quizEditor.attempts.email') : t('quizEditor.attempts.score') })}
                  value={attemptsSearch}
                  onChange={e => setAttemptsSearch(e.target.value)}
                />
              </div>
              {/* Filters and sorting row */}
              <div className="mb-3 sm:mb-4 flex flex-col md:flex-row flex-wrap items-stretch gap-2 w-full">
                <Select value={statusFilter} onValueChange={v => setStatusFilter(v as 'all' | 'submitted' | 'not_submitted')}>
                  <SelectTrigger className="w-full md:w-36 text-primary-200 focus:ring-primary-400 flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('quizEditor.attempts.allStatuses')}</SelectItem>
                    <SelectItem value="submitted">{t('quizEditor.attempts.submitted')}</SelectItem>
                    <SelectItem value="not_submitted">{t('quizEditor.attempts.notSubmitted')}</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min=""
                  className="w-full md:w-24 text-primary-200 placeholder:text-primary-300/60 focus:ring-primary-400 flex-1"
                  placeholder={t('quizEditor.attempts.minScore')}
                  value={scoreMin}
                  onChange={e => setScoreMin(e.target.value)}
                />
                <Input
                  type="number"
                  min=""
                  className="w-full md:w-24 text-primary-200 placeholder:text-primary-300/60 focus:ring-primary-400 flex-1"
                  placeholder={t('quizEditor.attempts.maxScore')}
                  value={scoreMax}
                  onChange={e => setScoreMax(e.target.value)}
                />
                <Select value={sortField} onValueChange={v => setSortField(v as typeof sortField)}>
                  <SelectTrigger className="w-full md:w-40 text-primary-200 focus:ring-primary-400 flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">{t('quizEditor.attempts.sortByName')}</SelectItem>
                    <SelectItem value="email">{t('quizEditor.attempts.sortByEmail')}</SelectItem>
                    <SelectItem value="score">{t('quizEditor.attempts.sortByScore')}</SelectItem>
                    <SelectItem value="started_at">{t('quizEditor.attempts.sortByStartedAt')}</SelectItem>
                    <SelectItem value="submitted_at">{t('quizEditor.attempts.sortBySubmittedAt')}</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  className="text-primary-400 px-2 py-2 h-10 w-full md:w-auto flex-1"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  title={sortOrder === 'asc' ? t('quizEditor.attempts.ascending') : t('quizEditor.attempts.descending')}
                >
                  {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                </Button>
              </div>
              {attemptsLoading ? (
                <div className="text-muted-foreground">{t('quizEditor.attempts.loadingAttempts')}</div>
              ) : filteredAttempts.length === 0 ? (
                <div className="text-muted-foreground">{t('quizEditor.attempts.noAttemptsFound')}</div>
              ) : (
                <div className="overflow-x-auto -mx-2 sm:mx-0 hidden sm:block">
                  <div className="min-w-[720px] sm:min-w-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">{t('quizEditor.attempts.student')}</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">{t('quizEditor.attempts.email')}</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">{t('quizEditor.attempts.score')}</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">{t('quizEditor.attempts.maxScore')}</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">{t('quizEditor.attempts.startedAt')}</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">{t('quizEditor.attempts.submittedAt')}</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">{t('quizEditor.attempts.actions')}</TableHead>
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
                              {a.submitted_at && typeof a.score === 'number' ? a.score : <span className="text-destructive">{t('quizEditor.attempts.notSubmittedYet')}</span>}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm whitespace-nowrap">{a.max_score ?? '-'}</TableCell>
                            <TableCell className="text-xs sm:text-sm whitespace-nowrap">{a.started_at ? new Date(a.started_at).toLocaleString() : '-'}</TableCell>
                            <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                              {a.submitted_at ? new Date(a.submitted_at).toLocaleString() : <span className="text-destructive">{t('quizEditor.attempts.notSubmittedYet')}</span>}
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
                                  {t('quizEditor.attempts.viewAnswers')}
                                </Button>
                              ) : (
                                <span className="text-destructive">{t('quizEditor.attempts.noAnswers')}</span>
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
                    <div key={a.id} className="rounded-xl border border-primary-500/20 p-3 sm:p-4 bg-card/50">
                      <div className="flex items-center justify-between gap-2 sm:gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-primary-300 truncate text-sm sm:text-base">{a.student_name}</div>
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
                            {t('quizEditor.attempts.view')}
                          </Button>
                        ) : (
                          <span className="text-destructive text-xs shrink-0">{t('quizEditor.attempts.noAnswers')}</span>
                        )}
                      </div>
                      <div className="mt-2 sm:mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="text-muted-foreground">{t('quizEditor.attempts.score')}</div>
                        <div>
                          {a.submitted_at && typeof a.score === 'number' ? a.score : <span className="text-destructive">{t('quizEditor.attempts.notSubmitted')}</span>}
                          {typeof a.max_score === 'number' && <span className="text-muted-foreground"> / {a.max_score}</span>}
                        </div>
                        <div className="text-muted-foreground">{t('quizEditor.attempts.startedAt')}</div>
                        <div>{a.started_at ? new Date(a.started_at).toLocaleString() : '-'}</div>
                        <div className="text-muted-foreground">{t('quizEditor.attempts.submittedAt')}</div>
                        <div>{a.submitted_at ? new Date(a.submitted_at).toLocaleString() : <span className="text-destructive">{t('quizEditor.attempts.notSubmitted')}</span>}</div>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary-500 scrollbar-track-background p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{t('quizEditor.modals.studentAnswers')}</DialogTitle>
            <DialogDescription>
              {modalAttempt && (
                <div className="mb-2 text-sm text-muted-foreground">
                  {modalAttempt.student_name} ({modalAttempt.student_email})
                </div>
              )}
              {modalScore !== null && (
                <div className="mb-2 text-base sm:text-lg font-semibold text-primary-400">{t('quizEditor.modals.score', { score: modalScore, maxScore: modalAttempt?.max_score ?? '-' })}</div>
              )}
            </DialogDescription>
          </DialogHeader>
          {/* Sorting dropdown */}
          <div className="mb-3 sm:mb-4">
            <Select value={modalSort} onValueChange={v => setModalSort(v as 'none' | 'correct' | 'incorrect')}>
              <SelectTrigger className="w-full text-primary-200 focus:ring-primary-400">
                <SelectValue placeholder={t('quizEditor.modals.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('quizEditor.modals.noSorting')}</SelectItem>
                <SelectItem value="correct">{t('quizEditor.modals.correctFirst')}</SelectItem>
                <SelectItem value="incorrect">{t('quizEditor.modals.incorrectFirst')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            {modalAnswers && typeof modalAnswers === 'object' && Object.keys(modalAnswers).length > 0 ? (
              <ul className="space-y-2">
                {modalQuestions.length > 0 ? (
                  [...modalQuestions].sort((a, b) => {
                    if (modalSort === 'none') return 0;
                    const aCorrect = modalAnswers[a.id]?.isCorrect === true || modalAnswers[a.id] === a.correct_answer;
                    const bCorrect = modalAnswers[b.id]?.isCorrect === true || modalAnswers[b.id] === b.correct_answer;
                    if (modalSort === 'correct') return aCorrect === bCorrect ? 0 : aCorrect ? -1 : 1;
                    if (modalSort === 'incorrect') return aCorrect === bCorrect ? 0 : aCorrect ? 1 : -1;
                    return 0;
                  }).map((q) => {
                    const answerData = modalAnswers[q.id];
                    const studentAnswer = typeof answerData === 'object' && answerData !== null && 'answer' in answerData 
                      ? answerData.answer 
                      : answerData; // Legacy support
                    const isCorrect = answerData?.isCorrect === true || studentAnswer === q.correct_answer;
                    
                    return (
                      <li key={q.id} className="border-b border-border pb-2">
                        <div className="font-medium text-primary-300">{q.question_text}</div>
                        <div className="text-sm text-muted-foreground">{t('quizEditor.modals.correctAnswer')} <span className="text-primary-400">{q.correct_answer ?? '-'}</span></div>
                        <div className="text-sm">{t('quizEditor.modals.studentAnswer')} <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>{studentAnswer ?? '-'}</span></div>
                        <div className="text-xs mt-1">
                          {studentAnswer == null ? (
                            <span className="text-red-600">{t('quizEditor.attempts.noAnswer')}</span>
                          ) : isCorrect ? (
                            <span className="text-green-600 font-semibold">{t('quizEditor.attempts.correct')}</span>
                          ) : (
                            <span className="text-red-600 font-semibold">{t('quizEditor.attempts.incorrect')}</span>
                          )}
                        </div>
                        {q.question_type === 'written' && studentAnswer && (
                          <div className="mt-2 flex gap-2">
                            {!isCorrect ? (
                              <Button size="sm" variant="outline" onClick={() => markWrittenAnswerCorrect(q.id)}>
                                {t('quizEditor.attempts.markCorrect')}
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => markWrittenAnswerIncorrect(q.id)}>
                                {t('quizEditor.attempts.markFalse')}
                              </Button>
                            )}
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
              <div className="text-muted-foreground">{t('quizEditor.attempts.noAnswers')}</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Upload Modal */}
      <Dialog open={imageUploadModal.isOpen} onOpenChange={(open) => setImageUploadModal({ isOpen: open, questionIndex: null })}>
        <DialogContent className="max-w-2xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{t('quizEditor.modals.uploadQuestionImage')}</DialogTitle>
            <DialogDescription>
              {t('quizEditor.modals.uploadQuestionImageDesc', { questionNumber: imageUploadModal.questionIndex !== null ? imageUploadModal.questionIndex + 1 : '' })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <ImageUploader
              bucket={IMAGE_UPLOAD_BUCKETS.QUIZ_QUESTIONS}
              folder={`quiz_${quizId}`}
              fileName={`question_${imageUploadModal.questionIndex !== null ? imageUploadModal.questionIndex + 1 : ''}_${Date.now()}`}
              onImageUploaded={(image) => {
                if (imageUploadModal.questionIndex !== null) {
                  handleImageUpload(imageUploadModal.questionIndex, image.url);
                }
              }}
              onError={(error) => {
                toast({
                  title: 'Upload Error',
                  description: error,
                  variant: 'destructive',
                });
              }}
              variant="default"
              size="lg"
              showPreview={true}
              placeholder={t('quizEditor.modals.dragDropImage')}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Question Modal */}
      <AddQuestionModal
        isOpen={addQuestionModal}
        onClose={() => setAddQuestionModal(false)}
        onAddQuestion={handleAddQuestion}
        questionIndex={questions.length}
      />
    </div>
  );
};
