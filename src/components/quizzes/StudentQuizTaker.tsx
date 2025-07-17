
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { QuizNavigation } from './QuizNavigation';
import { QuizTimer } from './QuizTimer';
import { QuizQuestion } from './QuizQuestion';
import { QuizResults } from './QuizResults';
import { ArrowLeft, PlayCircle, ChevronLeft, ChevronRight, Send, Trophy, Target, BookOpen, CheckCircle, Eye, Clock, AlertTriangle } from 'lucide-react';

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
}

// Local storage keys
const QUIZ_ANSWERS_KEY = (quizId: string) => `quiz_answers_${quizId}`;
const QUIZ_ATTEMPT_KEY = (quizId: string) => `quiz_attempt_${quizId}`;
const QUIZ_TIME_LEFT_KEY = (quizId: string) => `quiz_time_left_${quizId}`;

export const StudentQuizTaker = ({ quiz, courseId, onBackToCourse }: StudentQuizTakerProps) => {
  const { toast } = useToast();
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [isResuming, setIsResuming] = useState(false);

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
          
          // Safely parse answers from JSON
          const attemptAnswers = inProgressAttempt.answers;
          if (attemptAnswers && typeof attemptAnswers === 'object') {
            setAnswers(attemptAnswers as Record<string, string>);
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
            title: 'Quiz Resumed',
            description: 'Your previous attempt has been resumed.',
          });
        } else {
          // Check localStorage for unsaved data
          const savedData = loadFromLocalStorage();
          if (savedData) {
            // Show dialog to restore or discard
            if (window.confirm('We found unsaved quiz data. Would you like to restore it?')) {
              setCurrentAttempt(savedData.attempt);
              setAnswers(savedData.answers);
              setTimeLeft(savedData.timeLeft);
              
              toast({
                title: 'Quiz Restored',
                description: 'Your unsaved progress has been restored.',
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
        title: 'Error',
        description: 'Failed to load quiz data',
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
        title: 'Quiz Started',
        description: 'Good luck with your quiz!',
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
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    // Auto-save immediately when answer changes
    if (currentAttempt) {
      setTimeout(() => {
        autoSaveAnswers();
        saveToLocalStorage();
      }, 1000); // Debounce for 1 second
    }
  };

  const handleSubmit = async () => {
    if (!currentAttempt) return;

    setSubmitting(true);
    try {
      // Calculate score
      let score = 0;
      questions.forEach(question => {
        const userAnswer = answers[question.id];
        if (userAnswer && question.correct_answer && userAnswer === question.correct_answer) {
          score += question.points;
        }
      });

      const { error } = await supabase
        .from('quiz_attempts')
        .update({
          answers,
          score,
          submitted_at: new Date().toISOString()
        })
        .eq('id', currentAttempt.id);

      if (error) throw error;

      // Clear localStorage immediately after successful submission
      clearLocalStorage();

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
      } else {
        toast({
          title: 'Quiz Submitted',
          description: 'Your quiz has been submitted successfully!',
        });
        onBackToCourse();
      }

      setCurrentAttempt(null);
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

      // Process the answers to ensure they match the question IDs
      const processedAnswers = Object.entries(attemptData.answers || {}).reduce((acc, [questionId, answer]) => {
        acc[questionId] = answer || '';
        return acc;
      }, {} as Record<string, string>);

      setQuizResults({
        score: attemptData.score,
        maxScore: attemptData.max_score,
        questions: processedQuestions,
        userAnswers: processedAnswers
      });
      setShowResults(true);
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showResults && quizResults) {
    return (
      <div className="min-h-screen p-6">
        <QuizResults
          score={quizResults.score}
          maxScore={quizResults.maxScore}
          questions={quizResults.questions}
          userAnswers={quizResults.userAnswers}
          showCorrectAnswers={quiz.show_correct_answers}
          onBackToCourse={onBackToCourse}
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
      <div className="min-h-screen">
        <div className="container mx-auto p-6 space-y-6">
          {/* Resume Warning Banner */}
          {isResuming && (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                      Quiz Resumed
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Your previous attempt has been automatically resumed. All your answers have been restored.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsResuming(false)}
                    className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
                  >
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Header */}
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <h1 className="text-2xl font-bold">{quiz.title}</h1>
                  </div>
                  <p className="text-primary-foreground/80 mb-4">{quiz.description}</p>
                  
                  {/* Stats Row */}
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>{answeredCount} answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>{questions.length - answeredCount} remaining</span>
                    </div>
                    {/* Auto-save Status */}
                    <div className="flex items-center gap-2">
                      {autoSaveStatus === 'saving' && (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      )}
                      {autoSaveStatus === 'saved' && (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>All changes saved</span>
                        </>
                      )}
                      {autoSaveStatus === 'error' && (
                        <>
                          <AlertTriangle className="h-4 w-4" />
                          <span>Save failed</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <QuizTimer timeLeft={timeLeft} totalTime={quiz.time_limit ? quiz.time_limit * 60 : undefined} />
              </div>
              
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-white h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
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
            answer={answers[currentQuestion.id] || ''}
            onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
          />

          {/* Navigation Controls */}
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button 
                      onClick={handleSubmit} 
                      disabled={submitting}
                      className="px-8"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={nextQuestion}
                      className="px-8"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
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
    <div className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBackToCourse}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
        </div>

        <Card className="border-primary/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary-foreground" />
              </div>
              {quiz.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <p className="text-muted-foreground text-lg leading-relaxed">{quiz.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Quiz Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-xl border">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <span className="font-medium">Questions:</span>
                    </div>
                    <Badge variant="outline" className="text-lg px-3 py-1">{questions.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-xl border">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-primary" />
                      <span className="font-medium">Max Attempts:</span>
                    </div>
                    <Badge variant="outline" className="text-lg px-3 py-1">{quiz.max_attempts}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-xl border">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-primary" />
                      <span className="font-medium">Attempts Used:</span>
                    </div>
                    <Badge 
                      variant={attempts.length >= quiz.max_attempts ? "destructive" : "secondary"}
                      className="text-lg px-3 py-1"
                    >
                      {attempts.length}
                    </Badge>
                  </div>
                  {quiz.time_limit && (
                    <div className="flex justify-between items-center p-4 bg-muted/50 rounded-xl border">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-primary" />
                        <span className="font-medium">Time Limit:</span>
                      </div>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {quiz.time_limit} minutes
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {attempts.length > 0 && (
                  <div className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                    <h4 className="font-semibold text-lg mb-3">Your Best Score</h4>
                    <div className="text-4xl font-bold text-primary mb-2">
                      {bestScore}/{bestMaxScore}
                    </div>
                    <div className="text-lg text-primary/80">
                      {Math.round((bestScore / bestMaxScore) * 100)}% Complete
                    </div>
                  </div>
                )}

                {attempts.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Previous Attempts</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {attempts.map((attempt, index) => (
                        <div key={attempt.id} className="flex justify-between items-center p-4 bg-muted/50 rounded-xl border">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                              {attempts.length - index}
                            </div>
                            <span className="font-medium">Attempt {attempts.length - index}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={attempt.score >= attempt.max_score * 0.7 ? 'default' : 'secondary'}>
                              {attempt.score}/{attempt.max_score}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(attempt.submitted_at).toLocaleDateString()}
                            </span>
                            {quiz.allow_review && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReviewAttempt(attempt.id)}
                                className="ml-2"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Review
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

            <div className="text-center pt-4">
              {canAttempt ? (
                <Button 
                  onClick={startAttempt} 
                  size="lg" 
                  className="px-12 py-4 text-lg"
                >
                  <PlayCircle className="h-6 w-6 mr-3" />
                  {attempts.length === 0 ? 'Start Quiz' : 'Start New Attempt'}
                </Button>
              ) : (
                <div className="p-8 bg-muted/50 rounded-xl border-2 border-dashed">
                  <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl font-semibold text-muted-foreground mb-2">No More Attempts Available</p>
                  <p className="text-muted-foreground">
                    You have used all {quiz.max_attempts} attempts for this quiz
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
