
import React from 'react';
import { QuestionCard } from './QuestionCard';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Search } from 'lucide-react';

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
}

export const QuestionsList: React.FC<QuestionsListProps> = ({
  questions,
  loading,
  onQuestionUpdate
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="flex gap-4 mt-4">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-4 bg-muted rounded w-24"></div>
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
          <h3 className="text-xl font-semibold mb-3 gradient-text">No Questions Found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Be the first to ask a question and start the conversation!
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
        />
      ))}
    </div>
  );
};
