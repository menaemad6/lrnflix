import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MessageSquare, Send, X, Bot, User, ChevronLeft, Sparkles, Settings, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { resolveEntityId } from './CourseResolver';
import { useChatbot } from '@/contexts/ChatbotContext';
import type { RootState } from '@/store/store';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { useDailyMessagesLimit } from '@/hooks/useAiAssistantSettings';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ActionRequest {
  action: 'create_course' | 'edit_course' | 'delete_course' | 'create_lesson' | 'edit_lesson' | 'delete_lesson';
  description: string;
  data: any;
  originalMessage?: string;
}

interface CourseActionResponse {
  action: string;
  id?: string;
  title?: string;
  description?: string;
  price?: number;
  status?: string;
  instructor_id?: string;
  message?: string;
}

const TEACHER_SYSTEM_PROMPT = `You are an AI teaching assistant for educators on EduPlatform. Your role is to help teachers:
- Create engaging course content and lesson plans
- Develop effective quizzes and assessments
- Manage student groups and discussions
- Analyze student performance and engagement
- Generate creative teaching ideas and activities
- Troubleshoot technical issues with the platform
- Provide pedagogical advice and best practices

Be supportive, professional, and focus on educational excellence. Always encourage innovative teaching methods and student-centered learning approaches.`;

const TEACHER_ACTION_SYSTEM_PROMPT = `You are an AI teaching assistant with action capabilities on EduPlatform. When users request to create, edit, or delete courses, lessons, or other educational content, respond with structured JSON containing the action details.

Available actions:
- create_course: Create a new course
- edit_course: Modify existing course details  
- delete_course: Remove a course
- create_lesson: Add a lesson to a course
- edit_lesson: Modify lesson content
- delete_lesson: Remove a lesson

For each action request, analyze the user's intent and respond with JSON containing the action details. If the request is not actionable or is a general question, respond with action: "none" and provide a helpful response in the message field.

For delete and edit operations, you don't need to provide the exact ID - the system will resolve it automatically based on the entity name mentioned in the request.`;

const STUDENT_SYSTEM_PROMPT = `You are an AI learning companion for students on EduPlatform. Your role is to help students:
- Understand course materials and concepts
- Study effectively and prepare for assessments
- Stay motivated and engaged in their learning journey
- Find relevant learning resources and materials
- Manage their study schedule and goals
- Connect with peers and participate in discussions
- Navigate the platform features effectively

Be encouraging, patient, and supportive. Help break down complex topics into digestible parts and always promote active learning and critical thinking.`;

async function sendMessageToGemini({ message, userRole, actionMode }: { message: string, userRole: string, actionMode: boolean }): Promise<CourseActionResponse[] | { message: string }> {
  const apiKey = 'AIzaSyDrYPsiEl51OzqBx0qoUmiS_99F7OpMCRo';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  let systemPrompt = userRole === 'teacher' ? 
    (actionMode ? TEACHER_ACTION_SYSTEM_PROMPT : TEACHER_SYSTEM_PROMPT) : 
    STUDENT_SYSTEM_PROMPT;

  const body: any = {
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: [
      {
        parts: [{ text: message }]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1000,
    }
  };

  // Add structured response for action mode
  if (actionMode && userRole === 'teacher') {
    body.generationConfig.responseMimeType = "application/json";
    body.generationConfig.responseSchema = {
      type: "array",
      items: {
        type: "object",
        properties: {
          action: { type: "string" },
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          price: { type: "number" },
          status: { type: "string" },
          message: { type: "string" }
        },
        required: ["action", "message"],
        propertyOrdering: ["action", "id", "title", "description", "price", "status", "message"]
      }
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response format from Gemini API');
  }

  const responseText = data.candidates[0].content.parts[0].text;

  if (actionMode && userRole === 'teacher') {
    try {
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      return { message: responseText };
    }
  } else {
    return { message: responseText };
  }
}

// Simple Arabic detection
const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

export const ChatbotSidebar = () => {
  const { isOpen, closeChatbot, openChatbot, sendSystemMessage, systemMessage } = useChatbot();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionMode, setActionMode] = useState(false);
  const [pendingAction, setPendingAction] = useState<ActionRequest | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdCounter = useRef(0);
  const { user } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role || 'student';
  const { toast } = useToast();
  const { limit: dailyMessagesLimit } = useDailyMessagesLimit();

  // Track component mount
  React.useEffect(() => {
    console.log('ChatbotSidebar mounted');
    return () => {
      console.log('ChatbotSidebar unmounted');
    };
  }, []);

  // Check daily message count for students
  useEffect(() => {
    if (userRole === 'student') {
      const today = new Date().toDateString();
      const dailyMessages = localStorage.getItem(`daily_messages_${userRole}_${today}`);
      const count = dailyMessages ? parseInt(dailyMessages) : 0;
      setDailyMessageCount(count);
      setIsRateLimited(count >= dailyMessagesLimit);
    }
  }, [userRole, dailyMessagesLimit]);

  // Generate unique message ID
  const generateMessageId = () => {
    messageIdCounter.current += 1;
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const counter = messageIdCounter.current;
    return `${timestamp}-${counter}-${random}`;
  };

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(`chatbot_history_${userRole}`);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
        // Update counter to avoid conflicts
        const maxId = Math.max(...parsed.map((msg: any) => {
          const parts = msg.id.split('-');
          return parseInt(parts[1]) || 0;
        }), 0);
        messageIdCounter.current = maxId;
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
  }, [userRole]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chatbot_history_${userRole}`, JSON.stringify(messages));
    }
  }, [messages, userRole]);

  // Update daily message count when user sends a message
  const updateDailyMessageCount = () => {
    if (userRole === 'student' && !isRateLimited) {
      const today = new Date().toDateString();
      // Read current count directly from localStorage to avoid state sync issues
      const storedCount = localStorage.getItem(`daily_messages_${userRole}_${today}`);
      const currentCount = (storedCount ? parseInt(storedCount) : 0) + 1;
      setDailyMessageCount(currentCount);
      localStorage.setItem(`daily_messages_${userRole}_${today}`, currentCount.toString());
      
      if (currentCount >= dailyMessagesLimit) {
        setIsRateLimited(true);
        toast({
          title: "Daily Limit Reached",
          description: "You've reached your daily message limit. Come back tomorrow for more conversations!",
          variant: "destructive",
        });
      }
    }
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle system messages from context (e.g., from QuizResults)
  useEffect(() => {
    if (systemMessage && isOpen) {
      // Check rate limit for students before processing system message
      if (userRole === 'student' && isRateLimited) {
        toast({
          title: "Daily Limit Reached",
          description: "You've reached your daily message limit. Come back tomorrow for more conversations!",
          variant: "destructive",
        });
        // Clear the system message without processing
        sendSystemMessage('');
        return;
      }

      // Create a user message from the system message
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'user',
        content: systemMessage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      
      // Update daily message count for students
      if (userRole === 'student') {
        updateDailyMessageCount();
      }
      
      // Send the message to Gemini API
      sendMessageToGeminiAPI(systemMessage);
      
      // Clear the system message
      sendSystemMessage('');
    }
  }, [systemMessage, isOpen, userRole, isRateLimited]);

  const sendMessageToGeminiAPI = async (message: string) => {
    setIsLoading(true);

    try {
      const response = await sendMessageToGemini({ message, userRole, actionMode });

      if (Array.isArray(response)) {
        // Handle action mode response
        const validActions = response.filter(action => action.action && action.action !== 'none');
        
        if (validActions.length > 0) {
          const firstAction = validActions[0];
          
          // For delete and edit operations, resolve the entity ID
          let resolvedData = { ...firstAction };
          if ((firstAction.action === 'delete_course' || firstAction.action === 'edit_course') && userRole === 'teacher') {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
              const resolvedId = await resolveEntityId(message, 'course', currentUser.id);
              if (resolvedId) {
                resolvedData.id = resolvedId;
              } else {
                // If we can't resolve the ID, show an error
                const errorMessage: ChatMessage = {
                  id: generateMessageId(),
                  role: 'assistant',
                  content: `I couldn't find a course matching "${message}". Please make sure the course name is correct and try again.`,
                  timestamp: new Date()
                };
                setMessages(prev => [...prev, errorMessage]);
                setIsLoading(false);
                return;
              }
            }
          }

          // Set pending action for confirmation
          setPendingAction({
            action: resolvedData.action as any,
            description: `I'm about to ${resolvedData.action.replace('_', ' ')}: ${resolvedData.title || resolvedData.id}`,
            data: resolvedData,
            originalMessage: message
          });
          setShowConfirmation(true);
        } else {
          // No valid actions, treat as regular response
          const assistantMessage: ChatMessage = {
            id: generateMessageId(),
            role: 'assistant',
            content: (response as any).message || 'I understand your request. How can I help you further?',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, assistantMessage]);
        }
      } else {
        // Regular response
        const assistantMessage: ChatMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content: (response as any).message || 'I understand your request. How can I help you further?',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    // Check rate limit for students
    if (userRole === 'student' && isRateLimited) {
      toast({
        title: "Daily Limit Reached",
        description: "You've reached your daily message limit. Come back tomorrow for more conversations!",
        variant: "destructive",
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputValue;
    setInputValue('');
    
    // Update daily message count for students
    updateDailyMessageCount();
    
    await sendMessageToGeminiAPI(currentMessage);
  };

  const executeAction = async () => {
    if (!pendingAction) return;

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive",
        });
        return;
      }

      switch (pendingAction.action) {
        case 'create_course':
          const { error: createError } = await supabase
            .from('courses')
            .insert([
              {
                title: pendingAction.data.title,
                description: pendingAction.data.description,
                price: pendingAction.data.price || 0,
                instructor_id: currentUser.id,
                status: pendingAction.data.status || 'draft'
              }
            ]);

          if (createError) throw createError;
          
          toast({
            title: "Success",
            description: "Course created successfully!",
          });
          break;

        case 'delete_course':
          if (!pendingAction.data.id) {
            throw new Error('Course ID is required for deletion');
          }
          
          const { error: deleteError } = await supabase
            .from('courses')
            .delete()
            .eq('id', pendingAction.data.id)
            .eq('instructor_id', currentUser.id);

          if (deleteError) throw deleteError;
          
          toast({
            title: "Success",
            description: "Course deleted successfully!",
          });
          break;

        case 'edit_course':
          if (!pendingAction.data.id) {
            throw new Error('Course ID is required for editing');
          }
          
          const updateData = { ...pendingAction.data };
          delete updateData.id; // Remove id from update data
          delete updateData.action; // Remove action from update data
          delete updateData.message; // Remove message from update data
        
          const { error: editError } = await supabase
            .from('courses')
            .update(updateData)
            .eq('id', pendingAction.data.id)
            .eq('instructor_id', currentUser.id);

          if (editError) throw editError;
          
          toast({
            title: "Success",
            description: "Course updated successfully!",
          });
          break;

        default:
          toast({
            title: "Info",
            description: "Action not yet implemented",
          });
      }

      // Add success message to chat
      const successMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: `✅ Action completed successfully: ${pendingAction.description}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMessage]);

    } catch (error: any) {
      console.error('Error executing action:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to execute action",
        variant: "destructive",
      });

      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: `❌ Failed to execute action: ${error.message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setShowConfirmation(false);
      setPendingAction(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(`chatbot_history_${userRole}`);
  };

  return (
    <>
      {/* Sidebar Content: fill the panel */}
      <div
        className={`fixed inset-0 flex justify-end items-stretch transition-all duration-300 z-[99999] ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        style={{ visibility: isOpen ? 'visible' : 'hidden' }}
      >
        {isOpen && (
          <div className="w-full h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border/20 bg-background/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                    <Bot className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">AI Assistant</h3>
                    <p className="text-xs text-muted-foreground capitalize">{userRole} Helper</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="text-muted-foreground hover:text-primary-400 hover:bg-primary-400/10"
                    title="Clear chat history"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeChatbot}
                    className="text-muted-foreground hover:text-primary-400 hover:bg-primary-400/10"
                    title="Close chatbot"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action Mode Toggle for Teachers */}
              {userRole === 'teacher' && (
                <div className="flex items-center justify-between mt-4 p-4 rounded-2xl bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-primary-500/10 border border-primary-500/20 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                      <Zap className="h-4 w-4 text-black" />
                    </div>
                    <div>
                      <Label htmlFor="action-mode" className="text-sm font-semibold text-foreground cursor-pointer">Action Mode</Label>
                      <p className="text-xs text-muted-foreground">Create, edit & manage content</p>
                    </div>
                  </div>
                  <Switch
                    id="action-mode"
                    checked={actionMode}
                    onCheckedChange={setActionMode}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary-500 data-[state=checked]:to-secondary-500"
                  />
                </div>
              )}

              {/* Daily Message Counter for Students */}
              {userRole === 'student' && (
                <div className={`flex items-center justify-between mt-4 p-4 rounded-2xl backdrop-blur-sm border ${
                  isRateLimited 
                    ? 'bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 border-red-500/20' 
                    : 'bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-primary-500/10 border-primary-500/20'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isRateLimited 
                        ? 'bg-gradient-to-br from-red-500 to-orange-500' 
                        : 'bg-gradient-to-br from-primary-500 to-secondary-500'
                    }`}>
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        Daily Messages
                        {isRateLimited && <span className="ml-2 text-red-400">(Limit Reached)</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isRateLimited 
                          ? 'Come back tomorrow for more conversations!' 
                          : `${dailyMessageCount}/${dailyMessagesLimit} messages used today`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-foreground">{dailyMessageCount}</div>
                    <div className="text-xs text-muted-foreground">/ {dailyMessagesLimit}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Bot className="h-8 w-8 text-primary-400" />
                    </div>
                    <h4 className="font-medium text-primary-400 mb-2">Welcome to AI Assistant!</h4>
                    <p className="text-sm text-muted-foreground">
                      {userRole === 'teacher' ? 
                        'Ask me anything about creating courses, managing students, or teaching strategies. Try "create a new course" or "delete RNA course".' :
                        'Ask me anything about your courses, study tips, or learning strategies.'
                      }
                    </p>
                  </div>
                )}
                
                {messages.map((message) => {
                  const isMsgArabic = isArabic(message.content);
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-black" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-black'
                            : 'bg-white/10 backdrop-blur-sm border border-white/10'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <ReactMarkdown
                            components={{
                              p: ({ node, ...props }) => (
                                <p
                                  className={cn(
                                    'whitespace-pre-wrap break-words mb-1.5 sm:mb-2 md:mb-3 last:mb-0',
                                    isMsgArabic && 'text-right'
                                  )}
                                  dir={isMsgArabic ? 'rtl' : 'ltr'}
                                  {...props}
                                />
                              ),
                              strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                              table: ({ node, ...props }) => <div className="overflow-x-auto w-full my-2 sm:my-3 custom-scrollbar"><table className="w-full border-collapse" {...props} /></div>,
                              thead: ({ node, ...props }) => <thead className="bg-primary/5" {...props} />,
                              tbody: ({ node, ...props }) => <tbody {...props} />,
                              tr: ({ node, ...props }) => <tr className="border-b border-gray-200 dark:border-gray-700" {...props} />,
                              th: ({ node, ...props }) => <th className="py-1 px-2 sm:py-1.5 sm:px-3 text-left font-medium text-xs sm:text-sm" {...props} />,
                              td: ({ node, ...props }) => <td className="py-1 px-2 sm:py-1.5 sm:px-3 text-xs sm:text-sm" {...props} />,
                              ul: ({ node, ...props }) => (
                                <ul
                                  className={cn(
                                    'mb-1.5 sm:mb-2 md:mb-3',
                                    isMsgArabic ? 'pr-3 sm:pr-4' : 'pl-3 sm:pl-4',
                                    isMsgArabic ? 'list-disc-rtl' : 'list-disc'
                                  )}
                                  {...props}
                                />
                              ),
                              ol: ({ node, ...props }) => (
                                <ol
                                  className={cn(
                                    'mb-1.5 sm:mb-2 md:mb-3',
                                    isMsgArabic ? 'pr-3 sm:pr-4' : 'pl-3 sm:pl-4',
                                    isMsgArabic ? 'list-decimal-rtl' : 'list-decimal'
                                  )}
                                  {...props}
                                />
                              ),
                              li: ({ node, ...props }) => <li className="mb-0.5" {...props} />,
                              a: ({ node, href, ...props }) => <a href={href} className="text-primary underline" target="_blank" rel="noopener noreferrer" {...props} />,
                              blockquote: ({ node, ...props }) => (
                                <blockquote
                                  className={cn(
                                    'py-1 my-1.5 sm:my-2 md:my-3 italic text-sm sm:text-base',
                                    isMsgArabic
                                      ? 'border-r-4 border-gray-300 dark:border-gray-600 pr-2 sm:pr-3'
                                      : 'border-l-4 border-gray-300 dark:border-gray-600 pl-2 sm:pl-3'
                                  )}
                                  {...props}
                                />
                              ),
                              code: ({ node, ...props }) => <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-xs" {...props} />,
                              h1: ({ node, ...props }) => <h1 className={cn('text-lg sm:text-xl md:text-2xl font-bold my-1.5 sm:my-2 md:my-3', isMsgArabic && 'text-right')} {...props} />,
                              h2: ({ node, ...props }) => <h2 className={cn('text-base sm:text-lg md:text-xl font-bold my-1.5 sm:my-2', isMsgArabic && 'text-right')} {...props} />,
                              h3: ({ node, ...props }) => <h3 className={cn('text-sm sm:text-base md:text-lg font-bold my-1 sm:my-1.5', isMsgArabic && 'text-right')} {...props} />,
                              h4: ({ node, ...props }) => <h4 className={cn('text-sm sm:text-base font-bold my-1 sm:my-1.5', isMsgArabic && 'text-right')} {...props} />,
                              img: ({ node, ...props }) => <img className="max-w-full h-auto rounded-lg my-1.5 sm:my-2 md:my-3" {...props} />
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        )}
                        <span className="text-xs opacity-70 mt-1 block">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {message.role === 'user' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-black" />
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-3 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-white/5">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    userRole === 'student' && isRateLimited 
                      ? "Daily limit reached. Come back tomorrow!" 
                      : actionMode 
                        ? `Try: "delete RNA course" or "create new course"` 
                        : `Ask your AI ${userRole} assistant...`
                  }
                  className={`flex-1 bg-white/10 border-white/20 focus:border-primary-400 ${
                    userRole === 'student' && isRateLimited ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isLoading || (userRole === 'student' && isRateLimited)}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading || (userRole === 'student' && isRateLimited)}
                  className={`bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-black ${
                    userRole === 'student' && isRateLimited ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {actionMode && (
                <p className="text-xs text-primary-400 mt-2 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Action mode enabled - I can create, edit, and manage your content by name
                </p>
              )}
              {userRole === 'student' && isRateLimited && (
                <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Daily message limit reached. Your limit will reset tomorrow.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="glass-card border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="gradient-text flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Confirm Action
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {pendingAction?.description}
              {pendingAction?.originalMessage && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Based on: "{pendingAction.originalMessage}"
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="btn-secondary">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeAction}
              className="btn-primary"
            >
              Confirm & Execute
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
