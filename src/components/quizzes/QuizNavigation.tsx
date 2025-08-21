
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface QuizNavigationProps {
  questions: any[];
  currentQuestion: number;
  answers: Record<string, string>;
  onQuestionSelect: (index: number) => void;
  allowNavigation?: boolean;
}

export const QuizNavigation = ({ 
  questions, 
  currentQuestion, 
  answers,
  onQuestionSelect,
  allowNavigation = true 
}: QuizNavigationProps) => {
  const { t } = useTranslation('courses');
  const answeredCount = Object.keys(answers).length;
  const remainingCount = questions.length - answeredCount;

  if (!allowNavigation) return null;

  return (
    <Card className="mb-6 border-primary/20">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg text-foreground">{t('quizNavigation.questionNavigation')}</h3>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-foreground">{t('quizNavigation.answered', { count: answeredCount })}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-foreground">{t('quizNavigation.remaining', { count: remainingCount })}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {questions.map((_, index) => {
              const isAnswered = answers[questions[index].id];
              const isCurrent = index === currentQuestion;
              
              return (
                <Button
                  key={index}
                  variant={isCurrent ? "default" : isAnswered ? "outline" : "ghost"}
                  size="sm"
                  className={`relative h-10 w-10 p-0 ${
                    isCurrent 
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                      : isAnswered 
                        ? "border-primary text-primary hover:bg-primary/5" 
                        : "hover:bg-muted"
                  }`}
                  onClick={() => onQuestionSelect(index)}
                >
                  {index + 1}
                  {isAnswered && !isCurrent && (
                    <CheckCircle2 className="absolute -top-1 -right-1 h-3 w-3 text-primary bg-background rounded-full" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
