import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Phone, Brain, AlertCircle, Sparkles } from 'lucide-react';

interface QuizChoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatSelected: () => void;
  onVoiceCallSelected: () => void;
  question: {
    question_text: string;
    correct_answer: string;
  } | null;
  userAnswer: string;
}

export const QuizChoiceModal: React.FC<QuizChoiceModalProps> = ({
  open,
  onOpenChange,
  onChatSelected,
  onVoiceCallSelected,
  question,
  userAnswer
}) => {
  const handleChatSelect = () => {
    onChatSelected();
    onOpenChange(false);
  };

  const handleVoiceCallSelect = () => {
    onVoiceCallSelected();
    onOpenChange(false);
  };

  // Don't render if question is null or invalid
  if (!question || !question.question_text) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center p-8">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Question Not Available</h3>
            <p className="text-muted-foreground mb-4">
              The question data is not available for AI assistance.
            </p>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            Choose How to Ask Hossam
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Question Preview */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Question:</h4>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{question.question_text}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium">Your Answer: </span>
                  <span className="text-orange-600 truncate block">{userAnswer || 'Not answered'}</span>
                </div>
                <div>
                  <span className="font-medium">Correct Answer: </span>
                  <span className="text-primary truncate block">{question.correct_answer}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Choice Options */}
          <div className="space-y-4">
            {/* Voice Call - Primary Option */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <Button
                onClick={handleVoiceCallSelect}
                size="lg"
                className="relative w-full h-28 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group px-6 py-6"
              >
                <div className="flex flex-col items-center gap-2 w-full overflow-hidden">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-center w-full">
                    <div className="font-bold text-lg break-words leading-tight w-full">Voice Call with Hossam</div>
                    <div className="text-sm opacity-90 break-words w-full">Real-time voice conversation</div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                  </div>
                </div>
              </Button>
            </div>

            {/* Chat - Secondary Option */}
            <Button
              onClick={handleChatSelect}
              variant="outline"
              size="lg"
              className="w-full h-24 bg-white/5 backdrop-blur-sm border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 px-6 py-5"
            >
              <div className="flex flex-col items-center gap-2 w-full overflow-hidden">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div className="text-center w-full">
                  <div className="font-semibold break-words leading-tight w-full">Chat with Hossam</div>
                  <div className="text-xs text-muted-foreground break-words w-full">Text-based conversation</div>
                </div>
              </div>
            </Button>
          </div>

          {/* Recommendation */}
          <div className="text-center p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <p className="text-sm text-emerald-400 font-medium">
              💡 Recommended: Voice call for personalized, interactive help
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 