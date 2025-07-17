import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import { PdfQuestionExtractor } from './PdfQuestionExtractor';

interface Question {
  id: string;
  question_text: string;
  question_type: 'mcq' | 'written';
  options?: string[];
  correct_answer?: string;
  points: number;
}

interface QuizCreatorProps {
  courseId: string;
  onQuizCreated: () => void;
  onCancel: () => void;
}

export const QuizCreator = ({ courseId, onQuizCreated, onCancel }: QuizCreatorProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    type: 'quiz' as 'quiz' | 'assignment',
    time_limit: 60,
    max_attempts: 1
  });
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      question_text: '',
      question_type: 'mcq',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleExtractedQuestions = (extractedQuestions: any[]) => {
    const newQuestions: Question[] = extractedQuestions.map(q => ({
      id: Math.random().toString(36).substr(2, 9),
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.question_type === 'mcq' ? (q.options || ['', '', '', '']) : ['', '', '', ''],
      correct_answer: q.correct_answer || '',
      points: q.points
    }));
    
    setQuestions([...questions, ...newQuestions]);
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, options: q.options?.map((opt, idx) => idx === optionIndex ? value : opt) }
        : q
    ));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          course_id: courseId,
          title: quizData.title,
          description: quizData.description,
          type: quizData.type,
          time_limit: quizData.time_limit,
          max_attempts: quizData.max_attempts
        })
        .select()
        .single();

      if (quizError) throw quizError;

      // Create questions
      if (questions.length > 0) {
        const questionsToInsert = questions.map((q, index) => ({
          quiz_id: quiz.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.question_type === 'mcq' ? q.options : null,
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
        description: `${quizData.type === 'quiz' ? 'Quiz' : 'Assignment'} created successfully!`,
      });

      onQuizCreated();
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Create {quizData.type === 'quiz' ? 'Quiz' : 'Assignment'}</CardTitle>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Quiz/Assignment Title"
              value={quizData.title}
              onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
              required
            />
            <Select value={quizData.type} onValueChange={(value: 'quiz' | 'assignment') => setQuizData({ ...quizData, type: value })}>
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
            placeholder="Description"
            value={quizData.description}
            onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Time Limit (minutes)</label>
              <Input
                type="number"
                value={quizData.time_limit}
                onChange={(e) => setQuizData({ ...quizData, time_limit: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Attempts</label>
              <Input
                type="number"
                value={quizData.max_attempts}
                onChange={(e) => setQuizData({ ...quizData, max_attempts: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Questions</h3>
              <Button type="button" onClick={addQuestion} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            <PdfQuestionExtractor onQuestionsExtracted={handleExtractedQuestions} />

            {questions.map((question, index) => (
              <Card key={question.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeQuestion(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Textarea
                    placeholder="Question text"
                    value={question.question_text}
                    onChange={(e) => updateQuestion(question.id, 'question_text', e.target.value)}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <Select
                      value={question.question_type}
                      onValueChange={(value) => updateQuestion(question.id, 'question_type', value)}
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
                      onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value))}
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
                            onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                          />
                          <Button
                            type="button"
                            variant={question.correct_answer === option ? "default" : "outline"}
                            onClick={() => updateQuestion(question.id, 'correct_answer', option)}
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
                      onChange={(e) => updateQuestion(question.id, 'correct_answer', e.target.value)}
                    />
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating...' : `Create ${quizData.type === 'quiz' ? 'Quiz' : 'Assignment'}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
