
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

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
  const [loading, setLoading] = useState(false);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      console.log('Starting PDF extraction for:', file.name);
      const arrayBuffer = await file.arrayBuffer();
      console.log('Got array buffer, length:', arrayBuffer.byteLength);
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log('PDF loaded, pages:', pdf.numPages);
      
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => {
              if (item.str) {
                return item.str;
              }
              return '';
            })
            .join(' ');
          fullText += pageText + '\n';
          console.log(`Page ${i} extracted, text length:`, pageText.length);
        } catch (pageError) {
          console.error(`Error extracting page ${i}:`, pageError);
          // Continue with other pages
        }
      }

      console.log('Full text extracted, length:', fullText.length);
      return fullText;
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const parseQuestions = (text: string): ExtractedQuestion[] => {
    try {
      console.log('Parsing questions from text, length:', text.length);
      const questions: ExtractedQuestion[] = [];
      
      if (!text || text.trim().length === 0) {
        console.log('No text to parse');
        return questions;
      }
      
      // More flexible question pattern matching
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      let currentQuestion = '';
      let currentOptions: string[] = [];
      let questionIndex = 0;
      let inQuestion = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check if line starts with a number (potential question)
        const questionMatch = line.match(/^(\d+)[\.\)]?\s*(.+)/);
        if (questionMatch && questionMatch[2].length > 10) {
          // Save previous question if exists
          if (inQuestion && currentQuestion) {
            questions.push({
              id: Math.random().toString(36).substr(2, 9),
              question_text: currentQuestion,
              question_type: currentOptions.length > 0 ? 'mcq' : 'written',
              options: currentOptions.length > 0 ? currentOptions : undefined,
              correct_answer: '',
              points: 1
            });
          }
          
          // Start new question
          currentQuestion = questionMatch[2];
          currentOptions = [];
          inQuestion = true;
          questionIndex++;
          continue;
        }
        
        // Check for multiple choice options
        const optionMatch = line.match(/^([a-d])\)?\s*(.+)/i);
        if (optionMatch && inQuestion && optionMatch[2].length > 1) {
          currentOptions.push(optionMatch[2]);
          continue;
        }
        
        // Add to current question if we're in a question
        if (inQuestion && !optionMatch && line.length > 3) {
          currentQuestion += ' ' + line;
        }
      }
      
      // Add the last question
      if (inQuestion && currentQuestion) {
        questions.push({
          id: Math.random().toString(36).substr(2, 9),
          question_text: currentQuestion,
          question_type: currentOptions.length > 0 ? 'mcq' : 'written',
          options: currentOptions.length > 0 ? currentOptions : undefined,
          correct_answer: '',
          points: 1
        });
      }

      console.log('Parsed questions:', questions.length);
      return questions;
    } catch (error) {
      console.error('Error parsing questions:', error);
      return [];
    }
  };

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

    setLoading(true);

    try {
      console.log('Processing file:', file.name, 'Size:', file.size);
      
      const text = await extractTextFromPdf(file);
      
      if (!text || text.trim().length === 0) {
        toast({
          title: 'No Text Found',
          description: 'Could not extract any text from the PDF. Please check if the PDF contains readable text.',
          variant: 'destructive',
        });
        return;
      }
      
      const questions = parseQuestions(text);

      if (questions.length === 0) {
        toast({
          title: 'No Questions Found',
          description: 'Could not extract questions from the PDF. Please check the format. Questions should be numbered (1. Question text...) with options labeled a), b), c), d).',
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
    } catch (error: any) {
      console.error('Error extracting questions:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to extract questions from PDF. Please try a different PDF or check the file format.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
