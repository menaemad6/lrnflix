import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVapiCall } from '@/hooks/useVapiCall';
import { useCallLimitations } from '@/hooks/useCallLimitations';
import { Mic, MessageSquare, User, Phone, Sparkles, Brain, Zap, Clock, AlertTriangle, CreditCard, ShoppingCart } from 'lucide-react';
import { CallInterface } from './CallInterface';
import { MinutesPurchaseModal } from './MinutesPurchaseModal';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

interface VoiceTutorProps {
  lessonTitle: string;
  lessonSummary: string | null;
  lessonId: string;
}

const VAPI_CONFIG = {
  agentId: import.meta.env.VITE_VAPI_TUTOR_AGENT_ID,
  publicKey: import.meta.env.VITE_VAPI_ACCOUNT_PUBLIC_KEY,

//   systemPrompt: `You are Hossam, an AI-powered voice tutor helping students understand lessons through friendly, supportive voice conversations.

// ## 🎯 Purpose
// - Your goal is to help the student understand the topic covered in the **lesson summary** provided below.
// - Only use the information in the summary — do not make up details beyond it.
// - If the student asks a question that's not covered in the summary, respond kindly with:
//   "This summary doesn't include that topic, but I'd be happy to go over it with you later if it's added!"

// ## ⏰ Session Management
// - This session is limited to {{callLength}} minutes.
// - Keep track of time and provide gentle reminders when approaching the end.
// - When you have about 1 minute left, say: "We have about a minute left in our session. Let's wrap up with any final questions."

// ## 👤 Personality & Tone
// - You are warm, friendly, and encouraging — like a helpful private tutor.
// - Speak in a natural, conversational tone.
// - Explain things clearly, step-by-step, using examples when possible.
// - Never sound robotic or overly formal. Use casual expressions like:  
//   "Alright, let's break that down…" or "Hmm, that's a great question!"

// ## 🗣️ Speech Style
// - Use short, clear sentences.
// - Vary sentence length to sound natural.
// - Include small human touches: "let's see," "I think what this means is…"
// - Keep each response under 40 seconds when possible.
// - Repeat or rephrase if asked — make it even simpler the second time.

// ## 🔁 Conversation Flow

// Start every session with:
// "Hi! I'm Hossam, your voice tutor for this lesson. We have {{callLength}} minutes together. What part of the topic would you like to go over?"

// Encourage the student throughout:
// - "You're asking great questions!"
// - "That's an important part of the lesson — let's walk through it together."
// - "You're doing really well, don't worry if it's tricky."

// End the session warmly:
// "I'm really glad we explored this together. You're doing great — keep going!"

// ---

// ## 🧠 Lesson Context

// **Lesson Title**: {{lessonTitle}}

// **Lesson Summary**:
// {{lessonSummary}}

// (Optional) **Student Notes**:
// {{studentNotes}}

// ---

// ## 🚫 Important Rules
// - Do **not** answer based on outside knowledge — use only the summary above.
// - Do **not** invent facts — if the answer isn't in the summary, gently say so.
// - If the student seems confused, rephrase it in a simpler way or give an example.`


};

export const VoiceTutor: React.FC<VoiceTutorProps> = ({
  lessonTitle,
  lessonSummary,
  lessonId
}) => {
  const { t } = useTranslation('courses');
  const { isCallActive, isConnecting, isUserSpeaking, isAssistantSpeaking, startCall, endCall } = useVapiCall();
  const {
    dailyMinutesLimit,
    minutesUsedToday,
    remainingMinutes,
    canStartCall,
    loading: limitationsLoading,
    recordCallStart,
    recordCallEnd,
    getMaxCallDuration,
    purchasedMinutes,
    refreshLimitations
  } = useCallLimitations(lessonId);

  const [studentNotes, setStudentNotes] = useState('');
  const [callLength, setCallLength] = useState('5'); // Default 5 minutes
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [callTimer, setCallTimer] = useState<NodeJS.Timeout | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [usingPurchasedMinutes, setUsingPurchasedMinutes] = useState(false);

  useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      if (callTimer) {
        clearInterval(callTimer);
      }
    };
  }, [callTimer]);

  useEffect(() => {
    // End call when timer reaches zero
    if (remainingTime <= 0 && isCallActive) {
      handleEndCall();
    }
  }, [remainingTime, isCallActive]);

  useEffect(() => {
    if (!limitationsLoading && remainingMinutes === 0 && purchasedMinutes > 0 && !usingPurchasedMinutes) {
      setUsingPurchasedMinutes(true);
    }
    if (remainingMinutes > 0 && usingPurchasedMinutes) {
      setUsingPurchasedMinutes(false);
    }
  }, [limitationsLoading, remainingMinutes, purchasedMinutes, usingPurchasedMinutes]);

  const handleStartCall = async () => {
    console.log('Start call button clicked');
    console.log('Lesson summary exists:', !!lessonSummary);
    
    if (!lessonSummary) {
      alert(t('aiVoiceTutor.lessonSummaryMissing'));
      return;
    }

    if (!canStartCall) {
      alert(t('aiVoiceTutor.dailyLimitReachedAlert'));
      return;
    }

    const requestedMinutes = parseInt(callLength);
    const maxAllowedMinutes = getMaxCallDuration(requestedMinutes);
    
    if (maxAllowedMinutes <= 0) {
      alert(t('aiVoiceTutor.notEnoughMinutesAlert'));
      return;
    }

    if (maxAllowedMinutes < requestedMinutes) {
      alert(t('aiVoiceTutor.limitedMinutesAlert', { maxMinutes: maxAllowedMinutes }));
    }

    console.log('Starting Vapi call with config:', {
      agentId: VAPI_CONFIG.agentId,
      publicKey: VAPI_CONFIG.publicKey,
      lessonTitle,
      lessonSummary,
      studentNotes,
      callLength: `${maxAllowedMinutes} minutes`
    });

    try {
      // Record call start in database
      const callId = await recordCallStart(lessonId);
      if (!callId) {
        alert(t('aiVoiceTutor.failedToStartCallAlert'));
        return;
      }

      setCurrentCallId(callId);
      setCallStartTime(new Date());

      await startCall({
        ...VAPI_CONFIG,
        lessonTitle,
        lessonSummary,
        studentNotes,
        callLength: `${maxAllowedMinutes} minutes`
      });
      
      // Start countdown timer with the actual allowed minutes
      setRemainingTime(maxAllowedMinutes * 60); // Convert to seconds
      const timer = setInterval(() => {
        setRemainingTime(prev => Math.max(0, prev - 1));
      }, 1000);
      setCallTimer(timer);
      
      console.log('Vapi call started successfully');
    } catch (error) {
      console.error('Failed to start Vapi call:', error);
      // Clean up if call failed to start
      setCurrentCallId(null);
      setCallStartTime(null);
    }
  };

  const handleEndCall = async () => {
    console.log('End call button clicked');
    
    // Clear timer
    if (callTimer) {
      clearInterval(callTimer);
      setCallTimer(null);
    }
    
    // Calculate actual duration
    const actualDurationMinutes = callStartTime 
      ? Math.ceil((Date.now() - callStartTime.getTime()) / (1000 * 60))
      : Math.ceil((parseInt(callLength) * 60 - remainingTime) / 60);
    
    // Record call end in database
    if (currentCallId) {
      await recordCallEnd(currentCallId, actualDurationMinutes);
      setCurrentCallId(null);
    }
    
    console.log(`Call ended. Minutes used: ${actualDurationMinutes}`);
    
    endCall();
    setRemainingTime(0);
    setCallStartTime(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (limitationsLoading) {
    return (
      <Card className="relative overflow-hidden border bg-gradient-to-br from-background via-background to-muted/20 shadow-xl">
        <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
          <p className="text-muted-foreground text-sm sm:text-base">{t('aiVoiceTutor.loadingCallLimitations')}</p>
        </CardContent>
      </Card>
    );
  }

  // Check if user has no minutes available at all
  const hasNoMinutesAvailable = remainingMinutes === 0 && purchasedMinutes === 0;
  const hasPurchasedMinutesOnly = remainingMinutes === 0 && purchasedMinutes > 0;

  return (
    <>
      {/* AI Voice Tutor Section */}
      <Card className="relative overflow-hidden border bg-gradient-to-br from-background via-background to-muted/20 shadow-xl">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg border border-border/50">
                  <Brain className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-foreground mb-1">
                  {t('aiVoiceTutor.title')}
                </div>
                <div className="text-muted-foreground text-xs sm:text-sm font-medium">
                  {t('aiVoiceTutor.poweredByAdvancedAi')}
                </div>
              </div>
            </div>
            
            {/* Premium Badge */}
            <Badge variant="primary" className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-primary-500/20 to-primary-400/20 border-primary-500/30 text-xs sm:text-sm">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-primary-500 mr-1.5 sm:mr-2" />
              <span className="text-primary-600 dark:text-primary-400 font-semibold">{t('aiVoiceTutor.premiumFeature')}</span>
            </Badge>
          </div>

          {/* Daily Usage Status */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-card/50 backdrop-blur-sm border-border/50 rounded-lg sm:rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span className="font-semibold text-foreground text-sm sm:text-base">{t('aiVoiceTutor.dailyUsage')}</span>
              </div>
              {!canStartCall && (
                <Badge variant="destructive" className="text-xs">
                  {t('aiVoiceTutor.limitReached')}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div>
                <div className="text-muted-foreground">{t('aiVoiceTutor.usedToday')}</div>
                <div className="font-bold text-base sm:text-lg text-orange-600">{minutesUsedToday} min</div>
              </div>
              <div>
                <div className="text-muted-foreground">{t('aiVoiceTutor.remaining')}</div>
                <div className="font-bold text-base sm:text-lg text-primary">{remainingMinutes} min</div>
              </div>
              <div>
                <div className="text-muted-foreground">{t('aiVoiceTutor.dailyLimit')}</div>
                <div className="font-bold text-base sm:text-lg text-secondary-foreground">{dailyMinutesLimit} min</div>
              </div>
            </div>
            {remainingMinutes > 0 && (
              <div className="mt-2 sm:mt-3">
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${(remainingMinutes / dailyMinutesLimit) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Purchased Minutes Display */}
          {purchasedMinutes > 0 && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-card/50 backdrop-blur-sm border-border/50 rounded-lg sm:rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" />
                  <span className="font-semibold text-foreground text-sm sm:text-base">{t('aiVoiceTutor.purchasedMinutes')}</span>
                </div>
                {hasPurchasedMinutesOnly && (
                  <Badge className="bg-primary-500/20 text-primary-600 dark:text-primary-400 border-primary-500/30 text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {t('aiVoiceTutor.status')}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <div className="text-muted-foreground">{t('aiVoiceTutor.available')}</div>
                  <div className="font-bold text-base sm:text-lg text-primary-600">{purchasedMinutes} min</div>
                </div>
                <div>
                  <div className="text-muted-foreground">{t('aiVoiceTutor.type')}</div>
                  <div className="font-bold text-base sm:text-lg text-primary-600">{t('aiVoiceTutor.premium')}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">{t('aiVoiceTutor.status')}</div>
                  <div className="font-bold text-base sm:text-lg text-primary-600">{t('aiVoiceTutor.unlimited')}</div>
                </div>
              </div>
              {hasPurchasedMinutesOnly && (
                <div className="mt-2 sm:mt-3">
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
            </div>
          )}

          {/* No Minutes Available - Purchase CTA */}
          {hasNoMinutesAvailable && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-card/50 backdrop-blur-sm border-border/50 rounded-lg sm:rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
                  <span className="font-semibold text-foreground text-sm sm:text-base">{t('aiVoiceTutor.outOfMinutes')}</span>
                </div>
                <Badge variant="destructive" className="text-xs">
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  {t('aiVoiceTutor.purchaseRequired')}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm mb-3 sm:mb-4">
                <div>
                  <div className="text-muted-foreground">{t('aiVoiceTutor.freeMinutes')}</div>
                  <div className="font-bold text-base sm:text-lg text-destructive">0 min</div>
                </div>
                <div>
                  <div className="text-muted-foreground">{t('aiVoiceTutor.purchased')}</div>
                  <div className="font-bold text-base sm:text-lg text-destructive">0 min</div>
                </div>
                <div>
                  <div className="text-muted-foreground">{t('aiVoiceTutor.status')}</div>
                  <div className="font-bold text-base sm:text-lg text-destructive">{t('aiVoiceTutor.exhausted')}</div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground mb-3 sm:mb-4 text-sm">
                  {t('aiVoiceTutor.outOfMinutesDescription')}
                </p>
                <Button 
                  onClick={() => setShowPurchaseModal(true)}
                  size="lg"
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                >
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {t('aiVoiceTutor.purchaseMinutes')}
                </Button>
              </div>
            </div>
          )}

          {/* Call Length Selection */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <label className="text-foreground font-semibold text-sm sm:text-base">{t('aiVoiceTutor.sessionDuration')}</label>
            </div>
            <Select value={callLength} onValueChange={setCallLength} disabled={isCallActive || hasNoMinutesAvailable}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('aiVoiceTutor.selectDuration')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 {t('aiVoiceTutor.minutes')}</SelectItem>
                <SelectItem value="5">5 {t('aiVoiceTutor.minutes')}</SelectItem>
                <SelectItem value="10">10 {t('aiVoiceTutor.minutes')}</SelectItem>
                <SelectItem value="15">15 {t('aiVoiceTutor.minutes')}</SelectItem>
                <SelectItem value="20">20 {t('aiVoiceTutor.minutes')}</SelectItem>
                <SelectItem value="30">30 {t('aiVoiceTutor.minutes')}</SelectItem>
              </SelectContent>
            </Select>
            {parseInt(callLength) > remainingMinutes && remainingMinutes > 0 && (
              <div className="mt-2 flex items-center gap-2 text-amber-600 text-xs sm:text-sm">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{t('aiVoiceTutor.callLimitedWarning', { remaining: remainingMinutes })}</span>
              </div>
            )}
            {hasNoMinutesAvailable && (
              <div className="mt-2 flex items-center gap-2 text-red-600 text-xs sm:text-sm">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{t('aiVoiceTutor.needPurchaseWarning')}</span>
              </div>
            )}
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Lesson Content Status */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <div className="text-foreground font-semibold text-sm sm:text-base">{t('aiVoiceTutor.lessonContent')}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground text-xs sm:text-sm">
                    {t('aiVoiceTutor.requiredForVoiceSession')}
                  </div>
                  {lessonSummary ? (
                    <Badge variant='default' className="text-xs">
                      ✓ {t('aiVoiceTutor.available')}
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      {t('aiVoiceTutor.missingSummary')}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Status */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <div className="text-foreground font-semibold text-sm sm:text-base">{t('aiVoiceTutor.hossamAiTutor')}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground text-xs sm:text-sm">
                    {t('aiVoiceTutor.readyForConversation')}
                  </div>
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                    {t('aiVoiceTutor.online')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Notes */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <label className="text-foreground font-semibold text-sm sm:text-base">
                {t('aiVoiceTutor.focusAreas')}
              </label>
            </div>
            <Textarea
              placeholder={t('aiVoiceTutor.focusAreasPlaceholder')}
              value={studentNotes}
              onChange={(e) => setStudentNotes(e.target.value)}
              rows={3}
              disabled={isCallActive || hasNoMinutesAvailable}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-lg sm:rounded-xl resize-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-sm"
            />
            <p className="text-muted-foreground text-xs mt-2">
              {t('aiVoiceTutor.focusAreasHelp')}
            </p>
          </div>

          {/* Call Status & Main Action */}
          <div className="text-center">
            {/* Status Display */}
            <div className="mb-6 sm:mb-8">
              {isCallActive ? (
                <div className="flex items-center justify-center gap-2 sm:gap-3 text-primary-500 mb-3 sm:mb-4 text-sm sm:text-base">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="font-semibold">{t('aiVoiceTutor.connectedWithHossam')}</span>
                  <span className="text-xs sm:text-sm">({t('aiVoiceTutor.remaining')} {formatTime(remainingTime)})</span>
                </div>
              ) : isConnecting ? (
                <div className="flex items-center justify-center gap-2 sm:gap-3 text-yellow-500 mb-3 sm:mb-4 text-sm sm:text-base">
                  <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-semibold">{t('aiVoiceTutor.connectingToHossam')}</span>
                </div>
              ) : (
                <div className="mb-4 sm:mb-6">
                  <div className="text-foreground text-lg sm:text-xl font-semibold mb-2">{t('aiVoiceTutor.readyToStartLearning')}</div>
                  <div className="text-muted-foreground text-sm sm:text-base">{t('aiVoiceTutor.readyToStartDescription')}</div>
                </div>
              )}
            </div>

            {/* Main Action Button */}
            {!isCallActive && !isConnecting ? (
              <div className="relative flex justify-center">
                {/* Glowing background effect */}
                <div className={`absolute inset-0 rounded-full opacity-60 blur-xl scale-150 animate-pulse pointer-events-none ${
                  hasNoMinutesAvailable 
                    ? 'bg-gradient-to-r from-red-500/20 to-orange-500/30' 
                    : 'bg-gradient-to-r from-primary/20 to-primary/30'
                }`}></div>
                
                {/* Main Button */}
                <Button 
                  onClick={hasNoMinutesAvailable ? () => setShowPurchaseModal(true) : handleStartCall}
                  disabled={!lessonSummary || (hasNoMinutesAvailable ? false : !canStartCall)}
                  size="lg"
                  className={`relative w-32 h-32 sm:w-40 sm:h-40 rounded-full text-white border-0 shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 z-10 cursor-pointer ${
                    hasNoMinutesAvailable
                      ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-red-500/25'
                      : 'bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 hover:shadow-primary/25'
                  }`}
                  type="button"
                >
                  <div className="flex flex-col items-center gap-1 sm:gap-2 pointer-events-none px-2">
                    {hasNoMinutesAvailable ? (
                      <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10" />
                    ) : (
                      <Mic className="h-10 w-10 sm:h-12 sm:w-12" />
                    )}
                    <span className="text-xs sm:text-sm font-semibold text-center leading-tight">
                      {hasNoMinutesAvailable ? `${t('aiVoiceTutor.purchaseMinutes')}\n` : t('aiVoiceTutor.startSession')}
                    </span>
                  </div>
                </Button>

                {/* Ripple Effect */}
                <div className={`absolute inset-0 rounded-full border-2 animate-ping pointer-events-none ${
                  hasNoMinutesAvailable ? 'border-red-500/30' : 'border-primary/30'
                }`}></div>
                <div className={`absolute inset-2 rounded-full border animate-ping pointer-events-none ${
                  hasNoMinutesAvailable ? 'border-red-500/20' : 'border-primary/20'
                }`} style={{ animationDelay: '0.5s' }}></div>
              </div>
            ) : (
              <Button 
                onClick={handleEndCall}
                variant="destructive"
                size="lg"
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer z-10"
                type="button"
              >
                <div className="flex flex-col items-center gap-1 sm:gap-2 pointer-events-none">
                  <Phone className="h-8 w-8 sm:h-10 sm:w-10 transform rotate-[135deg]" />
                  <span className="text-xs sm:text-sm font-semibold">{t('aiVoiceTutor.endCall')}</span>
                </div>
              </Button>
            )}
          </div>

          {/* Feature Highlights */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-center">
            <div className="flex flex-col items-center gap-2 p-3 sm:p-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="text-foreground text-xs sm:text-sm font-medium">{t('aiVoiceTutor.naturalConversation')}</div>
              <div className="text-muted-foreground text-xs">{t('aiVoiceTutor.naturalConversationDescription')}</div>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 sm:p-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="text-foreground text-xs sm:text-sm font-medium">{t('aiVoiceTutor.personalizedLearning')}</div>
              <div className="text-muted-foreground text-xs">{t('aiVoiceTutor.personalizedLearningDescription')}</div>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="text-foreground text-xs sm:text-sm font-medium">{t('aiVoiceTutor.instantFeedback')}</div>
              <div className="text-muted-foreground text-xs">{t('aiVoiceTutor.instantFeedbackDescription')}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Call Interface Overlay */}
      <CallInterface
        isCallActive={isCallActive}
        isConnecting={isConnecting}
        isUserSpeaking={isUserSpeaking}
        isAssistantSpeaking={isAssistantSpeaking}
        onEndCall={handleEndCall}
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
