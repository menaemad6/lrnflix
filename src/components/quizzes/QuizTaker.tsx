
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle } from 'lucide-react';
import { createAnswerEntry, calculateScore as calculateScoreUtil } from '@/utils/quizAnswerUtils';

interface Question {
  id: string;
  question_text: string;
  question_type: 'mcq' | 'written';
  options?: string[];
  points: number;
  order_index: number;
  question_image?: string | null;
}

interface QuizTakerProps {
  quizId: string;
  onComplete: () => void;
}

export const QuizTaker = ({ quizId, onComplete }: QuizTakerProps) => {
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<{ title?: string; description?: string; time_limit?: number } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, { answer: string; isCorrect: boolean | null }>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState<string>('');

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && quiz?.time_limit) {
      handleSubmit();
    }
  }, [timeRemaining]);

  const fetchQuizData = async () => {
    try {
      // Fetch quiz details
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizError) throw quizError;

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index');

      if (questionsError) throw questionsError;

      // Transform questions to match our interface
      const transformedQuestions: Question[] = questionsData?.map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type as 'mcq' | 'written',
        options: q.options ? (Array.isArray(q.options) ? q.options : JSON.parse(q.options as string)) : undefined,
        points: q.points || 1,
        order_index: q.order_index,
        question_image: q.question_image || null
      })) || [];

      // Start attempt
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: attempt, error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: quizId,
          student_id: user.id
        })
        .select()
        .single();

      if (attemptError) throw attemptError;

      setQuiz(quizData);
      setQuestions(transformedQuestions);
      setAttemptId(attempt.id);
      setTimeRemaining(quizData.time_limit ? quizData.time_limit * 60 : 0);
    } catch (error: unknown) {
      console.error('Error fetching quiz:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: createAnswerEntry(answer) });
  };

  const calculateScore = () => {
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
    const score = calculateScoreUtil(answers, questions);
    return { score, maxScore };
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { score, maxScore } = calculateScore();

      const { error } = await supabase
        .from('quiz_attempts')
        .update({
          submitted_at: new Date().toISOString(),
          answers: answers,
          score: score,
          max_score: maxScore
        })
        .eq('id', attemptId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Quiz submitted successfully!',
      });

      onComplete();
    } catch (error: unknown) {
      console.error('Error submitting quiz:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div>Loading quiz...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {quiz?.title}
            {quiz?.time_limit && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                {formatTime(timeRemaining)}
              </div>
            )}
          </CardTitle>
          {quiz?.description && (
            <p className="text-muted-foreground">{quiz.description}</p>
          )}
        </CardHeader>
      </Card>

      {questions.map((question, index) => (
        <Card key={question.id}>
          <CardHeader>
            <CardTitle className="text-lg">
              Question {index + 1} ({question.points} points)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{question.question_text}</p>
            
            {question.question_image && (
              <div className="mb-4">
                <img
                  src={question.question_image}
                  alt="Question"
                  className="max-w-full max-h-64 object-contain rounded-lg border border-border"
                />
              </div>
            )}
            
            {question.question_type === 'mcq' ? (
              <RadioGroup
                value={answers[question.id]?.answer || ''}
                onValueChange={(value) => handleAnswerChange(question.id, value)}
              >
                {question.options?.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${question.id}-${optIndex}`} />
                    <Label htmlFor={`${question.id}-${optIndex}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <Textarea
                placeholder="Enter your answer..."
                value={answers[question.id]?.answer || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                rows={4}
              />
            )}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full"
            size="lg"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
