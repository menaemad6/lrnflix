import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Award, ArrowLeft, Brain, Sparkles } from 'lucide-react';
import { QuizVoiceTutorModal } from './QuizVoiceTutorModal';
import { QuizChoiceModal } from './QuizChoiceModal';
import { useVapiCall } from '@/hooks/useVapiCall';
import { useChatbot } from '@/contexts/ChatbotContext';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';

interface QuizResultsProps {
  score: number;
  maxScore: number;
  questions: Array<{
    id: string;
    question_text: string;
    options: string[];
    correct_answer: string;
    type: string;
  }>;
  userAnswers: Record<string, string>;
  showCorrectAnswers?: boolean;
  onBackToCourse: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  score,
  maxScore,
  questions,
  userAnswers,
  showCorrectAnswers = false,
  onBackToCourse
}) => {
  const percentage = (score / maxScore) * 100;
  const passed = percentage >= 70;
  const { isCallActive, endCall } = useVapiCall();
  const { openChatbot, sendSystemMessage } = useChatbot();
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(false);

  const getAnswerStatus = (questionId: string) => {
    const userAnswer = userAnswers[questionId];
    const question = questions.find(q => q.id === questionId);
    
    if (!question || !userAnswer) return false;

    // Debug logging
    console.log('Question:', {
      id: questionId,
      text: question.question_text,
      type: question.type,
      userAnswer: userAnswer,
      correctAnswer: question.correct_answer,
      userAnswerType: typeof userAnswer,
      correctAnswerType: typeof question.correct_answer
    });
    
    // Convert both answers to strings and normalize
    const normalizedUserAnswer = String(userAnswer).toLowerCase().trim();
    const normalizedCorrectAnswer = String(question.correct_answer).toLowerCase().trim();
    
    // Debug logging for normalized values
    console.log('Normalized answers:', {
      userAnswer: normalizedUserAnswer,
      correctAnswer: normalizedCorrectAnswer,
      areEqual: normalizedUserAnswer === normalizedCorrectAnswer
    });

    // Simple direct comparison
    return normalizedUserAnswer === normalizedCorrectAnswer;
  };

  const handleTalkToHossam = (question: any, userAnswer: string) => {
    if (!question) return;
    setSelectedQuestion({ ...question, userAnswer });
    setShowChoiceModal(true);
  };

  const handleChatSelected = () => {
    openChatbot();
    // Automatically send a system prompt message to the chatbot
    if (selectedQuestion) {
      const systemPrompt = `I need help understanding a quiz question. Here are the details:\n\nQuestion: ${selectedQuestion.question_text}\nMy Answer: ${selectedQuestion.userAnswer || 'Not answered'}\nCorrect Answer: ${selectedQuestion.correct_answer}\n\nPlease help me understand why my answer was ${getAnswerStatus(selectedQuestion.id) ? 'correct' : 'incorrect'} and explain the concept clearly.`;
      sendSystemMessage(systemPrompt);
    }
  };

  const handleVoiceCallSelected = () => {
    // Open the voice tutor modal
    setShowVoiceModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Results Header */}
        <Card className={`relative overflow-hidden shadow-2xl ${
          passed 
            ? 'bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20' 
            : 'bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-background border-2 border-orange-500/20'
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
            <Award className="w-full h-full" />
          </div>
          <CardHeader className="text-center pb-4 relative">
            <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg ${
              passed ? 'bg-gradient-to-r from-primary to-primary/80' : 'bg-gradient-to-r from-orange-500 to-orange-600'
            }`}>
              <Award className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold mb-2">Quiz Completed!</CardTitle>
            <p className="text-muted-foreground text-lg">Excellent work on completing the quiz</p>
          </CardHeader>
          <CardContent className="text-center space-y-8 pb-8">
            <div className="space-y-4">
              <div className="text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                {score}/{maxScore}
              </div>
              <Badge 
                variant={passed ? "default" : "destructive"}
                className="text-2xl px-8 py-3 font-bold shadow-lg"
              >
                {percentage.toFixed(1)}% - {passed ? 'Passed' : 'Failed'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="p-6 bg-card/80 backdrop-blur-sm rounded-2xl border shadow-lg">
                <div className="text-3xl font-bold text-primary mb-2">{questions.length}</div>
                <div className="text-muted-foreground font-medium">Total Questions</div>
              </div>
              <div className="p-6 bg-card/80 backdrop-blur-sm rounded-2xl border shadow-lg">
                <div className="text-3xl font-bold text-primary mb-2">{Object.keys(userAnswers).length}</div>
                <div className="text-muted-foreground font-medium">Answered</div>
              </div>
              <div className="p-6 bg-card/80 backdrop-blur-sm rounded-2xl border shadow-lg">
                <div className="text-3xl font-bold text-primary mb-2">{score}</div>
                <div className="text-muted-foreground font-medium">Correct</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Assistant Status */}
        {isCallActive && (
          <Card className="border-2 border-primary bg-gradient-to-r from-primary/5 to-primary/10 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
                <Brain className="h-8 w-8 text-primary" />
                <span className="font-bold text-primary text-xl">Connected to Hossam</span>
              </div>
              <p className="text-muted-foreground mb-4 text-lg">
                Your AI tutor is ready to help you understand the quiz questions better
              </p>
              <Button onClick={endCall} variant="destructive" size="lg" className="px-8">
                End Call
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Answer Review */}
        {showCorrectAnswers && questions.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">Answer Review</h2>
            </div>
            
            <div className="space-y-6">
              {questions.map((question) => {
                const isCorrect = getAnswerStatus(question.id);
                const userAnswer = userAnswers[question.id];
                const correctAnswer = question.correct_answer;

                // Debug logging for each question's result
                console.log('Question result:', {
                  questionId: question.id,
                  isCorrect,
                  userAnswer,
                  correctAnswer
                });

                return (
                  <Card key={question.id} className={`border-l-4 shadow-lg hover:shadow-xl transition-all duration-300 ${
                    isCorrect ? 'border-l-primary bg-primary/5' : 'border-l-orange-500 bg-orange-500/5'
                  }`}>
                    <CardContent className="p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Status Icon */}
                        <div className="lg:col-span-1 flex justify-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                            isCorrect ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-500'
                          }`}>
                            {isCorrect ? (
                              <CheckCircle className="h-6 w-6" />
                            ) : (
                              <XCircle className="h-6 w-6" />
                            )}
                          </div>
                        </div>
                        
                        {/* Question Content */}
                        <div className="lg:col-span-9 space-y-6">
                          <div>
                            <h4 className="font-bold text-xl mb-4">
                              Question {questions.indexOf(question) + 1}: {question.question_text}
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-muted-foreground">Your Answer:</span>
                                </div>
                                <div className={`p-4 rounded-xl border-2 font-medium ${
                                  isCorrect 
                                    ? 'bg-primary/10 border-primary/30 text-primary' 
                                    : 'bg-orange-500/10 border-orange-500/30 text-orange-600'
                                }`}>
                                  {userAnswer || 'Not answered'}
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-muted-foreground">Correct Answer:</span>
                                </div>
                                <div className="p-4 rounded-xl bg-primary/10 border-2 border-primary/30 text-primary font-medium">
                                  {correctAnswer || 'No answer provided'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* AI Tutor Button */}
                        <div className="lg:col-span-2 flex justify-center">
                          <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-primary/80 to-primary rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                            <Button
                              variant="outline"
                              size="lg"
                              onClick={() => handleTalkToHossam(question, userAnswer)}
                              disabled={isCallActive}
                              className="relative bg-background/80 backdrop-blur-sm border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 h-auto p-4 flex flex-col gap-2 min-w-[140px]"
                            >
                              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center mb-1">
                                <Brain className="h-5 w-5 text-white" />
                              </div>
                              <span className="font-semibold">Ask Hossam</span>
                              <span className="text-xs opacity-80">Get AI Help</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* No valid questions message */}
        {questions.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No questions to review</h3>
              <p className="text-muted-foreground mb-4">
                There were no valid questions in this quiz to display.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Back Button */}
        <div className="text-center pt-8">
          <Button onClick={onBackToCourse} size="lg" className="px-12 py-4 text-lg shadow-lg">
            <ArrowLeft className="h-5 w-5 mr-3" />
            Back to Course
          </Button>
        </div>
      </div>

      {/* Choice Modal */}
      {showChoiceModal && selectedQuestion && (
        <QuizChoiceModal
          open={showChoiceModal}
          onOpenChange={setShowChoiceModal}
          onChatSelected={handleChatSelected}
          onVoiceCallSelected={handleVoiceCallSelected}
          question={selectedQuestion}
          userAnswer={selectedQuestion.userAnswer || ''}
        />
      )}

      {/* Voice Tutor Modal */}
      {showVoiceModal && selectedQuestion && (
        <QuizVoiceTutorModal
          open={showVoiceModal}
          onOpenChange={setShowVoiceModal}
          question={selectedQuestion}
          userAnswer={selectedQuestion.userAnswer || ''}
          lessonId={selectedQuestion.id || ''}
        />
      )}
    </div>
  );
};
