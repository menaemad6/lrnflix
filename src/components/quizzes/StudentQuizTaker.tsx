
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { QuizNavigation } from './QuizNavigation';
import { QuizTimer } from './QuizTimer';
import { QuizQuestion } from './QuizQuestion';
import { QuizResults } from './QuizResults';
import { ArrowLeft, PlayCircle, ChevronLeft, ChevronRight, Send, Trophy, Target, BookOpen, CheckCircle, Eye, Clock, AlertTriangle } from 'lucide-react';
import { QuizTakerSkeleton } from '@/components/student/skeletons';
import { createAnswerEntry, calculateScore as calculateScoreUtil, normalizeAnswers } from '@/utils/quizAnswerUtils';

interface Quiz {
  id: string;
  title: string;
  description: string;
  max_attempts: number;
  time_limit: number | null;
  shuffle_questions: boolean;
  show_results: boolean;
  show_correct_answers: boolean;
  allow_review: boolean;
  question_navigation: boolean;
}

interface QuizQuestion {
  id: string;
  question_text: string;
  question_type: string;
  options: any;
  order_index: number;
  points: number;
  correct_answer?: string;
  question_image?: string | null;
}

interface QuizAttempt {
  id: string;
  score: number;
  max_score: number;
  submitted_at: string;
  answers: any;
  started_at: string;
}

interface StudentQuizTakerProps {
  quiz: Quiz;
  courseId: string;
  onBackToCourse: () => void;
  attemptId?: string;
}

// Local storage keys
const QUIZ_ANSWERS_KEY = (quizId: string) => `quiz_answers_${quizId}`;
const QUIZ_ATTEMPT_KEY = (quizId: string) => `quiz_attempt_${quizId}`;
const QUIZ_TIME_LEFT_KEY = (quizId: string) => `quiz_time_left_${quizId}`;

export const StudentQuizTaker = ({ quiz, courseId, onBackToCourse, attemptId }: StudentQuizTakerProps) => {
  const { toast } = useToast();
  const { t } = useTranslation('courses');
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, { answer: string; isCorrect: boolean | null }>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [isResuming, setIsResuming] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(false);

  // Auto-save answers every 20 seconds
  const autoSaveAnswers = useCallback(async () => {
    if (!currentAttempt || Object.keys(answers).length === 0) return;

    setAutoSaveStatus('saving');
    try {
      const { error } = await supabase
        .from('quiz_attempts')
        .update({ answers })
        .eq('id', currentAttempt.id);

      if (error) {
        console.error('Auto-save error:', error);
        setAutoSaveStatus('error');
        setTimeout(() => setAutoSaveStatus('saved'), 3000);
      } else {
        setAutoSaveStatus('saved');
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus('saved'), 3000);
    }
  }, [currentAttempt, answers]);

  // Save answers to localStorage as backup
  const saveToLocalStorage = useCallback(() => {
    if (currentAttempt && Object.keys(answers).length > 0) {
      localStorage.setItem(QUIZ_ANSWERS_KEY(quiz.id), JSON.stringify(answers));
      localStorage.setItem(QUIZ_ATTEMPT_KEY(quiz.id), JSON.stringify(currentAttempt));
      if (timeLeft !== null) {
        localStorage.setItem(QUIZ_TIME_LEFT_KEY(quiz.id), timeLeft.toString());
      }
    }
  }, [currentAttempt, answers, timeLeft, quiz.id]);

  // Load answers from localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedAnswers = localStorage.getItem(QUIZ_ANSWERS_KEY(quiz.id));
      const savedAttempt = localStorage.getItem(QUIZ_ATTEMPT_KEY(quiz.id));
      const savedTimeLeft = localStorage.getItem(QUIZ_TIME_LEFT_KEY(quiz.id));

      if (savedAnswers && savedAttempt) {
        const parsedAnswers = JSON.parse(savedAnswers);
        const parsedAttempt = JSON.parse(savedAttempt);
        const parsedTimeLeft = savedTimeLeft ? parseInt(savedTimeLeft) : null;

        return { answers: parsedAnswers, attempt: parsedAttempt, timeLeft: parsedTimeLeft };
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    return null;
  }, [quiz.id]);

  // Clear localStorage
  const clearLocalStorage = useCallback(() => {
    localStorage.removeItem(QUIZ_ANSWERS_KEY(quiz.id));
    localStorage.removeItem(QUIZ_ATTEMPT_KEY(quiz.id));
    localStorage.removeItem(QUIZ_TIME_LEFT_KEY(quiz.id));
  }, [quiz.id]);

  // Beforeunload event handler
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentAttempt && !submitting) {
        e.preventDefault();
        e.returnValue = 'You have an active quiz attempt. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    if (currentAttempt) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [currentAttempt, submitting]);

  // Auto-save setup
  useEffect(() => {
    if (currentAttempt) {
      const interval = setInterval(() => {
        autoSaveAnswers();
        saveToLocalStorage();
      }, 20000); // 20 seconds
      setAutoSaveInterval(interval);
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        setAutoSaveInterval(null);
      }
    }
  }, [currentAttempt, autoSaveAnswers, saveToLocalStorage]);

  useEffect(() => {
    fetchQuizData();
  }, [quiz.id]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && currentAttempt) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
        // Save time to localStorage
        if (currentAttempt) {
          localStorage.setItem(QUIZ_TIME_LEFT_KEY(quiz.id), (timeLeft - 1).toString());
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentAttempt) {
      handleSubmit();
    }
  }, [timeLeft, currentAttempt, quiz.id]);

  // Handle attemptId from URL - load attempt data if provided
  useEffect(() => {
    if (attemptId && !showResults && !currentAttempt) {
      handleReviewAttempt(attemptId);
    }
  }, [attemptId, showResults, currentAttempt]);

  const fetchQuizData = async () => {
    try {
      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('order_index');

      if (questionsError) throw questionsError;
      
      let processedQuestions = questionsData || [];
      
      // Shuffle questions if enabled
      if (quiz.shuffle_questions) {
        processedQuestions = [...processedQuestions].sort(() => Math.random() - 0.5);
      }
      
      setQuestions(processedQuestions);

      // Fetch user's attempts
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: attemptsData, error: attemptsError } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('quiz_id', quiz.id)
          .eq('student_id', user.id)
          .order('started_at', { ascending: false });

        if (attemptsError) throw attemptsError;
        setAttempts((attemptsData || []) as QuizAttempt[]);

        // Check for in-progress attempt
        const inProgressAttempt = attemptsData?.find(attempt => !attempt.submitted_at);
        
        if (inProgressAttempt) {
          // Resume in-progress attempt
          setIsResuming(true);
          setCurrentAttempt(inProgressAttempt);
          
          // Safely parse answers from JSON and normalize to new format
          const attemptAnswers = inProgressAttempt.answers;
          if (attemptAnswers && typeof attemptAnswers === 'object') {
            setAnswers(normalizeAnswers(attemptAnswers));
          }
          
          // Calculate time left if there's a time limit
          if (quiz.time_limit) {
            const startedAt = new Date(inProgressAttempt.started_at);
            const now = new Date();
            const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
            const totalTimeSeconds = quiz.time_limit * 60;
            const remainingTime = Math.max(0, totalTimeSeconds - elapsedSeconds);
            
            if (remainingTime > 0) {
              setTimeLeft(remainingTime);
            } else {
              // Time expired, auto-submit
              handleSubmit();
              return;
            }
          }

          toast({
            title: t('quizTaker.quizResumed'),
            description: t('quizTaker.previousAttemptResumed'),
          });
        } else {
          // Check localStorage for unsaved data
          const savedData = loadFromLocalStorage();
          if (savedData) {
            // Show dialog to restore or discard
            if (window.confirm(t('quizTaker.foundUnsavedData'))) {
              setCurrentAttempt(savedData.attempt);
              setAnswers(savedData.answers);
              setTimeLeft(savedData.timeLeft);
              
                             toast({
                 title: t('quizTaker.quizRestored'),
                 description: t('quizTaker.unsavedProgressRestored'),
               });
            } else {
              clearLocalStorage();
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching quiz data:', error);
             toast({
         title: t('quizTaker.error'),
         description: t('quizTaker.failedToLoadQuizData'),
         variant: 'destructive',
       });
    } finally {
      setLoading(false);
    }
  };

  const startAttempt = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: quiz.id,
          student_id: user.id,
          answers: {},
          max_score: questions.reduce((sum, q) => sum + q.points, 0)
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentAttempt(data);
      setAnswers({});
      setCurrentQuestionIndex(0);
      
      if (quiz.time_limit) {
        setTimeLeft(quiz.time_limit * 60);
      }

      // Clear any previous localStorage data
      clearLocalStorage();

             toast({
         title: t('quizTaker.quizStarted'),
         description: t('quizTaker.goodLuck'),
       });
    } catch (error: any) {
      console.error('Error starting attempt:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: createAnswerEntry(answer) }));
    if (currentAttempt) {
      setSubmitDisabled(true);
      setTimeout(() => {
        autoSaveAnswers();
        saveToLocalStorage();
        setSubmitDisabled(false);
      }, 500); // Debounce for 0.5s
    }
  };

  const handleSubmit = async () => {
    if (!currentAttempt || submitDisabled) return;
    setSubmitting(true);
    try {
      // Flush any pending answer state
      await new Promise(resolve => setTimeout(resolve, 10));
      // Calculate score using the new utility function
      const score = calculateScoreUtil(answers, questions);
      const { error } = await supabase
        .from('quiz_attempts')
        .update({
          answers,
          score,
          submitted_at: new Date().toISOString()
        })
        .eq('id', currentAttempt.id);
      if (error) throw error;
      clearLocalStorage();
      setAnswers({});
      setCurrentAttempt(null);
      setIsResuming(false);
      setQuizResults({
        score,
        maxScore: currentAttempt.max_score,
        questions,
        userAnswers: answers
      });
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        setAutoSaveInterval(null);
      }
      if (quiz.show_results) {
        setShowResults(true);
        // Update URL to include attempt ID for persistence
        const newUrl = `/courses/${courseId}/progress/quiz/${quiz.id}/attempt/${currentAttempt.id}`;
        window.history.replaceState({}, '', newUrl);
      } else {
                 toast({
           title: t('quizTaker.quizSubmitted'),
           description: t('quizTaker.quizSubmittedSuccessfully'),
         });
        onBackToCourse();
      }
      setTimeLeft(null);
      fetchQuizData();
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleReviewAttempt = async (attemptId: string) => {
    try {
      // Fetch the specific attempt with its answers
      const { data: attemptData, error: attemptError } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('id', attemptId)
        .single();

      if (attemptError) throw attemptError;

      // Fetch the questions for this quiz
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('order_index');

      if (questionsError) throw questionsError;

      // Process the questions to ensure they have the correct structure
      const processedQuestions = questionsData.map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        correct_answer: q.correct_answer || ''
      }));

      // Keep the full answer structure to preserve isCorrect flags
      const processedAnswers = attemptData.answers || {};

      setQuizResults({
        score: attemptData.score,
        maxScore: attemptData.max_score,
        questions: processedQuestions,
        userAnswers: processedAnswers
      });
      setShowResults(true);
      
      // Update URL to include attempt ID for persistence
      const newUrl = `/courses/${courseId}/progress/quiz/${quiz.id}/attempt/${attemptId}`;
      window.history.replaceState({}, '', newUrl);
    } catch (error: any) {
      console.error('Error fetching attempt data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load attempt data',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <QuizTakerSkeleton onBackToCourse={onBackToCourse} />;
  }

  if (showResults && quizResults) {
    return (
      <div className="min-h-screen p-2 sm:p-4 md:p-6">
        <QuizResults
          score={quizResults.score}
          maxScore={quizResults.maxScore}
          questions={quizResults.questions}
          userAnswers={quizResults.userAnswers}
          showCorrectAnswers={quiz.show_correct_answers}
          onBackToCourse={onBackToCourse}
          onBackToQuiz={() => {
            setShowResults(false);
            setQuizResults(null);
            // Update URL to remove attempt ID and go back to quiz home
            const newUrl = `/courses/${courseId}/progress/quiz/${quiz.id}`;
            window.history.replaceState({}, '', newUrl);
          }}
        />
      </div>
    );
  }

  const canAttempt = attempts.length < quiz.max_attempts;
  const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;
  const bestMaxScore = attempts.length > 0 ? attempts[0].max_score : 0;

  if (currentAttempt) {
    const currentQuestion = questions[currentQuestionIndex];
    const answeredCount = Object.keys(answers).length;
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen mt-4 sm:mt-0 mb-10 sm:mb-0">
        <div className="container mx-auto p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          {/* Resume Warning Banner */}
          {isResuming && (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200 text-sm sm:text-base">
                      {t('quizTaker.quizResumed')}
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">
                      {t('quizTaker.quizResumedDescription')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsResuming(false)}
                    className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 text-xs sm:text-sm"
                  >
                    {t('quizTaker.dismiss')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Header */}
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 shadow-xl">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3 sm:gap-4">
                <div className="flex-1">
                                                       <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Trophy className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                    </div>
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold min-w-0">{quiz.title}</h1>
                  </div>
                  <p className="text-primary-foreground/80 mb-3 sm:mb-4 text-xs sm:text-sm md:text-base">{quiz.description}</p>
                  
                  {/* Stats Row */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 md:gap-6 text-xs sm:text-sm">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Target className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="min-w-0">{t('quizTaker.question')} {currentQuestionIndex + 1} {t('quizTaker.of')} {questions.length}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="min-w-0">{answeredCount} {t('quizTaker.answered')}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="min-w-0">{questions.length - answeredCount} {t('quizTaker.remaining')}</span>
                    </div>
                    {/* Auto-save Status */}
                    <div className="flex items-center gap-1 sm:gap-2">
                      {autoSaveStatus === 'saving' && (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white flex-shrink-0"></div>
                          <span className="text-xs sm:text-sm min-w-0">{t('quizTaker.saving')}</span>
                        </>
                      )}
                      {autoSaveStatus === 'saved' && (
                        <>
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="text-xs sm:text-sm min-w-0">{t('quizTaker.allChangesSaved')}</span>
                        </>
                      )}
                      {autoSaveStatus === 'error' && (
                        <>
                          <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="text-xs sm:text-sm min-w-0">{t('quizTaker.saveFailed')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 lg:mt-0">
                  <QuizTimer timeLeft={timeLeft} totalTime={quiz.time_limit ? quiz.time_limit * 60 : undefined} />
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4 sm:mt-6">
                <div className="w-full bg-white/20 rounded-full h-2 sm:h-3 overflow-hidden">
                  <div 
                    className="bg-white h-2 sm:h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <QuizNavigation
            questions={questions}
            currentQuestion={currentQuestionIndex}
            answers={answers}
            onQuestionSelect={goToQuestion}
            allowNavigation={quiz.question_navigation}
          />

          {/* Question - Full width without AI Assistant card */}
          <QuizQuestion
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            answer={answers[currentQuestion.id]?.answer || ''}
            onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
          />

          {/* Navigation Controls */}
          <Card className="border-primary/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">{t('quizTaker.previous')}</span>
                </Button>

                <div className="flex gap-2 w-full sm:w-auto">
                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button 
                      onClick={handleSubmit} 
                      disabled={submitting || submitDisabled}
                      className="px-4 sm:px-6 md:px-8 w-full sm:w-auto"
                    >
                      <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm md:text-base">
                        {submitting ? t('quizTaker.submitting') : t('quizTaker.submitQuiz')}
                      </span>
                    </Button>
                  ) : (
                    <Button 
                      onClick={nextQuestion}
                      className="px-4 sm:px-6 md:px-8 w-full sm:w-auto"
                    >
                      <span className="text-xs sm:text-sm md:text-base">{t('quizTaker.next')}</span>
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-4 sm:mt-0 mb-10 sm:mb-0">
      <div className="container mx-auto p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6">


        <Card className="border-primary/20 shadow-xl">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xl sm:text-2xl md:text-3xl">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-primary to-primary/80 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary-foreground" />
              </div>
              {quiz.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 sm:space-y-8 p-3 sm:p-4 md:p-6">
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">{quiz.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{t('quizTaker.quizInformation')}</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center p-3 sm:p-4 bg-muted/50 rounded-lg sm:rounded-xl border">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <span className="font-medium text-sm sm:text-base">{t('quizTaker.questions')}</span>
                    </div>
                    <Badge variant="outline" className="text-sm sm:text-base md:text-lg px-2 py-1 sm:px-3 sm:py-1">{questions.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 sm:p-4 bg-muted/50 rounded-lg sm:rounded-xl border">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <span className="font-medium text-sm sm:text-base">{t('quizTaker.maxAttempts')}</span>
                    </div>
                    <Badge variant="outline" className="text-sm sm:text-base md:text-lg px-2 py-1 sm:px-3 sm:py-1">{quiz.max_attempts}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 sm:p-4 bg-muted/50 rounded-lg sm:rounded-xl border">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <span className="font-medium text-sm sm:text-base">{t('quizTaker.attemptsUsed')}</span>
                    </div>
                    <Badge 
                      variant={attempts.length >= quiz.max_attempts ? "destructive" : "default"}
                      className="text-sm sm:text-base md:text-lg px-2 py-1 sm:px-3 sm:py-1"
                    >
                      {attempts.length}
                    </Badge>
                  </div>
                  {quiz.time_limit && (
                    <div className="flex justify-between items-center p-3 sm:p-4 bg-muted/50 rounded-lg sm:rounded-xl border">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        <span className="font-medium text-sm sm:text-base">{t('quizTaker.timeLimit')}:</span>
                      </div>
                      <Badge variant="outline" className="text-sm sm:text-base md:text-lg px-2 py-1 sm:px-3 sm:py-1">
                        {quiz.time_limit} {t('quizTaker.minutes')}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {attempts.length > 0 && (
                  <div className="p-4 sm:p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg sm:rounded-xl border border-primary/20">
                    <h4 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">{t('quizTaker.yourBestScore')}</h4>
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2">
                      {bestScore}/{bestMaxScore}
                    </div>
                    <div className="text-sm sm:text-base md:text-lg text-primary/80">
                      {Math.round((bestScore / bestMaxScore) * 100)}% {t('quizTaker.complete')}
                    </div>
                  </div>
                )}

                {attempts.length > 0 && (
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="font-semibold text-base sm:text-lg">{t('quizTaker.previousAttempts')}</h4>
                    <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
                      {attempts.map((attempt, index) => (
                        <div key={attempt.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-muted/50 rounded-lg sm:rounded-xl border">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs sm:text-sm">
                              {attempts.length - index}
                            </div>
                            <span className="font-medium text-sm sm:text-base">{t('quizTaker.attempt')} {attempts.length - index}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                            <Badge variant={attempt.score >= attempt.max_score * 0.7 ? 'default' : 'destructive'} className="text-xs sm:text-sm">
                              {attempt.score}/{attempt.max_score}
                            </Badge>
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              {new Date(attempt.submitted_at).toLocaleDateString()}
                            </span>
                            {quiz.allow_review && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReviewAttempt(attempt.id)}
                                className="text-xs sm:text-sm"
                              >
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                {t('quizTaker.review')}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center pt-3 sm:pt-4">
              {canAttempt ? (
                <Button 
                  onClick={startAttempt} 
                  size="lg" 
                  className="px-6 sm:px-8 md:px-12 py-3 sm:py-4 text-sm sm:text-base md:text-lg w-full sm:w-auto"
                >
                  <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2 sm:mr-3" />
                  {attempts.length === 0 ? t('quizTaker.startQuiz') : t('quizTaker.startNewAttempt')}
                </Button>
              ) : (
                <div className="p-4 sm:p-6 md:p-8 bg-muted/50 rounded-lg sm:rounded-xl border-2 border-dashed">
                  <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <p className="text-lg sm:text-xl font-semibold text-muted-foreground mb-2">{t('quizTaker.noMoreAttempts')}</p>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {t('quizTaker.usedAllAttempts', { maxAttempts: quiz.max_attempts })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
