
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Bot,
  Volume2,
  Headphones
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface QuizVoiceTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  userAnswer?: string;
  correctAnswer: string;
}

export const QuizVoiceTutorModal = ({
  isOpen,
  onClose,
  question,
  userAnswer,
  correctAnswer
}: QuizVoiceTutorModalProps) => {
  const { t } = useTranslation('courses');
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Bot className="h-5 w-5 mr-2 text-blue-400" />
            {t('aiVoiceTutor.aiQuizTutor')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Question Context */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 space-y-3">
              <div>
                <Badge className="bg-blue-500/20 text-blue-300 mb-2">{t('aiVoiceTutor.question')}</Badge>
                <p className="text-gray-300 text-sm">{question}</p>
              </div>
              
              {userAnswer && (
                <div>
                  <Badge className="bg-orange-500/20 text-orange-300 mb-2">{t('aiVoiceTutor.yourAnswer')}</Badge>
                  <p className="text-gray-300 text-sm">{userAnswer}</p>
                </div>
              )}
              
              <div>
                <Badge className="bg-green-500/20 text-green-300 mb-2">{t('aiVoiceTutor.correctAnswer')}</Badge>
                <p className="text-gray-300 text-sm">{correctAnswer}</p>
              </div>
            </CardContent>
          </Card>

          {/* Voice Interface */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              {!isConnected ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Headphones className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-2">{t('aiVoiceTutor.connectWithAiTutor')}</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {t('aiVoiceTutor.connectWithAiTutorDescription')}
                    </p>
                  </div>
                  <Button
                    onClick={handleConnect}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        <Phone className="h-4 w-4 mr-2" />
                        {t('aiVoiceTutor.startVoiceSession')}
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-secondary-600 rounded-full flex items-center justify-center"
                  >
                    <Bot className="h-8 w-8 text-white" />
                  </motion.div>
                  
                  <div>
                    <h3 className="text-white font-medium mb-2">{t('aiVoiceTutor.connectedToAiTutor')}</h3>
                    <p className="text-gray-400 text-sm">
                      {t('aiVoiceTutor.connectedToAiTutorDescription')}
                    </p>
                  </div>

                  <div className="flex justify-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                      className={`border-gray-600 ${isMuted ? 'bg-red-500/20 text-red-300' : 'bg-gray-800 text-gray-300'}`}
                    >
                      {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 bg-gray-800 text-gray-300"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDisconnect}
                    >
                      <PhoneOff className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 bg-gray-800 text-gray-300 text-xs"
              disabled={!isConnected}
            >
              {t('aiVoiceTutor.explainConcept')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 bg-gray-800 text-gray-300 text-xs"
              disabled={!isConnected}
            >
              {t('aiVoiceTutor.practiceSimilar')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
