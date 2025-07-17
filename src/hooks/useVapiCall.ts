import { useState, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

export interface VapiCallOptions {
  agentId: string;
  publicKey: string;
  systemPrompt?: string;

  // Lesson Summary
  lessonTitle?: string;
  lessonSummary?: string;
  studentNotes?: string;
  
  // Quiz Question Answering
  question?: string;
  studentAnswer?: string;
  correctAnswer?: string;

  callLength?: string;
}

export const useVapiCall = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [vapi, setVapi] = useState<Vapi | null>(null);

  const startCall = useCallback(async (options: VapiCallOptions) => {
    try {
      setIsConnecting(true);
      
      // Initialize Vapi client
      const vapiClient = new Vapi(options.publicKey);
      setVapi(vapiClient);

      // Set up event listeners
      vapiClient.on('call-start', () => {
        console.log('Vapi call started');
        setIsCallActive(true);
        setIsConnecting(false);
      });

      vapiClient.on('call-end', () => {
        console.log('Vapi call ended');
        setIsCallActive(false);
        setIsConnecting(false);
        setIsUserSpeaking(false);
        setIsAssistantSpeaking(false);
      });

      vapiClient.on('error', (error) => {
        console.error('Vapi error:', error);
        setIsCallActive(false);
        setIsConnecting(false);
        setIsUserSpeaking(false);
        setIsAssistantSpeaking(false);
      });

      // Create assistant overrides object exactly as documented
      const assistantOverrides = {
        variableValues: {
          // Lesson summary case
          lessonTitle: options.lessonTitle,
          lessonSummary: options.lessonSummary || 'No summary available for this lesson.',
          studentNotes: options.studentNotes || 'No additional notes provided.',
          callLength: options.callLength || '5 minutes',
          // Quiz question case
          question: options.question,
          studentAnswer: options.studentAnswer,
          correctAnswer: options.correctAnswer
        }
      };

      // Start the call with assistant ID and overrides
      await vapiClient.start(
        options.agentId,
        assistantOverrides
      );

    } catch (error) {
      console.error('Failed to start Vapi call:', error);
      setIsConnecting(false);
      setIsCallActive(false);
      setIsUserSpeaking(false);
      setIsAssistantSpeaking(false);
    }
  }, []);

  const endCall = useCallback(() => {
    if (vapi) {
      vapi.stop();
      setVapi(null);
    }
    setIsCallActive(false);
    setIsConnecting(false);
    setIsUserSpeaking(false);
    setIsAssistantSpeaking(false);
  }, [vapi]);

  return {
    isCallActive,
    isConnecting,
    isUserSpeaking,
    isAssistantSpeaking,
    startCall,
    endCall
  };
};
