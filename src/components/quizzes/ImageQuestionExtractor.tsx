import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ExtractedQuestion {
  id: string;
  question_text: string;
  question_type: 'mcq' | 'written';
  options?: string[];
  correct_answer?: string;
  points: number;
}

interface ImageQuestionExtractorProps {
  onQuestionsExtracted: (questions: ExtractedQuestion[]) => void;
}

export const ImageQuestionExtractor: React.FC<ImageQuestionExtractorProps> = ({
  onQuestionsExtracted
}) => {
  const { toast } = useToast();
  const { t } = useTranslation('teacher');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: t('common.error'),
        description: t('quizEditor.imageExtraction.invalidFileType'),
        variant: 'destructive',
      });
      return;
    }

    setSelectedImage(file);
  };

  const extractQuestionsFromImage = async () => {
    if (!selectedImage) {
      toast({
        title: t('common.error'),
        description: t('quizEditor.imageExtraction.selectImageFirst'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Convert image to base64
      const base64Image = await fileToBase64(selectedImage);
      
      // Call Gemini API with the image
      const questions = await callGeminiWithImage(base64Image);
      
      if (questions.length === 0) {
        toast({
          title: t('quizEditor.imageExtraction.noQuestionsFound'),
          description: t('quizEditor.imageExtraction.tryClearerImage'),
          variant: 'destructive',
        });
        return;
      }

      onQuestionsExtracted(questions);
      toast({
        title: t('common.success'),
        description: t('quizEditor.imageExtraction.extractedSuccessfully', { count: questions.length }),
      });

      // Reset the input
      setSelectedImage(null);
      const input = document.getElementById('image-upload') as HTMLInputElement;
      if (input) input.value = '';
    } catch (error) {
      console.error('Error extracting questions:', error);
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('quizEditor.imageExtraction.extractionFailed'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:image/...;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const callGeminiWithImage = async (base64Image: string): Promise<ExtractedQuestion[]> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(t('quizEditor.imageExtraction.apiKeyNotFound'));
    }

    const systemPrompt = t('quizEditor.imageExtraction.systemPrompt');

    const schema = {
      questions: [
        {
          id: 'string',
          question_text: 'string',
          question_type: "'mcq' | 'written'",
          options: ['string?'],
          correct_answer: 'string?',
          points: 'number?'
        }
      ]
    };

    const userPrompt = t('quizEditor.imageExtraction.userPrompt', { schema: JSON.stringify(schema) });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const body = {
      contents: [{
        parts: [
          { text: systemPrompt },
          {
            inlineData: {
              mimeType: selectedImage?.type || 'image/jpeg',
              data: base64Image
            }
          },
          { text: userPrompt }
        ]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2000,
        responseMimeType: 'application/json',
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(t('quizEditor.imageExtraction.apiError', { status: response.status, statusText: response.statusText }));
    }

    const data = await response.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error(t('quizEditor.imageExtraction.emptyResponse'));
    }

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (_e) {
      // Try to salvage JSON from text blocks
      const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!match) throw new Error(t('quizEditor.imageExtraction.parseFailed'));
      parsed = JSON.parse(match[0]);
    }

    // Validate and return questions
    if (parsed.questions && Array.isArray(parsed.questions)) {
      return parsed.questions.map((q: any, index: number) => ({
        id: q.id || `img_${Date.now()}_${index}`,
        question_text: q.question_text || '',
        question_type: q.question_type || 'written',
        options: q.options || [],
        correct_answer: q.correct_answer || '',
        points: q.points || 1
      }));
    }

    return [];
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <ImageIcon className="h-5 w-5" />
          {t('quizEditor.imageExtraction.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 sm:space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('quizEditor.imageExtraction.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="flex-1 min-w-0"
            />
            <Button
              onClick={extractQuestionsFromImage}
              disabled={!selectedImage || loading}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white border-0 hover:from-green-600 hover:to-blue-600 w-full sm:w-auto px-4 py-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('quizEditor.imageExtraction.processing')}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {t('quizEditor.imageExtraction.extractQuestions')}
                </>
              )}
            </Button>
          </div>
          
          {selectedImage && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              {t('quizEditor.imageExtraction.selected')}: {selectedImage.name}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
