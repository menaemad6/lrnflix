
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle, XCircle, PlayCircle } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  max_attempts: number;
  time_limit: number | null;
}

interface QuizAttempt {
  id: string;
  score: number;
  max_score: number;
  submitted_at: string;
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

interface EnhancedQuizTakerProps {
  quizId: string;
  courseId: string;
  isEnrolled: boolean;
}

export const EnhancedQuizTaker = ({ quizId, courseId, isEnrolled }: EnhancedQuizTakerProps) => {
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && currentAttempt) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentAttempt) {
      handleSubmit();
    }
  }, [timeLeft, currentAttempt]);

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

      // Fetch user's attempts if enrolled
      if (isEnrolled) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: attemptsData, error: attemptsError } = await supabase
            .from('quiz_attempts')
            .select('*')
            .eq('quiz_id', quizId)
            .eq('student_id', user.id)
            .order('submitted_at', { ascending: false });

          if (attemptsError) throw attemptsError;
          setAttempts(attemptsData || []);
        }
      }

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index');

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);
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
      
      if (quiz?.time_limit) {
        setTimeLeft(quiz.time_limit * 60); // Convert minutes to seconds
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

      toast({
        title: 'Quiz Submitted',
        description: `Your score: ${score}/${currentAttempt.max_score}`,
      });

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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div>Loading quiz...</div>;
  }

  if (!quiz) {
    return <div>Quiz not found</div>;
  }

  if (!isEnrolled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            {quiz.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{quiz.description}</p>
          <Badge variant="destructive">Enrollment Required</Badge>
          <p className="text-sm text-muted-foreground mt-2">
            You need to enroll in this course to take the quiz.
          </p>
        </CardContent>
      </Card>
    );
  }

  const canAttempt = attempts.length < quiz.max_attempts;
  const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;
  const bestMaxScore = attempts.length > 0 ? attempts[0].max_score : 0;

  if (currentAttempt) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{quiz.title}</CardTitle>
            {timeLeft !== null && (
              <Badge variant={timeLeft < 300 ? 'destructive' : 'default'}>
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(timeLeft)}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-3">
              <h4 className="font-medium">
                {index + 1}. {question.question_text}
                <span className="text-sm text-muted-foreground ml-2">
                  ({question.points} points)
                </span>
              </h4>
              
              {question.question_type === 'multiple_choice' && (
                <div className="space-y-2">
                  {question.options?.options?.map((option: string, optionIndex: number) => (
                    <label key={optionIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="text-primary"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSubmit} 
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          {quiz.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{quiz.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Max Attempts:</span> {quiz.max_attempts}
          </div>
          <div>
            <span className="font-medium">Attempts Used:</span> {attempts.length}
          </div>
          {quiz.time_limit && (
            <div>
              <span className="font-medium">Time Limit:</span> {quiz.time_limit} minutes
            </div>
          )}
          {attempts.length > 0 && (
            <div>
              <span className="font-medium">Best Score:</span> {bestScore}/{bestMaxScore}
            </div>
          )}
        </div>

        {attempts.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Previous Attempts:</h4>
            {attempts.map((attempt, index) => (
              <div key={attempt.id} className="flex justify-between items-center p-2 bg-muted rounded">
                <span>Attempt {attempts.length - index}</span>
                <Badge variant={attempt.score >= attempt.max_score * 0.7 ? 'default' : 'secondary'}>
                  {attempt.score}/{attempt.max_score}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {canAttempt ? (
          <Button onClick={startAttempt} className="w-full">
            <PlayCircle className="h-4 w-4 mr-2" />
            {attempts.length === 0 ? 'Start Quiz' : 'Retake Quiz'}
          </Button>
        ) : (
          <Badge variant="secondary" className="w-full justify-center py-2">
            No more attempts available
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};
