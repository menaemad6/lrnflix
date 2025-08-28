import React from 'react';
import ReactDOM from 'react-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Phone, Brain, AlertCircle, Sparkles, Clock, CreditCard, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useCallLimitations } from '@/hooks/useCallLimitations';
import { useVapiCall } from '@/hooks/useVapiCall';
import { CallInterface } from '@/components/lessons/CallInterface';
import { MinutesPurchaseModal } from '@/components/lessons/MinutesPurchaseModal';
import { QuizVoiceTutorModal } from './QuizVoiceTutorModal';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('courses');
  const [showVoiceTutorModal, setShowVoiceTutorModal] = useState(false);
  // Call state
  // const [showCallInterface, setShowCallInterface] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(5);
  const [callTimer, setCallTimer] = useState<NodeJS.Timeout | null>(null);
  const [callDurationInterval, setCallDurationInterval] = useState<NodeJS.Timeout | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const { startCall, endCall, isCallActive, isConnecting, isUserSpeaking, isAssistantSpeaking } = useVapiCall();
  const lessonId = question ? (question as any).id || '' : '';
  const {
    dailyMinutesLimit,
    minutesUsedToday,
    remainingMinutes,
    canStartCall,
    loading,
    getMaxCallDuration,
    purchasedMinutes,
    refreshLimitations,
    recordCallStart,
    recordCallEnd,
    updateCallDuration // <-- add this
  } = useCallLimitations(lessonId);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (callTimer) {
        clearInterval(callTimer);
      }
      if (callDurationInterval) {
        clearInterval(callDurationInterval);
      }
    };
  }, [callTimer, callDurationInterval]);

  // End call when timer reaches zero
  useEffect(() => {
    if (remainingTime <= 0 && isCallActive) {
      handleEndCall();
    }
  }, [remainingTime, isCallActive]);

  // Remove timer setup from handleStartCall
  // Instead, use an effect to start/stop the timer based on isCallActive

  useEffect(() => {
    if (isCallActive) {
      const timer = setInterval(() => {
        setRemainingTime(prev => Math.max(0, prev - 1));
      }, 1000);
      setCallTimer(timer);
      return () => {
        clearInterval(timer);
        setCallTimer(null);
      };
    } else {
      if (callTimer) {
        clearInterval(callTimer);
        setCallTimer(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCallActive]);

  const handleStartCall = async (duration: number) => {
    const maxDuration = getMaxCallDuration(duration);
    try {
      // Record call start in database
      const callId = await recordCallStart(lessonId);
      if (!callId) {
        console.error('Failed to start call. Please try again.');
        return;
      }
      setCurrentCallId(callId);
      setCallStartTime(new Date());
      startCall({
        agentId: import.meta.env.VITE_VAPI_QUESTIONS_AGENT_ID,
        publicKey: import.meta.env.VITE_VAPI_ACCOUNT_PUBLIC_KEY,
        question: question?.question_text || 'No question available',
        studentAnswer: userAnswer || 'Not answered',
        correctAnswer: question?.correct_answer || 'No correct answer',
        callLength: `${maxDuration} minutes`
      });
      setRemainingTime(maxDuration * 60); // Convert to seconds
      // Add a separate interval for DB update
      const durationInterval = setInterval(() => {
        if (callId) {
          const elapsedMinutes = Math.ceil((maxDuration * 60 - remainingTime) / 60);
          updateCallDuration(callId, elapsedMinutes);
        }
      }, 60000);
      setCallDurationInterval(durationInterval);
    } catch (error) {
      console.error('Failed to start call:', error);
      setCurrentCallId(null);
      setCallStartTime(null);
    }
  };

  const handleEndCall = async () => {
    if (callTimer) {
      clearInterval(callTimer);
      setCallTimer(null);
    }
    if (callDurationInterval) {
      clearInterval(callDurationInterval);
      setCallDurationInterval(null);
    }
    const actualDurationMinutes = callStartTime 
      ? Math.ceil((Date.now() - callStartTime.getTime()) / (1000 * 60))
      : Math.ceil((selectedDuration * 60 - remainingTime) / 60);
    if (currentCallId) {
      await recordCallEnd(currentCallId, actualDurationMinutes);
      setCurrentCallId(null);
    }
    endCall();
    setRemainingTime(0);
    setCallStartTime(null);
  };

  const handleVoiceCallSelect = () => {
    setShowVoiceTutorModal(true);
  };

  // Don't render if question is null or invalid
  if (!question || !question.question_text) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center p-8">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">{t('aiVoiceTutor.questionNotAvailable')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('aiVoiceTutor.questionNotAvailableDescription')}
            </p>
            <Button onClick={() => onOpenChange(false)}>{t('aiVoiceTutor.close')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (isCallActive && !nextOpen) {
            // Prevent closing the modal when a call is active
            return;
          }
          onOpenChange(nextOpen);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              {t('quizChoiceModal.title')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Question Preview */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">{t('quizChoiceModal.question')}:</h4>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{question.question_text}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium">{t('quizChoiceModal.yourAnswer')}: </span>
                    <span className="text-orange-600 truncate block">{userAnswer || t('aiVoiceTutor.notAnswered')}</span>
                  </div>
                  <div>
                    <span className="font-medium">{t('quizChoiceModal.correctAnswer')}: </span>
                    <span className="text-primary truncate block">{question.correct_answer}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Choice Options */}
            <div className="space-y-4">
              {/* Voice Call - Primary Option */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <Button
                  onClick={handleVoiceCallSelect}
                  size="lg"
                  className="relative w-full h-28 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group px-6 py-6"
                >
                  <div className="flex flex-col items-center gap-2 w-full overflow-hidden">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-center w-full">
                      <div className="font-bold text-lg break-words leading-tight w-full">{t('quizChoiceModal.voiceCallWithHossam')}</div>
                      <div className="text-sm opacity-90 break-words w-full">{t('quizChoiceModal.realTimeVoiceConversation')}</div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                    </div>
                  </div>
                </Button>
              </div>

              {/* Chat - Secondary Option */}
              <Button
                onClick={() => {
                  onChatSelected();
                  onOpenChange(false);
                }}
                variant="outline"
                size="lg"
                className="w-full h-24 bg-white/5 backdrop-blur-sm border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 px-6 py-5"
              >
                <div className="flex flex-col items-center gap-2 w-full overflow-hidden">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-center w-full">
                    <div className="font-semibold break-words leading-tight w-full">{t('quizChoiceModal.chatWithHossam')}</div>
                    <div className="text-xs text-muted-foreground break-words w-full">{t('quizChoiceModal.textBasedConversation')}</div>
                  </div>
                </div>
              </Button>
            </div>

            {/* Recommendation */}
            <div className="text-center p-3 bg-primary-500/10 rounded-xl border border-primary-500/20">
              <p className="text-sm text-primary-400 font-medium">
                {t('quizChoiceModal.recommendation')}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Voice Tutor Modal */}
      {showVoiceTutorModal && (
        <QuizVoiceTutorModal
          open={showVoiceTutorModal}
          onOpenChange={setShowVoiceTutorModal}
          question={question}
          userAnswer={userAnswer}
          lessonId={lessonId}
          onStartCall={handleStartCall}
          onEndCall={handleEndCall}
          isCallActive={isCallActive}
          isConnecting={isConnecting}
          isUserSpeaking={isUserSpeaking}
          isAssistantSpeaking={isAssistantSpeaking}
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
        />
      )}
      {/* Call Interface rendered in a portal so it overlays everything and is not affected by modal backdrop clicks */}
      {isCallActive && ReactDOM.createPortal(
        <CallInterface
          isCallActive={isCallActive}
          isConnecting={isConnecting}
          isUserSpeaking={isUserSpeaking}
          isAssistantSpeaking={isAssistantSpeaking}
          onEndCall={endCall}
          remainingTime={remainingTime}
        />,
        document.body
      )}
    </>
  );
}; 