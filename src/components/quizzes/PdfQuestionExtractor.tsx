
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { usePdfAi } from '@/hooks/usePdfAi';

interface ExtractedQuestion {
  id: string;
  question_text: string;
  question_type: 'mcq' | 'written';
  options?: string[];
  correct_answer?: string;
  points: number;
}

interface PdfQuestionExtractorProps {
  onQuestionsExtracted: (questions: ExtractedQuestion[]) => void;
}

export const PdfQuestionExtractor: React.FC<PdfQuestionExtractorProps> = ({
  onQuestionsExtracted
}) => {
  const { toast } = useToast();
  const { process, loading } = usePdfAi('extract-questions');

  type ErrorShape = { success: false; error: string };
  const isErrorResult = (res: unknown): res is ErrorShape =>
    typeof res === 'object' && res !== null && (res as { success?: boolean }).success === false;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Error',
        description: 'Please select a PDF file',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await process({ pdfFile: file });
      if (isErrorResult(res)) {
        toast({
          title: 'Extraction Failed',
          description: res.error || 'Could not process the PDF',
          variant: 'destructive',
        });
        return;
      }
      const questions = Array.isArray(res.data) ? (res.data as ExtractedQuestion[]) : [];
      if (questions.length === 0) {
        toast({
          title: 'No Questions Found',
          description: 'AI could not extract questions from the PDF. Try a clearer source.',
          variant: 'destructive',
        });
        return;
      }

      onQuestionsExtracted(questions);
      toast({
        title: 'Success',
        description: `Extracted ${questions.length} questions from PDF`,
      });

      // Reset the input
      event.target.value = '';
    } catch (error) {
      console.error('Error extracting questions:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to extract questions from PDF. Please try a different PDF or check the file format.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Extract Questions from PDF
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Upload PDF with Questions</p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF should contain numbered questions. Multiple choice questions should have options labeled a), b), c), d)
                </p>
              </div>
              <div className="relative">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={loading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button disabled={loading} variant="outline">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing PDF...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose PDF File
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Supported formats:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Numbered questions (1. What is...?, 2. Which of...?)</li>
              <li>Multiple choice with a), b), c), d) options</li>
              <li>Answer keys with "Answer: A" format</li>
              <li>Text-based PDFs (not scanned images)</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
