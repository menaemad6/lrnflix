
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

interface CallInterfaceProps {
  isCallActive: boolean;
  isConnecting: boolean;
  isUserSpeaking: boolean;
  isAssistantSpeaking: boolean;
  onEndCall: () => void;
  studentName?: string;
  remainingTime?: number;
}

export const CallInterface: React.FC<CallInterfaceProps> = ({
  isCallActive,
  isConnecting,
  onEndCall,
  studentName = "You",
  remainingTime = 0
}) => {
  const [callDuration, setCallDuration] = useState(0);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isCallActive && !isConnecting) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 backdrop-blur-sm z-[9999] pointer-events-auto flex flex-col h-screen">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Enhanced Header */}
      <div className="flex justify-between items-center p-8 text-white relative z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
            <div className="absolute inset-0 w-4 h-4 bg-emerald-500 rounded-full animate-ping opacity-30"></div>
          </div>
          <div>
            <div className="text-xl font-semibold">
              {isConnecting ? 'Connecting to Hossam...' : 'Voice Session with Hossam'}
            </div>
            <div className="text-emerald-400 text-sm">AI Tutor • Live Session</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-bold">
            {isConnecting ? '00:00' : formatDuration(callDuration)}
          </div>
          {remainingTime > 0 && (
            <div className="text-sm text-gray-400">
              {formatDuration(remainingTime)} remaining
            </div>
          )}
          <div className="text-sm text-gray-400">Duration</div>
        </div>
      </div>

      {/* Enhanced Video Call Layout */}
      <div className="flex-1 flex relative">
        {/* Student Side */}
        <div className="flex-1 relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-indigo-900/30"></div>
          
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center">
              {/* Enhanced Avatar */}
              <div className="relative mx-auto mb-6 transition-all duration-500 scale-100 hover:scale-105">
                <div className="w-40 h-40 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-2xl relative overflow-hidden">
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/50 to-purple-500/50 animate-pulse"></div>
                  <span className="relative z-10">{studentName.charAt(0).toUpperCase()}</span>
                </div>
              </div>

              {/* Enhanced Name Display */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">{studentName}</h3>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <p className="text-blue-300 font-medium">Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Divider */}
        <div className="w-1 bg-gradient-to-b from-transparent via-white/20 to-transparent relative">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/30 rounded-full"></div>
        </div>

        {/* AI Side */}
        <div className="flex-1 relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-teal-900/20 to-green-900/30"></div>
          
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center">
              {/* Enhanced AI Avatar */}
              <div className="relative mx-auto mb-6 transition-all duration-500 scale-100 hover:scale-105">
                <div className="w-40 h-40 bg-gradient-to-br from-emerald-500 via-teal-500 to-green-500 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-2xl relative overflow-hidden">
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/50 to-teal-500/50 animate-pulse"></div>
                  <span className="relative z-10">H</span>
                </div>
              </div>

              {/* Enhanced Name Display */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Hossam</h3>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <p className="text-emerald-300 font-medium">AI Tutor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simplified Call Controls */}
      <div className="p-10 flex justify-center relative z-10 flex-shrink-0">
        <div className="flex items-center justify-center">
          {/* End Call Button */}
          <Button
            variant="destructive"
            size="lg"
            onClick={onEndCall}
            className="w-20 h-20 rounded-full bg-red-500/90 hover:bg-red-600 shadow-2xl shadow-red-500/40 transition-all duration-300 hover:scale-110 border-2 border-red-400"
          >
            <Phone className="h-8 w-8 text-white transform rotate-[135deg]" />
          </Button>
        </div>
      </div>

      {/* Connection Status Indicator */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/70 text-sm">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        <span>Connected • High Quality</span>
      </div>
    </div>
  );
};
