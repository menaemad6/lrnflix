
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
    <Card className="mb-4 sm:mb-6 border-primary/20">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <h3 className="font-semibold text-base sm:text-lg text-foreground">{t('quizNavigation.questionNavigation')}</h3>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span className="text-foreground">{t('quizNavigation.answered', { count: answeredCount })}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                <span className="text-foreground">{t('quizNavigation.remaining', { count: remainingCount })}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5 sm:gap-2">
            {questions.map((_, index) => {
              const isAnswered = answers[questions[index].id];
              const isCurrent = index === currentQuestion;
              
              return (
                <Button
                  key={index}
                  variant={isCurrent ? "default" : isAnswered ? "outline" : "ghost"}
                  size="sm"
                  className={`relative h-8 w-8 sm:h-10 sm:w-10 p-0 text-xs sm:text-sm ${
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
                    <CheckCircle2 className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary bg-background rounded-full" />
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
