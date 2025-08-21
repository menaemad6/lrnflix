import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  MessageSquare, 
  Clock, 
  User, 
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Flag,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  Calendar,
  Send
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { QuestionAnswers } from './QuestionAnswers';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import {  HiddenScrollbar } from '@/components/ui/hidden-scrollbar';

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

interface QuestionDetailModalProps {
  questionId: string;
  questions: Question[];
  onClose: () => void;
}

export const QuestionDetailModal = ({ questionId, questions, onClose }: QuestionDetailModalProps) => {
  const { t } = useTranslation('other');
  const { user } = useSelector((state: RootState) => state.auth);
  const [question, setQuestion] = useState<Question | null>(null);

  useEffect(() => {
    const foundQuestion = questions.find(q => q.id === questionId);
    setQuestion(foundQuestion || null);
  }, [questionId, questions]);

  if (!question) {
    return null;
  }

  const canEdit = user && (user.id === question.student_id || user.role === 'teacher' || user.role === 'admin');
  const canSeeAnonymousNames = user && (user.role === 'teacher' || user.role === 'admin');
  const displayName = !question.is_anonymous || canSeeAnonymousNames 
    ? question.profiles?.full_name || t('questionsPage.anonymous')
    : t('questionsPage.anonymous');

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-screen overflow-hidden p-0 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex flex-col h-full min-h-0">
          {/* Modern Header with Gradient */}
          <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/5 border-b border-border/50 flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50" />
            <div className="relative p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Status and Metadata Row */}
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge 
                      variant={question.status === 'open' ? 'default' : 'secondary'}
                      className={`${
                        question.status === 'open' 
                          ? 'bg-green-500/20 text-green-600 border-green-500/30 shadow-sm' 
                          : 'bg-blue-500/20 text-blue-600 border-blue-500/30 shadow-sm'
                      } px-3 py-1 text-sm font-medium`}
                    >
                      {question.status === 'open' ? t('questionsPage.status.open') : t('questionsPage.status.resolved')}
                    </Badge>
                    {question.allow_student_answers && (
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 px-3 py-1 text-sm">
                        {t('questionsPage.allowStudentAnswers')}
                      </Badge>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
                      <Eye className="h-4 w-4" />
                      <span>{t('questionsPage.questionDetail.badges.public')}</span>
                    </div>
                  </div>
                  
                  {/* Question Title */}
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight text-foreground">
                    {question.content}
                  </h1>
                  {/* Question Content */}
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-foreground leading-relaxed text-sm">
                      {question.title} <span className="text-xs text-muted-foreground">{t('questionsPage.aiGeneratedTitle')}</span>
                    </div>
                  </div>
                  
                  {/* User Info and Timestamps */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                        <AvatarImage src={question.profiles?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                                          <div>
                      <p className="font-medium text-foreground">{displayName}</p>
                      <p className="text-xs">{t('questionsPage.questionDetail.labels.questionAuthor')}</p>
                    </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 sm:ml-auto">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{t('questionsPage.questionDetail.labels.asked')} {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>{question.answer_count || 0} {t('questionsPage.answerCount')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-10 w-10 p-0 rounded-full bg-background/80 hover:bg-background/90 border border-border/50"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 sm:p-6 space-y-6">
              {/* Action Bar */}
              <div className="bg-card/30 rounded-xl p-4 border border-border/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                      <div className="flex flex-wrap items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-9 px-4 hover:bg-blue-500/10 hover:text-blue-600">
                        <Share2 className="h-4 w-4 mr-2" />
                        {t('questionsPage.questionDetail.actions.share')}
                      </Button>

                      {canEdit && (
                        <>
                          <Button variant="ghost" size="sm" className="h-9 px-4 hover:bg-primary/10 hover:text-primary">
                            <Edit className="h-4 w-4 mr-2" />
                            {t('questionsPage.actions.editQuestion')}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-9 px-4 hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('questionsPage.actions.deleteQuestion')}
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" className="h-9 px-4 hover:bg-orange-500/10 hover:text-orange-600">
                        <Flag className="h-4 w-4 mr-2" />
                        {t('questionsPage.questionDetail.actions.report')}
                      </Button>
                    </div>
                </div>
              </div>

              {/* Answers Section */}
              <div className="bg-card/50 rounded-xl border border-border/50 shadow-sm overflow-hidden">
                <div className="p-4">
                  <QuestionAnswers 
                    questionId={question.id}
                    allowStudentAnswers={question.allow_student_answers}
                    onUpdate={() => {
                      // Refresh the question data if needed
                      console.log('Question updated');
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
