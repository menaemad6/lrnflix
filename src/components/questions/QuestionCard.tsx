
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
  profiles?: {
    full_name: string;
    avatar_url?: string;
  } | null;
  answer_count?: number;
}

interface QuestionCardProps {
  question: Question;
  onUpdate: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onUpdate }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();
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
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
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
        description: 'Question deleted successfully',
      });

      onUpdate();
    } catch (error: unknown) {
      console.error('Error deleting question:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete question',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't toggle if clicking on buttons or interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('[role="button"]') ||
      target.closest('[data-radix-popper-content-wrapper]') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('a')
    ) {
      return;
    }
    
    setShowAnswers(!showAnswers);
  };

  return (
    <Card className="group glass-card border-0 hover-glow transition-all duration-300 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm shadow-lg hover:shadow-xl cursor-pointer">
      <CardHeader className="pb-4 relative">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={`${getStatusColor(question.status)} border`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
          </Badge>
          
          {!question.allow_student_answers && (
            <Badge variant="outline" className="text-purple-500 border-purple-500/30 bg-purple-500/5">
              <Users className="h-3 w-3 mr-1" />
              Admins Only
            </Badge>
          )}
          
          {question.is_anonymous && (
            <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/5">
              <User className="h-3 w-3 mr-1" />
              Anonymous
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
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {canEdit && (
                  <DropdownMenuItem
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-green-600 focus:text-green-600"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Question
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete Question'}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6" onClick={handleCardClick}>
        {/* Question Content */}
        <div className="space-y-4">
          <div className="prose prose-lg max-w-none text-foreground">
            <p className="text-lg leading-relaxed font-medium">{question.content}</p>
          </div>

          {/* AI-Generated Title */}
          <div className="border-t border-border/50 pt-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-xs">AI-Generated Title</span>
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
                    ? 'Anonymous' 
                    : question.profiles?.full_name || 'Unknown User'
                  }
                </p>
                {question.is_anonymous && canSeeAnonymousNames && (
                  <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/30 bg-amber-500/5">
                    <User className="h-3 w-3 mr-1" />
                    Anonymous
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
              <span className="hidden sm:inline">AI Answer</span>
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
              <span className="hidden sm:inline">AI Suggestions</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowAnswers(!showAnswers);
              }}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              <span>{question.answer_count || 0}</span>
              <span className="hidden sm:inline ml-1">Answers</span>
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
