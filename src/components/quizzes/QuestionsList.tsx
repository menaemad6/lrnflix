import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Loader2 } from 'lucide-react';

interface ExtractedQuestion {
  id: string;
  question_text: string;
  question_type: 'mcq' | 'written';
  options?: string[];
  correct_answer?: string;
  points: number;
}

interface QuestionsListProps {
  questions: ExtractedQuestion[];
  onSave: () => void;
  onDiscard: () => void;
  onEdit: (questionId: string) => void;
  onDelete: (questionId: string) => void;
  onGenerateOptions: (questionId: string) => void;
  generatingOptionsFor: string | null;
}

export const QuestionsList: React.FC<QuestionsListProps> = ({
  questions,
  onSave,
  onDiscard,
  onEdit,
  onDelete,
  onGenerateOptions,
  generatingOptionsFor,
}) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Extracted Questions ({questions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="border p-4 rounded-lg flex justify-between items-start">
              <div>
                <p className="font-semibold">{q.question_text}</p>
                {q.question_type === 'mcq' && q.options && q.options.length > 0 ? (
                  <ul className="list-disc ml-6 mt-2 text-sm text-muted-foreground">
                    {q.options.map((opt, index) => (
                      <li key={index} className={opt === q.correct_answer ? 'font-bold text-primary' : ''}>
                        {opt}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Button
                    size="sm"
                    variant="link"
                    onClick={() => onGenerateOptions(q.id)}
                    disabled={generatingOptionsFor === q.id}
                  >
                    {generatingOptionsFor === q.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Options with AI'
                    )}
                  </Button>
                )}
                <Badge variant="outline" className="mt-2">{q.points} points</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(q.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(q.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" onClick={onDiscard}>Discard All</Button>
          <Button onClick={onSave}>Save All Questions</Button>
        </div>
      </CardContent>
    </Card>
  );
};
