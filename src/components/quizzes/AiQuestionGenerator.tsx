import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, RefreshCw, Plus } from 'lucide-react';
import { generateQuestions } from '@/utils/geminiApi';

interface GeneratedQuestion {
  question_text: string;
  question_type: 'mcq' | 'written';
  options?: string[];
  correct_answer?: string;
  points: number;
}

interface AiQuestionGeneratorProps {
  onQuestionsGenerated: (questions: GeneratedQuestion[]) => void;
}

export const AiQuestionGenerator: React.FC<AiQuestionGeneratorProps> = ({
  onQuestionsGenerated
}) => {
  const { t } = useTranslation('teacher');
  const { toast } = useToast();
  
  const [quizDescription, setQuizDescription] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [questionType, setQuestionType] = useState<'both' | 'mcq' | 'written'>('both');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);

  const handleGenerateQuestions = async () => {
    if (!quizDescription.trim()) {
      toast({
        title: t('error'),
        description: t('quizEditor.questions.aiGenerationContent.quizDescriptionRequired'),
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const questions = await generateQuestions({
        quizDescription: quizDescription.trim(),
        numberOfQuestions,
        questionType,
        difficulty
      });

      setGeneratedQuestions(questions);
      toast({
        title: t('success'),
        description: t('quizEditor.questions.aiGenerationContent.questionsGenerated', { count: questions.length }),
      });
    } catch (error: unknown) {
      console.error('Error generating questions:', error);
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('quizEditor.questions.aiGenerationContent.generationFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToQuiz = () => {
    if (generatedQuestions.length > 0) {
      onQuestionsGenerated(generatedQuestions);
      toast({
        title: t('success'),
        description: t('quizEditor.questions.aiGenerationContent.questionsAdded', { count: generatedQuestions.length }),
      });
    }
  };

  const handleRegenerate = () => {
    setGeneratedQuestions([]);
    handleGenerateQuestions();
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm sm:text-base">{t('quizEditor.questions.aiGenerationContent.description')}</p>
      </div>
      
      <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quiz-description">{t('quizEditor.questions.aiGenerationContent.quizDescription')}</Label>
            <Textarea
              id="quiz-description"
              placeholder={t('quizEditor.questions.aiGenerationContent.quizDescriptionPlaceholder')}
              value={quizDescription}
              onChange={(e) => setQuizDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number-questions">{t('quizEditor.questions.aiGenerationContent.numberOfQuestions')}</Label>
              <Input
                id="number-questions"
                type="number"
                min="1"
                max="20"
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(parseInt(e.target.value) || 5)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="question-type">{t('quizEditor.questions.aiGenerationContent.questionType')}</Label>
              <Select value={questionType} onValueChange={(value: 'both' | 'mcq' | 'written') => setQuestionType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">{t('quizEditor.questions.aiGenerationContent.both')}</SelectItem>
                  <SelectItem value="mcq">{t('quizEditor.questions.aiGenerationContent.mcqOnly')}</SelectItem>
                  <SelectItem value="written">{t('quizEditor.questions.aiGenerationContent.writtenOnly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">{t('quizEditor.questions.aiGenerationContent.difficulty')}</Label>
              <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard' | 'mixed') => setDifficulty(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">{t('quizEditor.questions.aiGenerationContent.easy')}</SelectItem>
                  <SelectItem value="medium">{t('quizEditor.questions.aiGenerationContent.medium')}</SelectItem>
                  <SelectItem value="hard">{t('quizEditor.questions.aiGenerationContent.hard')}</SelectItem>
                  <SelectItem value="mixed">{t('quizEditor.questions.aiGenerationContent.mixed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

        <div className="flex gap-2">
          <Button
            onClick={handleGenerateQuestions}
            disabled={isGenerating || !quizDescription.trim()}
            variant="outline"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                {t('quizEditor.questions.aiGenerationContent.generating')}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t('quizEditor.questions.aiGenerationContent.generateQuestions')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Generated Questions Preview */}
      {generatedQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm sm:text-base">
              {t('quizEditor.questions.aiGenerationContent.generatedQuestions')} ({generatedQuestions.length})
            </p>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('quizEditor.questions.aiGenerationContent.regenerate')}
              </Button>
              <Button
                onClick={handleAddToQuiz}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('quizEditor.questions.aiGenerationContent.addToQuiz')}
              </Button>
            </div>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {generatedQuestions.map((question, index) => (
              <Card key={index}>
                <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between">
                    <h4 className="font-medium text-base sm:text-lg">
                      Question {index + 1} • {question.question_type.toUpperCase()} • {question.points} point{question.points !== 1 ? 's' : ''}
                    </h4>
                  </div>
                  
                  <p className="font-medium">{question.question_text}</p>
                  
                  {question.question_type === 'mcq' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`text-sm p-2 rounded ${
                            option === question.correct_answer
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}) {option}
                          {option === question.correct_answer && (
                            <span className="ml-2 text-xs font-medium">✓ Correct</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.question_type === 'written' && (
                    <div className="text-sm text-muted-foreground italic">
                      Written answer required
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
