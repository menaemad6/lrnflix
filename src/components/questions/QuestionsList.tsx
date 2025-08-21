
import React from 'react';
import { QuestionCard } from './QuestionCard';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Question {
  id: string;
  title: string;
  content: string;
  is_anonymous: boolean;
  allow_student_answers: boolean;
  created_at: string;
  updated_at: string;
  status: string;
  student_id: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
  answer_count?: number;
}

interface QuestionsListProps {
  questions: Question[];
  loading: boolean;
  onQuestionUpdate: () => void;
  onQuestionClick: (questionId: string) => void;
}

export const QuestionsList: React.FC<QuestionsListProps> = ({
  questions,
  loading,
  onQuestionUpdate,
  onQuestionClick
}) => {
  const { t } = useTranslation('other');
  
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="group glass-card border-0 hover-glow transition-all duration-300 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm shadow-lg hover:shadow-xl">
            <CardContent className="p-6 space-y-6">
              <div className="animate-pulse space-y-4">
                {/* Status badges skeleton */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="h-6 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full w-20 border border-primary/20"></div>
                  <div className="h-6 bg-gradient-to-r from-secondary/20 to-secondary/10 rounded-full w-24 border border-secondary/20"></div>
                </div>
                
                {/* Question content skeleton */}
                <div className="space-y-4">
                  <div className="h-6 bg-gradient-to-r from-muted/40 to-muted/20 rounded w-3/4 border border-border/30"></div>
                  <div className="h-4 bg-gradient-to-r from-muted/40 to-muted/20 rounded w-full border border-border/30"></div>
                  <div className="h-4 bg-gradient-to-r from-muted/40 to-muted/20 rounded w-2/3 border border-border/30"></div>
                </div>
                
                {/* AI title section skeleton */}
                <div className="border-t border-border/50 pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 bg-gradient-to-r from-primary/20 to-primary/10 rounded w-16 border border-primary/20"></div>
                  </div>
                  <div className="h-4 bg-gradient-to-r from-muted/40 to-muted/20 rounded w-1/2 border border-border/30"></div>
                </div>
                
                {/* User info and actions skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20">
                    <div className="h-8 w-8 bg-gradient-to-br from-primary/30 to-primary/20 rounded-full border border-primary/30"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gradient-to-r from-primary/30 to-primary/20 rounded w-24 border border-primary/20"></div>
                      <div className="h-3 bg-gradient-to-r from-primary/30 to-primary/20 rounded w-20 border border-primary/20"></div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="h-8 bg-gradient-to-r from-muted/50 to-muted/30 rounded w-20 border border-border/40"></div>
                    <div className="h-8 bg-gradient-to-r from-muted/50 to-muted/30 rounded w-24 border border-border/40"></div>
                    <div className="h-8 bg-gradient-to-r from-muted/50 to-muted/30 rounded w-32 border border-border/40"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="glass-card border-0 hover-glow">
        <CardContent className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
            <Search className="h-10 w-10 text-primary/60" />
          </div>
          <h3 className="text-xl font-semibold mb-3 gradient-text">{t('questionsPage.noQuestionsFound')}</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {t('questionsPage.beFirstToAsk')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((question) => (
        <QuestionCard 
          key={question.id} 
          question={question}
          onUpdate={onQuestionUpdate}
          onQuestionClick={onQuestionClick}
        />
      ))}
    </div>
  );
};
