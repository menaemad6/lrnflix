
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle } from 'lucide-react';

interface QuizQuestionProps {
  question: any;
  questionNumber: number;
  totalQuestions: number;
  answer: string;
  onAnswerChange: (answer: string) => void;
}

export const QuizQuestion = ({ 
  question, 
  questionNumber, 
  totalQuestions, 
  answer, 
  onAnswerChange 
}: QuizQuestionProps) => {
  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-muted/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
            Question {questionNumber} of {totalQuestions}
          </Badge>
          <Badge variant={answer ? "default" : "secondary"} className="flex items-center gap-1">
            {answer ? <CheckCircle className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
            {answer ? "Answered" : "Not Answered"}
          </Badge>
        </div>
        <CardTitle className="text-xl leading-relaxed text-foreground">
          {question.question_text}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Points: {question.points}</span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {question.question_type === 'mcq' ? (
          <RadioGroup
            value={answer || ''}
            onValueChange={onAnswerChange}
            className="space-y-3"
          >
            {question.options?.options?.map((option: string, index: number) => (
              <div 
                key={index} 
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all hover:bg-primary/5 cursor-pointer ${
                  answer === option 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem 
                  value={option} 
                  id={`option-${index}`}
                  className="text-primary border-primary"
                />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="flex-1 cursor-pointer font-medium text-foreground"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Your Answer:
            </Label>
            <Textarea
              placeholder="Enter your answer here..."
              value={answer || ''}
              onChange={(e) => onAnswerChange(e.target.value)}
              rows={6}
              className="resize-none border-2 focus:border-primary bg-background"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
