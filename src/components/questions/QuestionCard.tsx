
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { QuestionAnswers } from './QuestionAnswers';
import { EditQuestionModal } from './EditQuestionModal';
import { useChatbot } from '@/contexts/ChatbotContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageSquare, 
  User, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle,
  AlertCircle,
  Users,
  Bot,
  Sparkles,
  TrendingUp,
  ThumbsUp,
  Share2,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useTenant } from '@/contexts/TenantContext';
import type { RootState } from '@/store/store';

interface Question {
  id: string;
  title: string;
  content: string;
  is_anonymous: boolean;
  allow_student_answers: boolean;
  created_at: string;
  updated_at: string;
  status: string;
  student_id: string;
  instructor_id: string | null;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  } | null;
  answer_count?: number;
}

interface QuestionCardProps {
  question: Question;
  onUpdate: () => void;
  onQuestionClick: (questionId: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onUpdate, onQuestionClick }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();
  const { t } = useTranslation('other');
  const { teacher } = useTenant();
  const [showAnswers, setShowAnswers] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { openChatbot, sendSystemMessage } = useChatbot();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'resolved': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'closed': return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return CheckCircle;
      case 'closed': return AlertCircle;
      default: return MessageSquare;
    }
  };

  const handleAIAnswer = () => {
    const systemPrompt = `You are an expert AI assistant that helps answer questions from students. 

A student has asked the following question:

Title: ${question.title}
Question: ${question.content}

Please provide a comprehensive, helpful, and accurate answer to this question. Your response should be:
- Clear and easy to understand
- Educational and informative
- Well-structured with examples if relevant
- Encouraging and supportive

Please analyze the question carefully and provide the best possible answer to help the student learn.`;

    sendSystemMessage(systemPrompt);
    openChatbot();
  };

  const handleAISuggestion = () => {
    const systemPrompt = `You are an AI learning assistant. A student has asked this question:

Title: ${question.title}
Question: ${question.content}

Please provide:
1. Related topics they should explore
2. Follow-up questions that would deepen their understanding
3. Study resources or methods that would help
4. Common misconceptions in this area to avoid

Keep your suggestions practical and actionable.`;

    sendSystemMessage(systemPrompt);
    openChatbot();
  };

  const StatusIcon = getStatusIcon(question.status);
  const isOwner = user?.id === question.student_id;
  const canEdit = isOwner || user?.role === 'teacher' || user?.role === 'admin';
  const canDelete = isOwner || user?.role === 'teacher' || user?.role === 'admin';
  const canSeeAnonymousNames = user?.role === 'teacher' || user?.role === 'admin';

  const handleDelete = async () => {
    if (!confirm(t('questionsPage.confirmDelete'))) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', question.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: t('questionsPage.success.questionDeleted'),
      });

      onUpdate();
    } catch (error: unknown) {
      console.error('Error deleting question:', error);
      toast({
        title: 'Error',
        description: t('questionsPage.error.failedToDelete'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResolve = async () => {
    console.log('Attempting to resolve question:', question.id);
    console.log('Current user:', user);
    console.log('User role:', user?.role);
    console.log('Question status before:', question.status);
    
    try {
      // First, let's verify the user has the right permissions
      if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
        throw new Error('User does not have permission to resolve questions');
      }

      const { data, error } = await supabase
        .from('questions')
        .update({ status: 'resolved' })
        .eq('id', question.id)
        .select('status')
        .single();

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        
        // Check if it's a permissions error
        if (error.code === '42501') {
          throw new Error('Permission denied: RLS policy may be blocking the update');
        }
        
        throw error;
      }

      if (!data || data.status !== 'resolved') {
        throw new Error('Question status was not updated');
      }

      console.log('Question resolved successfully:', data);

      toast({
        title: 'Success',
        description: t('questionsPage.success.questionResolved'),
      });

      onUpdate();
    } catch (error: unknown) {
      console.error('Error resolving question:', error);
      
      let errorMessage = t('questionsPage.error.failedToResolve');
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Removed the handleCardClick function as it was interfering with nested replies

  return (
    <Card 
      className="group glass-card border-0 hover-glow transition-all duration-300 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm shadow-lg hover:shadow-xl cursor-pointer"
      onClick={() => onQuestionClick(question.id)}
    >
      <CardHeader className="pb-4 relative">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={`${getStatusColor(question.status)} border`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {t(`questionsPage.status.${question.status}`)}
          </Badge>
          
          {!question.allow_student_answers && (
            <Badge variant="outline" className="text-purple-500 border-purple-500/30 bg-purple-500/5">
              <Users className="h-3 w-3 mr-1" />
              {t('questionsPage.badges.adminsOnly')}
            </Badge>
          )}
          
          {question.is_anonymous && (
            <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/5">
              <User className="h-3 w-3 mr-1" />
              {t('questionsPage.badges.anonymous')}
            </Badge>
          )}
          
          {/* Platform Indicator - Show when question is asked in current user's platform */}
          {question.instructor_id && user?.id && teacher?.user_id &&  question.instructor_id === teacher.id && user.id === teacher.user_id && (
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/5">
              <Users className="h-3 w-3 mr-1" />
              {t('questionsPage.badges.askedInYourPlatform')}
            </Badge>
          )}
        </div>

        {/* Dropdown Menu for Edit/Delete - Always in top right corner */}
        {(canEdit || canDelete) && (
          <div className="absolute top-4 right-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-muted/50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">{t('questionsPage.actions.openMenu')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {canEdit && (
                  <DropdownMenuItem
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-green-600 focus:text-green-600"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t('questionsPage.actions.editQuestion')}
                  </DropdownMenuItem>
                )}
                {/* Resolve Option - Only for teachers and admins */}
                {(user?.role === 'teacher' || user?.role === 'admin') && question.status !== 'resolved' && (
                  <DropdownMenuItem
                    onClick={handleResolve}
                    className="text-green-600 focus:text-green-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t('questionsPage.actions.resolve')}
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? t('questionsPage.actions.deleting') : t('questionsPage.actions.deleteQuestion')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Content */}
        <div className="space-y-4">
          <div className="prose prose-lg max-w-none text-foreground">
            <p className="text-lg leading-relaxed font-medium">{question.content}</p>
          </div>

          {/* AI-Generated Title */}
          <div className="border-t border-border/50 pt-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-xs">{t('questionsPage.aiGeneratedTitle')}</span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
              {question.title}
            </h3>

          </div>
        </div>

        {/* User Info and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-3 bg-primary/5 rounded-lg p-3 border border-primary/10">
            {question.is_anonymous && !canSeeAnonymousNames ? (
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                  <User className="h-4 w-4 text-primary/60" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage src={question.profiles?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                  {question.profiles?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="text-sm">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">
                  {question.is_anonymous && !canSeeAnonymousNames 
                    ? t('questionsPage.anonymous') 
                    : question.profiles?.full_name || t('questionsPage.unknownUser')
                  }
                </p>
                {question.is_anonymous && canSeeAnonymousNames && (
                  <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/30 bg-amber-500/5">
                    <User className="h-3 w-3 mr-1" />
                    {t('questionsPage.badges.anonymous')}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleAIAnswer();
              }}
              className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 transition-colors"
            >
              <Bot className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{t('questionsPage.actions.aiAnswer')}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleAISuggestion();
              }}
              className="text-purple-500 hover:text-purple-600 hover:bg-purple-500/10 transition-colors"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{t('questionsPage.actions.aiSuggestions')}</span>
            </Button>

            {/* Resolve Button - Only for teachers and admins */}
            {(user?.role === 'teacher' || user?.role === 'admin') && question.status !== 'resolved' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResolve();
                }}
                className="text-green-500 hover:text-green-600 hover:bg-green-500/10 transition-colors"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{t('questionsPage.actions.resolve')}</span>
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowAnswers(!showAnswers);
              }}
              className="flex-1 transition-colors"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              <span>{question.answer_count || 0}</span>
              <span className="ml-1">{t('questionsPage.answers.answers')}</span>
              {showAnswers ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>
        </div>

        {/* Answer Section */}
        {showAnswers && (
          <div className="border-t border-border/50 pt-6">
            <QuestionAnswers 
              questionId={question.id}
              allowStudentAnswers={question.allow_student_answers}
              onUpdate={onUpdate}
            />
          </div>
        )}
      </CardContent>

      {/* Edit Question Modal */}
      <EditQuestionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        question={question}
        onQuestionUpdated={onUpdate}
      />
    </Card>
  );
};
