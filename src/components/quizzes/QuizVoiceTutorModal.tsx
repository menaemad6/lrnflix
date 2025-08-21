import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCallLimitations } from '@/hooks/useCallLimitations';
import { useVapiCall } from '@/hooks/useVapiCall';
import { MinutesPurchaseModal } from '@/components/lessons/MinutesPurchaseModal';
import { MessageCircle, Clock, Brain, AlertCircle, CreditCard, ShoppingCart, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface QuizVoiceTutorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: {
    question_text: string;
    correct_answer: string;
  };
  userAnswer: string;
  lessonId: string;
  onStartCall: (duration: number) => void;
  onEndCall: () => void;
  isCallActive: boolean;
  isConnecting: boolean;
  isUserSpeaking: boolean;
  isAssistantSpeaking: boolean;
  selectedDuration: number;
  setSelectedDuration: (duration: number) => void;
}

export const QuizVoiceTutorModal = ({ 
  open, 
  onOpenChange, 
  question, 
  userAnswer, 
  lessonId, 
  onStartCall,
  onEndCall,
  isCallActive,
  isConnecting,
  isUserSpeaking,
  isAssistantSpeaking,
  selectedDuration,
  setSelectedDuration
}: QuizVoiceTutorModalProps) => {
  const { t } = useTranslation('courses');
  // Local modal open state for decoupling from call interface
  const [modalOpen, setModalOpen] = useState(open);
  useEffect(() => { setModalOpen(open); }, [open]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
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
    recordCallEnd
  } = useCallLimitations(lessonId);

  // Check if user has no minutes available at all
  const hasNoMinutesAvailable = remainingMinutes === 0 && purchasedMinutes === 0;
  const hasPurchasedMinutesOnly = remainingMinutes === 0 && purchasedMinutes > 0;

  const callDurations = [
    { minutes: 3, label: t('aiVoiceTutor.quickClarification'), description: t('aiVoiceTutor.quickClarification') },
    { minutes: 5, label: t('aiVoiceTutor.standardHelp'), description: t('aiVoiceTutor.standardHelp') },
    { minutes: 10, label: t('aiVoiceTutor.detailedExplanation'), description: t('aiVoiceTutor.detailedExplanation') },
    { minutes: 15, label: t('aiVoiceTutor.inDepthDiscussion'), description: t('aiVoiceTutor.inDepthDiscussion') }
  ];

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      // No callTimer to clear here as it's managed by parent
    };
  }, []);

  // End call when timer reaches zero
  React.useEffect(() => {
    // No callTimer to manage remainingTime here as it's managed by parent
  }, [remainingTime, isCallActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = async () => {
    // Clear timer
    // No callTimer to clear here
    
    // Calculate actual duration
    // No callStartTime to calculate actual duration here
    
    // Record call end in database
    // No currentCallId to record here
    
    onEndCall();
    setRemainingTime(0);
    // No callStartTime to set here
  };

  // Don't render if question is null or invalid
  if (!question || !question.question_text) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md z-[10000]">
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

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md z-[10000]">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }


  return (
    <>
      {/* Always render CallInterface if isCallActive, before the modal so the modal is on top */}
      {/* Remove all rendering of <CallInterface ... /> from this file.
          // Only keep modal and modalOpen logic. */}
      <Dialog open={modalOpen} onOpenChange={isOpen => {
        if (!isCallActive) {
          onOpenChange(isOpen);
          setModalOpen(isOpen);
        } else if (!isOpen) {
          // Only hide the modal, do not end the call
          setModalOpen(false);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary-500 scrollbar-track-background z-[10000]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              {isCallActive ? t('aiVoiceTutor.activeCallWithHossam') : t('aiVoiceTutor.askHossamForHelp')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Question Preview - Always visible */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">{t('aiVoiceTutor.question')}:</h4>
                <p className="text-sm text-muted-foreground mb-3">{question.question_text}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium">{t('aiVoiceTutor.yourAnswer')}: </span>
                    <span className={userAnswer === question.correct_answer ? 'text-primary-500' : 'text-destructive'}>{userAnswer || t('aiVoiceTutor.notAnswered')}</span>
                  </div>
                  <div>
                    <span className="font-medium">{t('aiVoiceTutor.correctAnswer')}: </span>
                    <span className="text-primary">{question.correct_answer}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Only show usage stats and duration selection when call is not active */}
            {!isCallActive && (
              <>
                {/* Daily Usage Stats */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-foreground">{t('aiVoiceTutor.dailyUsage')}</span>
                      </div>
                      {!canStartCall && (
                        <Badge variant="destructive">
                          {t('aiVoiceTutor.limitReached')}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">{t('aiVoiceTutor.usedToday')}</div>
                        <div className="font-bold text-lg text-orange-600">{minutesUsedToday} min</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">{t('aiVoiceTutor.remaining')}</div>
                        <div className="font-bold text-lg text-primary">{remainingMinutes} min</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">{t('aiVoiceTutor.dailyLimit')}</div>
                        <div className="font-bold text-lg text-secondary-foreground">{dailyMinutesLimit} min</div>
                      </div>
                    </div>
                    {remainingMinutes > 0 && (
                      <div className="mt-3">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${(remainingMinutes / dailyMinutesLimit) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Purchased Minutes Display */}
                {remainingMinutes === 0 && purchasedMinutes > 0 && (
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-primary-500" />
                          <span className="font-semibold text-foreground">{t('aiVoiceTutor.purchasedMinutes')}</span>
                        </div>
                        {hasPurchasedMinutesOnly && (
                          <Badge className="bg-primary-500/20 text-primary-600 dark:text-primary-400 border-primary-500/30">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {t('aiVoiceTutor.status')}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">{t('aiVoiceTutor.available')}</div>
                          <div className="font-bold text-lg text-primary-600">{purchasedMinutes} min</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">{t('aiVoiceTutor.type')}</div>
                          <div className="font-bold text-lg text-primary-600">{t('aiVoiceTutor.premium')}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">{t('aiVoiceTutor.status')}</div>
                          <div className="font-bold text-lg text-primary-600">{t('aiVoiceTutor.unlimited')}</div>
                        </div>
                      </div>
                      {hasPurchasedMinutesOnly && (
                        <div className="mt-3">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-primary-500 transition-all duration-300"
                              style={{ width: '100%' }}
                            />
                          </div>
                          <div className="mt-2 text-xs text-primary-600 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            <span>{t('aiVoiceTutor.usingPurchasedMinutes')}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* No Minutes Available - Purchase CTA */}
                {hasNoMinutesAvailable && (
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5 text-destructive" />
                          <span className="font-semibold text-foreground">{t('aiVoiceTutor.outOfMinutes')}</span>
                        </div>
                        <Badge variant="destructive">
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          {t('aiVoiceTutor.purchaseRequired')}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <div className="text-muted-foreground">{t('aiVoiceTutor.freeMinutes')}</div>
                          <div className="font-bold text-lg text-destructive">0 min</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">{t('aiVoiceTutor.purchased')}</div>
                          <div className="font-bold text-lg text-destructive">0 min</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">{t('aiVoiceTutor.status')}</div>
                          <div className="font-bold text-lg text-destructive">{t('aiVoiceTutor.exhausted')}</div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground mb-4">
                          {t('aiVoiceTutor.outOfMinutesDescription')}
                        </p>
                        <Button 
                          onClick={() => setShowPurchaseModal(true)}
                          size="lg"
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          {t('aiVoiceTutor.purchaseMinutes')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Call Duration Selection */}
                {canStartCall ? (
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {t('aiVoiceTutor.chooseCallDuration')}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {callDurations.map((duration) => {
                        const maxAvailable = getMaxCallDuration(duration.minutes);
                        const isAvailable = maxAvailable > 0;
                        
                        return (
                          <Button
                            key={duration.minutes}
                            variant={selectedDuration === duration.minutes ? "default" : "outline"}
                            onClick={() => setSelectedDuration(duration.minutes)}
                            disabled={!isAvailable}
                            className="h-auto p-4 flex flex-col gap-2"
                          >
                            <span className="font-semibold">
                              {isAvailable ? `${maxAvailable} min` : duration.label}
                            </span>
                            <span className="text-xs opacity-80">
                              {duration.description}
                            </span>
                            {!isAvailable && (
                              <Badge variant="destructive" className="text-xs">
                                {t('aiVoiceTutor.notEnoughTime')}
                              </Badge>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ) : !hasNoMinutesAvailable && (
                  <Card className="border-orange-500/20 bg-orange-500/5">
                    <CardContent className="p-4 text-center">
                      <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                      <h4 className="font-semibold text-orange-700 mb-2">{t('aiVoiceTutor.dailyLimitReached')}</h4>
                      <p className="text-sm text-orange-600">
                        {t('aiVoiceTutor.dailyLimitReachedDescription', { dailyLimit: dailyMinutesLimit })}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                {isCallActive ? t('aiVoiceTutor.close') : t('aiVoiceTutor.cancel')}
              </Button>
              {!isCallActive && canStartCall && (
                <Button 
                  onClick={() => onStartCall(selectedDuration)}
                  disabled={isConnecting || isCallActive}
                  className="flex-1"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {isConnecting ? t('aiVoiceTutor.connecting') : isCallActive ? t('aiVoiceTutor.inCall') : t('aiVoiceTutor.startCall')}
                </Button>
              )}
              {!isCallActive && hasNoMinutesAvailable && (
                <Button 
                  onClick={() => setShowPurchaseModal(true)}
                  className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {t('aiVoiceTutor.purchaseMinutes')}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Minutes Purchase Modal */}
      <MinutesPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        requiredMinutes={0}
        currentCredits={0}
        onPurchaseSuccess={() => {
          // Refresh the call limitations to update purchased minutes
          refreshLimitations();
        }}
      />
    </>
  );
};
