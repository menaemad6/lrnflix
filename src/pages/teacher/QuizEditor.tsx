import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, Save, Sparkles, Zap, Upload, FileJson } from 'lucide-react';
import { PdfQuestionExtractor } from '@/components/quizzes/PdfQuestionExtractor';
import { answerSingleQuestion, answerAllQuestions } from '@/utils/geminiApi';

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

export const QuizEditor = () => {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const navigate = useNavigate();
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
        title: t('quizEditor.error'),
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
        title: t('quizEditor.success'),
        description: 'Answer generated successfully!',
      });
    } catch (error: any) {
      console.error('Error answering question:', error);
      toast({
        title: t('quizEditor.error'),
        description: t('quizEditor.failedToAnswer'),
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
        title: t('quizEditor.error'),
        description: t('quizEditor.noValidQuestions'),
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
        title: t('quizEditor.success'),
        description: t('quizEditor.generatedAnswers', { count: response.answers.length }),
      });
    } catch (error: any) {
      console.error('Error answering all questions:', error);
      toast({
        title: t('quizEditor.error'),
        description: t('quizEditor.failedToAnswer'),
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
      options: q.question_type === 'mcq' ? (q.options || ['', '', '', '']) : ['', '', '', ''],
      correct_answer: q.correct_answer || '',
      points: q.points,
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
        title: t('quizEditor.success'),
        description: isNewQuiz ? t('quizEditor.quizCreated') : t('quizEditor.quizUpdated'),
      });

      if (isNewQuiz) {
        navigate(`/teacher/courses/${courseId}/quiz/${quizId_actual}`);
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(`/teacher/courses/${courseId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('quizEditor.backToCourse')}
        </Button>
        <h1 className="text-3xl font-bold">
          {isNewQuiz ? t('quizEditor.createQuiz') : t('quizEditor.editQuiz')}
        </h1>
        <div className="ml-auto">
          <Button onClick={saveQuiz} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? t('quizEditor.saving') : t('quizEditor.saveQuiz')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('quizEditor.quizDetails')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder={t('quizEditor.quizTitle')}
              value={quizForm.title}
              onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
            />
            <Select value={quizForm.type} onValueChange={(value: 'quiz' | 'assignment') => setQuizForm({ ...quizForm, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quiz">{t('quizEditor.quiz')}</SelectItem>
                <SelectItem value="assignment">{t('quizEditor.assignment')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Textarea
            placeholder={t('quizEditor.quizDescription')}
            value={quizForm.description}
            onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t('quizEditor.timeLimit')}</label>
              <Input
                type="number"
                value={quizForm.time_limit}
                onChange={(e) => setQuizForm({ ...quizForm, time_limit: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t('quizEditor.maxAttempts')}</label>
              <Input
                type="number"
                value={quizForm.max_attempts}
                onChange={(e) => setQuizForm({ ...quizForm, max_attempts: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('quizEditor.quizOptions')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="shuffle-questions"
                  checked={quizForm.shuffle_questions}
                  onCheckedChange={(checked) => setQuizForm({ ...quizForm, shuffle_questions: checked })}
                />
                <Label htmlFor="shuffle-questions">{t('quizEditor.shuffleQuestions')}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="question-navigation"
                  checked={quizForm.question_navigation}
                  onCheckedChange={(checked) => setQuizForm({ ...quizForm, question_navigation: checked })}
                />
                <Label htmlFor="question-navigation">{t('quizEditor.allowQuestionNavigation')}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-results"
                  checked={quizForm.show_results}
                  onCheckedChange={(checked) => setQuizForm({ ...quizForm, show_results: checked })}
                />
                <Label htmlFor="show-results">{t('quizEditor.showResultsToStudents')}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-correct-answers"
                  checked={quizForm.show_correct_answers}
                  onCheckedChange={(checked) => setQuizForm({ ...quizForm, show_correct_answers: checked })}
                />
                <Label htmlFor="show-correct-answers">{t('quizEditor.showCorrectAnswers')}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="allow-review"
                  checked={quizForm.allow_review}
                  onCheckedChange={(checked) => setQuizForm({ ...quizForm, allow_review: checked })}
                />
                <Label htmlFor="allow-review">{t('quizEditor.allowAnswerReview')}</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('quizEditor.addQuestions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manual">{t('quizEditor.manualEntry')}</TabsTrigger>
              <TabsTrigger value="json">{t('quizEditor.jsonImport')}</TabsTrigger>
              <TabsTrigger value="pdf">{t('quizEditor.pdfExtraction')}</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground">{t('quizEditor.addQuestionsManually')}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAnswerAllQuestions}
                    disabled={answeringAll || questions.length === 0}
                    variant="outline"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {answeringAll ? t('quizEditor.answeringAll') : t('quizEditor.answerAllWithAI')}
                  </Button>
                  <Button onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('quizEditor.addQuestion')}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="json" className="space-y-4">
              <div className="space-y-2">
                <Label>{t('quizEditor.jsonFormat')}</Label>
                <Textarea
                  placeholder={t('quizEditor.jsonPlaceholder')}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  rows={8}
                />
                <Button onClick={handleJsonImport} disabled={!jsonInput.trim()}>
                  <FileJson className="h-4 w-4 mr-2" />
                  {t('quizEditor.importQuestions')}
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
        <CardHeader>
          <CardTitle>{t('quizEditor.questions')} ({questions.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((question, index) => (
            <Card key={index}>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{t('quizEditor.question')} {index + 1}</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAnswerSingleQuestion(index)}
                      disabled={answeringQuestion === index || !question.question_text.trim()}
                      className="bg-gradient-to-r from-blue-500 to-accent-500 text-white border-0 hover:from-blue-600 hover:to-accent-600"
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      {answeringQuestion === index ? t('quizEditor.aiAnswering') : t('quizEditor.aiAnswer')}
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
                  placeholder={t('quizEditor.questionText')}
                  value={question.question_text}
                  onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                />

                <div className="grid grid-cols-3 gap-4">
                  <Select
                    value={question.question_type}
                    onValueChange={(value) => updateQuestion(index, 'question_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">{t('quizEditor.multipleChoice')}</SelectItem>
                      <SelectItem value="written">{t('quizEditor.writtenAnswer')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    placeholder={t('quizEditor.points')}
                    value={question.points}
                    onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                  />
                </div>

                {question.question_type === 'mcq' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('quizEditor.options')}:</label>
                    {question.options?.map((option, optIndex) => (
                      <div key={optIndex} className="flex gap-2">
                        <Input
                          placeholder={`${t('quizEditor.option')} ${optIndex + 1}`}
                          value={option}
                          onChange={(e) => updateOption(index, optIndex, e.target.value)}
                        />
                        <Button
                          type="button"
                          variant={question.correct_answer === option ? "default" : "outline"}
                          onClick={() => updateQuestion(index, 'correct_answer', option)}
                        >
                          {t('quizEditor.correctAnswer')}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {question.question_type === 'written' && (
                  <Input
                    placeholder={t('quizEditor.expectedAnswer')}
                    value={question.correct_answer}
                    onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                  />
                )}
              </CardContent>
            </Card>
          ))}

          {questions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t('quizEditor.noQuestionsAdded')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
