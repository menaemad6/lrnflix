import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ImageIcon, Plus, Trash2 } from 'lucide-react';

interface Question {
  question_text: string;
  question_type: 'mcq' | 'written';
  options?: string[];
  correct_answer?: string;
  points: number;
  order_index: number;
  question_image?: string | null;
}

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestion: (question: Question) => void;
  questionIndex: number;
}

export const AddQuestionModal = ({ isOpen, onClose, onAddQuestion, questionIndex }: AddQuestionModalProps) => {
  const { t } = useTranslation('teacher');
  
  const [question, setQuestion] = useState<Question>({
    question_text: '',
    question_type: 'mcq',
    options: ['', '', '', ''],
    correct_answer: '',
    points: 1,
    order_index: questionIndex,
    question_image: null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.question_text.trim()) {
      return;
    }
    onAddQuestion(question);
    onClose();
    // Reset form
    setQuestion({
      question_text: '',
      question_type: 'mcq',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1,
      order_index: questionIndex,
      question_image: null
    });
  };

  const updateQuestion = (field: string, value: any) => {
    setQuestion(prev => ({ ...prev, [field]: value }));
  };

  const updateOption = (optionIndex: number, value: string) => {
    setQuestion(prev => ({
      ...prev,
      options: prev.options?.map((opt, oi) => oi === optionIndex ? value : opt)
    }));
  };

  const addOption = () => {
    setQuestion(prev => ({
      ...prev,
      options: [...(prev.options || []), '']
    }));
  };

  const removeOption = (optionIndex: number) => {
    setQuestion(prev => ({
      ...prev,
      options: prev.options?.filter((_, oi) => oi !== optionIndex)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('quizEditor.modals.addNewQuestion')}</DialogTitle>
          <DialogDescription>
            {t('quizEditor.modals.addNewQuestionDesc')}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="question-text">{t('quizEditor.questions.questionText')} *</Label>
            <Textarea
              id="question-text"
              placeholder={t('quizEditor.questions.questionText')}
              value={question.question_text}
              onChange={(e) => updateQuestion('question_text', e.target.value)}
              required
              rows={3}
            />
          </div>

          {/* Question Type and Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="question-type">{t('quizEditor.questions.questionType')}</Label>
              <Select
                value={question.question_type}
                onValueChange={(value: 'mcq' | 'written') => updateQuestion('question_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">{t('quizEditor.questions.multipleChoice')}</SelectItem>
                  <SelectItem value="written">{t('quizEditor.questions.writtenAnswer')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">{t('quizEditor.questions.points')}</Label>
              <Input
                id="points"
                type="number"
                min="1"
                placeholder={t('quizEditor.questions.points')}
                value={question.points}
                onChange={(e) => updateQuestion('points', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          {/* MCQ Options */}
          {question.question_type === 'mcq' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t('quizEditor.questions.options')}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="h-8 px-2"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {t('quizEditor.questions.addOption')}
                </Button>
              </div>
              
              <div className="space-y-2">
                {question.options?.map((option, optIndex) => (
                  <div key={optIndex} className="flex gap-2 items-center">
                    <Input
                      placeholder={t('quizEditor.questions.optionNumber', { number: optIndex + 1 })}
                      value={option}
                      onChange={(e) => updateOption(optIndex, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant={question.correct_answer === option ? "default" : "outline"}
                      onClick={() => updateQuestion('correct_answer', option)}
                      className="h-10 px-3 text-xs"
                    >
                      {t('quizEditor.questions.correct')}
                    </Button>
                    {question.options && question.options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(optIndex)}
                        className="h-10 px-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Written Answer Expected Keywords */}
          {question.question_type === 'written' && (
            <div className="space-y-2">
              <Label htmlFor="expected-answer">{t('quizEditor.questions.expectedAnswerKeywords')}</Label>
              <Input
                id="expected-answer"
                placeholder={t('quizEditor.questions.expectedAnswerKeywords')}
                value={question.correct_answer}
                onChange={(e) => updateQuestion('correct_answer', e.target.value)}
              />
            </div>
          )}

          {/* Question Image */}
          <div className="space-y-3">
            <Label>{t('quizEditor.questions.questionImage')}</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                {t('quizEditor.questions.addImage')}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('quizEditor.modals.imageUploadNote')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={!question.question_text.trim()}>
              {t('quizEditor.questions.addQuestion')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
