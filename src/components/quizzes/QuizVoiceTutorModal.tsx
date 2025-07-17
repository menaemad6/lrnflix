import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCallLimitations } from '@/hooks/useCallLimitations';
import { useVapiCall } from '@/hooks/useVapiCall';
import { CallInterface } from '@/components/lessons/CallInterface';
import { MinutesPurchaseModal } from '@/components/lessons/MinutesPurchaseModal';
import { MessageCircle, Clock, Brain, AlertCircle, CreditCard, ShoppingCart, Sparkles } from 'lucide-react';

interface QuizVoiceTutorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: {
    question_text: string;
    correct_answer: string;
  };
  userAnswer: string;
  lessonId: string;
}

export const QuizVoiceTutorModal = ({ 
  open, 
  onOpenChange, 
  question, 
  userAnswer, 
  lessonId 
}: QuizVoiceTutorModalProps) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(5);
  const [showCallInterface, setShowCallInterface] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [callTimer, setCallTimer] = useState<NodeJS.Timeout | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const { startCall, endCall, isCallActive, isConnecting, isUserSpeaking, isAssistantSpeaking } = useVapiCall();
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
    { minutes: 3, label: '3 minutes', description: 'Quick clarification' },
    { minutes: 5, label: '5 minutes', description: 'Standard help' },
    { minutes: 10, label: '10 minutes', description: 'Detailed explanation' },
    { minutes: 15, label: '15 minutes', description: 'In-depth discussion' }
  ];

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (callTimer) {
        clearInterval(callTimer);
      }
    };
  }, [callTimer]);

  // End call when timer reaches zero
  React.useEffect(() => {
    if (remainingTime <= 0 && isCallActive) {
      handleEndCall();
    }
  }, [remainingTime, isCallActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = async () => {
    const maxDuration = getMaxCallDuration(selectedDuration);
    
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
        agentId: '0c9bf22f-c4bb-4365-93a1-1a2e62016686',
        publicKey: '671e1651-92fb-4bd5-952a-75ea7b42eb8a',
        question: question?.question_text || 'No question available',
        studentAnswer: userAnswer || 'Not answered',
        correctAnswer: question?.correct_answer || 'No correct answer',
        callLength: `${maxDuration} minutes`
      });

      setShowCallInterface(true);
      
      // Start countdown timer with the actual allowed minutes
      setRemainingTime(maxDuration * 60); // Convert to seconds
      const timer = setInterval(() => {
        setRemainingTime(prev => Math.max(0, prev - 1));
      }, 1000);
      setCallTimer(timer);
      
    } catch (error) {
      console.error('Failed to start call:', error);
      setCurrentCallId(null);
      setCallStartTime(null);
    }
  };

  const handleEndCall = async () => {
    // Clear timer
    if (callTimer) {
      clearInterval(callTimer);
      setCallTimer(null);
    }
    
    // Calculate actual duration
    const actualDurationMinutes = callStartTime 
      ? Math.ceil((Date.now() - callStartTime.getTime()) / (1000 * 60))
      : Math.ceil((selectedDuration * 60 - remainingTime) / 60);
    
    // Record call end in database
    if (currentCallId) {
      await recordCallEnd(currentCallId, actualDurationMinutes);
      setCurrentCallId(null);
    }
    
    endCall();
    setRemainingTime(0);
    setCallStartTime(null);
    setShowCallInterface(false);
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

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              {isCallActive ? 'Active Call with Hossam' : 'Ask Hossam for Help'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Question Preview - Always visible */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Question:</h4>
                <p className="text-sm text-muted-foreground mb-3">{question.question_text}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium">Your Answer: </span>
                    <span className="text-orange-600">{userAnswer || 'Not answered'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Correct Answer: </span>
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
                        <span className="font-semibold text-foreground">Daily Usage</span>
                      </div>
                      {!canStartCall && (
                        <Badge variant="destructive">
                          Limit Reached
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Used Today</div>
                        <div className="font-bold text-lg text-orange-600">{minutesUsedToday} min</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Remaining</div>
                        <div className="font-bold text-lg text-primary">{remainingMinutes} min</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Daily Limit</div>
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
                {purchasedMinutes > 0 && (
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-emerald-500" />
                          <span className="font-semibold text-foreground">Purchased Minutes</span>
                        </div>
                        {hasPurchasedMinutesOnly && (
                          <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Available</div>
                          <div className="font-bold text-lg text-emerald-600">{purchasedMinutes} min</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Type</div>
                          <div className="font-bold text-lg text-emerald-600">Premium</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Status</div>
                          <div className="font-bold text-lg text-emerald-600">Unlimited</div>
                        </div>
                      </div>
                      {hasPurchasedMinutesOnly && (
                        <div className="mt-3">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-emerald-500 transition-all duration-300"
                              style={{ width: '100%' }}
                            />
                          </div>
                          <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            <span>Using purchased minutes for this session</span>
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
                          <span className="font-semibold text-foreground">Out of Minutes</span>
                        </div>
                        <Badge variant="destructive">
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Purchase Required
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <div className="text-muted-foreground">Free Minutes</div>
                          <div className="font-bold text-lg text-destructive">0 min</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Purchased</div>
                          <div className="font-bold text-lg text-destructive">0 min</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Status</div>
                          <div className="font-bold text-lg text-destructive">Exhausted</div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground mb-4">
                          You've used all your free minutes for today. Purchase additional minutes to continue learning with your AI tutor.
                        </p>
                        <Button 
                          onClick={() => setShowPurchaseModal(true)}
                          size="lg"
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          Purchase Minutes
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
                      Choose Call Duration
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
                                Not enough time
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
                      <h4 className="font-semibold text-orange-700 mb-2">Daily Limit Reached</h4>
                      <p className="text-sm text-orange-600">
                        You've used all {dailyMinutesLimit} minutes for today. Try again tomorrow!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                {isCallActive ? 'Close' : 'Cancel'}
              </Button>
              {!isCallActive && canStartCall && (
                <Button 
                  onClick={handleStartCall}
                  disabled={isConnecting || isCallActive}
                  className="flex-1"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {isConnecting ? 'Connecting...' : isCallActive ? 'In Call...' : 'Start Call'}
                </Button>
              )}
              {!isCallActive && hasNoMinutesAvailable && (
                <Button 
                  onClick={() => setShowPurchaseModal(true)}
                  className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Purchase Minutes
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Call Interface Modal */}
      <CallInterface
        onEndCall={handleEndCall}
        isCallActive={isCallActive}
        isConnecting={isConnecting}
        isUserSpeaking={isUserSpeaking}
        isAssistantSpeaking={isAssistantSpeaking}
        remainingTime={remainingTime}
      />

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
