
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface QuizTimerProps {
  timeLeft: number | null;
  totalTime?: number;
}

export const QuizTimer = ({ timeLeft, totalTime }: QuizTimerProps) => {
  const { t } = useTranslation('courses');
  if (timeLeft === null) return null;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const percentage = totalTime ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  const isWarning = timeLeft < (totalTime / 3); // 5 minutes
  const isCritical = timeLeft < 60; // 1 minute

  return (
    <Card className={`border-2 ${isCritical ? 'border-destructive animate-pulse' : isWarning ? 'border-orange-500' : 'border-primary'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className={`h-5 w-5 ${isCritical ? 'text-destructive' : isWarning ? 'text-orange-500' : 'text-primary'}`} />
            <span className="text-sm font-medium text-muted-foreground">{t('quizTimer.timeRemaining')}</span>
          </div>
          {isWarning && (
            <AlertTriangle className={`h-4 w-4 ${isCritical ? 'text-destructive' : 'text-orange-500'}`} />
          )}
        </div>
        
        <div className="mt-2">
          <div className={`text-2xl font-bold ${isCritical ? 'text-destructive' : isWarning ? 'text-orange-600' : 'text-primary'}`}>
            {formatTime(timeLeft)}
          </div>
          
          {totalTime && (
            <div className="mt-2">
              <div className="w-full bg-primary full rounded h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    isCritical ? 'bg-destructive' : isWarning ? 'bg-orange-500' : 'bg-muted'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
