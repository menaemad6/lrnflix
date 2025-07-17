import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { QuizNavigation } from '@/components/quizzes/QuizNavigation';
import { QuizTimer } from '@/components/quizzes/QuizTimer';
import { QuizQuestion } from '@/components/quizzes/QuizQuestion';
import { QuizResults } from '@/components/quizzes/QuizResults';
import { Clock, CheckCircle, ArrowLeft, PlayCircle, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { useRandomBackground } from "../../hooks/useRandomBackground";

interface Quiz {
  id: string;
  title: string;
  description: string;
  max_attempts: number;
  time_limit: number | null;
  course_id: string;
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
}

export const QuizTaker = () => {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);

  const bgClass = useRandomBackground();

  useEffect(() => {
    if (courseId && quizId) {
      fetchQuizData();
      checkEnrollment();
    }
  }, [courseId, quizId]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && currentAttempt) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentAttempt) {
      handleSubmit();
    }
  }, [timeLeft, currentAttempt]);

  const checkEnrollment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('*')
          .eq('course_id', courseId)
          .eq('student_id', user.id)
          .maybeSingle();

        setIsEnrolled(!!enrollment);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

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

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index');

      if (questionsError) throw questionsError;
      
      let processedQuestions = questionsData || [];
      
      // Shuffle questions if enabled
      if (quizData.shuffle_questions) {
        processedQuestions = [...processedQuestions].sort(() => Math.random() - 0.5);
      }
      
      setQuestions(processedQuestions);

      // Fetch user's attempts
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: attemptsData, error: attemptsError } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('quiz_id', quizId)
          .eq('student_id', user.id)
          .order('started_at', { ascending: false });

        if (attemptsError) throw attemptsError;
        setAttempts(attemptsData || []);
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
          quiz_id: quizId,
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
      
      if (quiz?.time_limit) {
        setTimeLeft(quiz.time_limit * 60);
      }

      toast({
        title: 'Quiz Started',
        description: 'Good luck!',
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

      setQuizResults({
        score,
        maxScore: currentAttempt.max_score,
        questions,
        userAnswers: answers
      });

      if (quiz?.show_results) {
        setShowResults(true);
      } else {
        toast({
          title: 'Quiz Submitted',
          description: 'Your quiz has been submitted successfully!',
        });
        navigate(`/courses/${courseId}`);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quiz || !isEnrolled) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              {!isEnrolled ? 'You need to be enrolled in this course to take the quiz.' : 'Quiz not found.'}
            </p>
            <Button onClick={() => navigate(`/courses/${courseId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults && quizResults) {
    return (
      <div className="container mx-auto p-6">
        <QuizResults
          score={quizResults.score}
          maxScore={quizResults.maxScore}
          questions={quizResults.questions}
          userAnswers={quizResults.userAnswers}
          showCorrectAnswers={quiz.show_correct_answers}
          onBackToCourse={() => navigate(`/courses/${courseId}`)}
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
      <div className={bgClass + " container mx-auto p-6 space-y-6"}>
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">{quiz.title}</h1>
                <p className="text-blue-100 mt-1">{quiz.description}</p>
              </div>
              <QuizTimer timeLeft={timeLeft} totalTime={quiz.time_limit ? quiz.time_limit * 60 : undefined} />
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span>{answeredCount} answered</span>
              </div>
              <div className="w-full bg-blue-800 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
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

        {/* Question */}
        <QuizQuestion
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          answer={answers[currentQuestion.id] || ''}
          onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
        />

        {/* Navigation Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-2">
                {currentQuestionIndex === questions.length - 1 ? (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                  </Button>
                ) : (
                  <Button onClick={nextQuestion}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={bgClass + " container mx-auto p-6 space-y-6"}>
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(`/courses/${courseId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <CheckCircle className="h-6 w-6 text-green-500" />
            {quiz.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-lg">{quiz.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                <span className="font-medium">Questions:</span>
                <Badge variant="outline">{questions.length}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                <span className="font-medium">Max Attempts:</span>
                <Badge variant="outline">{quiz.max_attempts}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                <span className="font-medium">Attempts Used:</span>
                <Badge variant={attempts.length >= quiz.max_attempts ? "destructive" : "secondary"}>
                  {attempts.length}
                </Badge>
              </div>
              {quiz.time_limit && (
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <span className="font-medium">Time Limit:</span>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {quiz.time_limit} minutes
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {attempts.length > 0 && (
                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-medium mb-3">Best Score:</h4>
                  <div className="text-3xl font-bold text-green-600">
                    {bestScore}/{bestMaxScore}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round((bestScore / bestMaxScore) * 100)}%
                  </div>
                </div>
              )}
            </div>
          </div>

          {attempts.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Previous Attempts:</h4>
              <div className="space-y-2">
                {attempts.map((attempt, index) => (
                  <div key={attempt.id} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <span>Attempt {attempts.length - index}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={attempt.score >= attempt.max_score * 0.7 ? 'default' : 'secondary'}>
                        {attempt.score}/{attempt.max_score}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(attempt.submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {canAttempt ? (
            <Button onClick={startAttempt} size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <PlayCircle className="h-5 w-5 mr-2" />
              {attempts.length === 0 ? 'Start Quiz' : 'Start New Attempt'}
            </Button>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-lg font-medium text-gray-600">No more attempts available</p>
              <p className="text-sm text-muted-foreground mt-1">
                You have used all {quiz.max_attempts} attempts for this quiz
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
