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

interface VoiceTutorProps {
  lessonTitle: string;
  lessonSummary: string | null;
  lessonId: string;
}

const VAPI_CONFIG = {
  agentId: 'e136d4c4-87d9-4de4-be87-57ff736908e6',
  publicKey: '671e1651-92fb-4bd5-952a-75ea7b42eb8a',

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
      alert('This lesson doesn\'t have a summary yet. Please contact your instructor to add one.');
      return;
    }

    if (!canStartCall) {
      alert('You have reached your daily free minutes limit. Please try again tomorrow or purchase additional minutes.');
      return;
    }

    const requestedMinutes = parseInt(callLength);
    const maxAllowedMinutes = getMaxCallDuration(requestedMinutes);
    
    if (maxAllowedMinutes <= 0) {
      alert('You don\'t have enough remaining minutes for this call duration.');
      return;
    }

    if (maxAllowedMinutes < requestedMinutes) {
      alert(`You only have ${maxAllowedMinutes} minutes remaining today. The call will be limited to ${maxAllowedMinutes} minutes.`);
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
        alert('Failed to start call. Please try again.');
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
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading call limitations...</p>
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
        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg border border-border/50">
                  <Brain className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  AI Voice Tutor
                </div>
                <div className="text-muted-foreground text-sm font-medium">
                  Powered by Advanced AI • Personalized Learning
                </div>
              </div>
            </div>
            
            {/* Premium Badge */}
            <Badge variant="secondary" className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
              <Zap className="h-4 w-4 text-yellow-500 mr-2" />
              <span className="text-yellow-600 dark:text-yellow-400 font-semibold">Premium Feature</span>
            </Badge>
          </div>

          {/* Daily Usage Status */}
          <div className="mb-6 p-4 bg-card/50 backdrop-blur-sm border-border/50 rounded-xl">
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
          </div>

          {/* Purchased Minutes Display */}
          {purchasedMinutes > 0 && (
            <div className="mb-6 p-4 bg-card/50 backdrop-blur-sm border-border/50 rounded-xl">
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
            </div>
          )}

          {/* No Minutes Available - Purchase CTA */}
          {hasNoMinutesAvailable && (
            <div className="mb-6 p-4 bg-card/50 backdrop-blur-sm border-border/50 rounded-xl">
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
            </div>
          )}

          {/* Call Length Selection */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-5 w-5 text-primary" />
              <label className="text-foreground font-semibold">Session Duration</label>
            </div>
            <Select value={callLength} onValueChange={setCallLength} disabled={isCallActive || hasNoMinutesAvailable}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 minutes</SelectItem>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="20">20 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
              </SelectContent>
            </Select>
            {parseInt(callLength) > remainingMinutes && remainingMinutes > 0 && (
              <div className="mt-2 flex items-center gap-2 text-amber-600 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Call will be limited to {remainingMinutes} minutes (your remaining daily limit).</span>
              </div>
            )}
            {hasNoMinutesAvailable && (
              <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>You need to purchase minutes to start a session.</span>
              </div>
            )}
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Lesson Content Status */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div className="text-foreground font-semibold">Lesson Content</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground text-sm">
                    Required for voice session
                  </div>
                  {lessonSummary ? (
                    <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                      ✓ Available
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      Missing Summary
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Status */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <User className="h-5 w-5 text-primary" />
                  <div className="text-foreground font-semibold">Hossam - AI Tutor</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground text-sm">
                    Ready for conversation
                  </div>
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    Online
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Notes */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <label className="text-foreground font-semibold">
                Focus Areas (Optional)
              </label>
            </div>
            <Textarea
              placeholder="Tell Hossam what specific topics you'd like to focus on during your conversation..."
              value={studentNotes}
              onChange={(e) => setStudentNotes(e.target.value)}
              rows={3}
              disabled={isCallActive || hasNoMinutesAvailable}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl resize-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-muted-foreground text-xs mt-2">
              These notes help Hossam personalize the conversation to your learning needs.
            </p>
          </div>

          {/* Call Status & Main Action */}
          <div className="text-center">
            {/* Status Display */}
            <div className="mb-8">
              {isCallActive ? (
                <div className="flex items-center justify-center gap-3 text-green-500 mb-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="font-semibold">Connected with Hossam</span>
                  <span className="text-sm">({formatTime(remainingTime)} remaining)</span>
                </div>
              ) : isConnecting ? (
                <div className="flex items-center justify-center gap-3 text-yellow-500 mb-4">
                  <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-semibold">Connecting to Hossam...</span>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="text-foreground text-xl font-semibold mb-2">Ready to Start Learning</div>
                  <div className="text-muted-foreground">Click the button below to begin your personalized voice session</div>
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
                  className={`relative w-40 h-40 rounded-full text-white border-0 shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 z-10 cursor-pointer ${
                    hasNoMinutesAvailable
                      ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-red-500/25'
                      : 'bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 hover:shadow-primary/25'
                  }`}
                  type="button"
                >
                  <div className="flex flex-col items-center gap-2 pointer-events-none px-2">
                    {hasNoMinutesAvailable ? (
                      <ShoppingCart className="h-10 w-10" />
                    ) : (
                      <Mic className="h-12 w-12" />
                    )}
                    <span className="text-sm font-semibold text-center leading-tight">
                      {hasNoMinutesAvailable ? 'Purchase\nMinutes' : 'Start Session'}
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
                className="w-32 h-32 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer z-10"
                type="button"
              >
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                  <Phone className="h-10 w-10 transform rotate-[135deg]" />
                  <span className="text-sm font-semibold">End Call</span>
                </div>
              </Button>
            )}
          </div>

          {/* Feature Highlights */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div className="text-foreground text-sm font-medium">Natural Conversation</div>
              <div className="text-muted-foreground text-xs">Speak naturally and ask questions</div>
            </div>
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div className="text-foreground text-sm font-medium">Personalized Learning</div>
              <div className="text-muted-foreground text-xs">Adapts to your learning style</div>
            </div>
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="text-foreground text-sm font-medium">Instant Feedback</div>
              <div className="text-muted-foreground text-xs">Real-time explanations and help</div>
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
