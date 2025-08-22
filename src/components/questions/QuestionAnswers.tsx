import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  User, 
  Clock, 
  Send, 
  Loader2,
  CheckCircle,
  Star,
  EyeOff,
  Reply,
  MoreHorizontal,
  ThumbsUp,
  Share2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import type { RootState } from '@/store/store';

interface ReplyItemProps {
  reply: Answer;
  canSeeAnonymousNames: boolean;
  onLike: (answerId: string) => void;
  onReply: (replyId: string) => void;
  likedAnswers: Set<string>;
  localLikesCount: Record<string, number>;
  nestingLevel: number;
  replyingToReply: string | null;
  replyContent: string;
  setReplyContent: (content: string) => void;
  replyAnonymous: boolean;
  setReplyAnonymous: (anonymous: boolean) => void;
  onSubmitReply: (parentId: string) => void;
  submittingReply: boolean;
  onCancelReply: () => void;
  isFirst: boolean;
  isLast: boolean;
  expandedReplies: Record<string, boolean>;
  repliesLoading: Record<string, boolean>;
  repliesData: Record<string, Answer[]>;
  repliesCount: Record<string, number>;
  handleToggleReplies: (parentId: string) => Promise<void>;
}

const ReplyItem: React.FC<ReplyItemProps> = ({
  reply,
  canSeeAnonymousNames,
  onLike,
  onReply,
  likedAnswers,
  localLikesCount,
  nestingLevel,
  replyingToReply,
  replyContent,
  setReplyContent,
  replyAnonymous,
  setReplyAnonymous,
  onSubmitReply,
  submittingReply,
  onCancelReply,
  isFirst,
  isLast,
  expandedReplies,
  repliesLoading,
  repliesData,
  repliesCount,
  handleToggleReplies
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation('other');
  const indentLevel = Math.min(nestingLevel, 3); // Max 3 levels deep
  
  const getIndentClass = (level: number) => {
    switch (level) {
      case 1: return 'ml-1 sm:ml-2 md:ml-4';
      case 2: return 'ml-2 sm:ml-4 md:ml-8';
      case 3: return 'ml-3 sm:ml-6 md:ml-12';
      default: return 'ml-1 sm:ml-2 md:ml-4';
    }
  };

  return (
    <div className={`${getIndentClass(indentLevel)} ${isFirst ? 'mt-3 sm:mt-4 md:mt-6' : ''} mb-2 sm:mb-3`}>
      <div className="bg-muted/50 rounded-lg p-2 sm:p-3 border border-border relative">
        {/* Facebook-style connection lines - responsive */}
        <div className="absolute -left-1 sm:-left-2 md:-left-4 top-6 w-1 sm:w-2 md:w-4 h-px bg-primary/60"></div>
        {!isLast && (
          <div className="absolute -left-1 sm:-left-2 md:-left-4 top-6 w-px h-full bg-primary/60"></div>
        )}
        {!isFirst && (
          <div className="absolute -left-1 sm:-left-2 md:-left-4 top-0 w-px h-6 bg-primary/60"></div>
        )}
        
        {/* Reply Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-6 w-6 sm:h-8 sm:w-8 ring-1 ring-border">
            {reply.is_anonymous && !canSeeAnonymousNames ? (
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-xs">
                <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary/60" />
              </AvatarFallback>
            ) : (
              <>
                <AvatarImage src={reply.profiles?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-xs">
                  {reply.profiles?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </>
            )}
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium text-foreground">
                {reply.is_anonymous && !canSeeAnonymousNames
                  ? t('questionsPage.anonymous')
                  : reply.profiles?.full_name || t('questionsPage.unknownUser')
                }
              </p>
              
              {reply.profiles?.role === 'teacher' && (
                <Badge variant="outline" className="text-xs text-blue-500 border-blue-500/30 bg-blue-500/5">
                  <Star className="h-3 w-3 mr-1" />
                  Teacher
                </Badge>
              )}
              
              {reply.profiles?.role === 'admin' && (
                <Badge variant="outline" className="text-xs text-purple-500 border-purple-500/30 bg-purple-500/5">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
              
              {reply.is_anonymous && canSeeAnonymousNames && (
                <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/30 bg-amber-500/5">
                  <User className="h-3 w-3 mr-1" />
                  {t('questionsPage.badges.anonymous')}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>

        {/* Reply Content */}
        <div className="prose prose-sm max-w-none text-foreground mb-3">
          {reply.content}
        </div>

        {/* Reply Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(reply.id)}
            className={`h-7 px-2 text-xs hover:bg-primary/10 transition-colors ${
              likedAnswers.has(reply.id) ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <ThumbsUp className={`h-3 w-3 ${likedAnswers.has(reply.id) ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">{likedAnswers.has(reply.id) ? t('questionsPage.answers.unlike') : t('questionsPage.answers.like')}</span>
            {(localLikesCount[reply.id] || reply.likes_count) > 0 && (
              <span className="text-xs">({localLikesCount[reply.id] || reply.likes_count})</span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReply(reply.id)}
            className="h-7 px-2 text-xs text-muted-foreground hover:bg-primary/10 transition-colors"
          >
            <Reply className="h-3 w-3" />
            <span className="hidden sm:inline">{t('questionsPage.answers.reply')}</span>
          </Button>

          {/* Reply Form for this specific reply */}
          {replyingToReply === reply.id && (
            <div className="w-full mt-3 p-3 bg-background/50 rounded-lg border border-border">
              <div className="text-xs text-muted-foreground mb-2">
                {t('questionsPage.answers.replyingTo')} {reply.is_anonymous && !canSeeAnonymousNames
                  ? t('questionsPage.anonymous')
                  : reply.profiles?.full_name || t('questionsPage.unknownUser')
                }
              </div>
              
              <Textarea
                placeholder={t('questionsPage.answers.answerPlaceholder')}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px] mb-3"
              />
              
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Switch
                    id={`reply-anonymous-${reply.id}`}
                    checked={replyAnonymous}
                    onCheckedChange={setReplyAnonymous}
                  />
                  <Label htmlFor={`reply-anonymous-${reply.id}`} className="text-xs sm:text-sm">
                    {t('questionsPage.answers.postAnonymously')}
                  </Label>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancelReply}
                  disabled={submittingReply}
                  className="text-xs"
                >
                  {t('questionsPage.answers.cancelReply')}
                </Button>
                
                <Button
                  size="sm"
                  onClick={() => onSubmitReply(reply.id)}
                  disabled={submittingReply || !replyContent.trim()}
                  className="text-xs"
                >
                  {submittingReply ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      {t('questionsPage.answers.replying')}
                    </>
                  ) : (
                    t('questionsPage.answers.postAnswer')
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Nested Replies */}
        {repliesCount[reply.id] > 0 && (
          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleReplies(reply.id)}
              className="h-7 px-2 text-xs text-muted-foreground hover:bg-primary/10 transition-colors"
            >
              {expandedReplies[reply.id] ? (
                <>
                  {t('questionsPage.answers.hideReplies')}
                </>
              ) : (
                <>
                  {t('questionsPage.answers.showReplies')} ({repliesCount[reply.id]})
                </>
              )}
            </Button>
            
            {expandedReplies[reply.id] && (
              <div className="mt-3 space-y-2">
                {repliesLoading[reply.id] ? (
                  <div className="text-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    <p className="text-xs text-muted-foreground mt-2">{t('questionsPage.answers.loadingReplies')}</p>
                  </div>
                ) : repliesData[reply.id]?.length > 0 ? (
                  repliesData[reply.id].map((nestedReply, index) => (
                    <ReplyItem
                      key={nestedReply.id}
                      reply={nestedReply}
                      canSeeAnonymousNames={canSeeAnonymousNames}
                      onLike={onLike}
                      onReply={onReply}
                      likedAnswers={likedAnswers}
                      localLikesCount={localLikesCount}
                      nestingLevel={nestingLevel + 1}
                      replyingToReply={replyingToReply}
                      replyContent={replyContent}
                      setReplyContent={setReplyContent}
                      replyAnonymous={replyAnonymous}
                      setReplyAnonymous={setReplyAnonymous}
                      onSubmitReply={onSubmitReply}
                      submittingReply={submittingReply}
                      onCancelReply={onCancelReply}
                      isFirst={index === 0}
                      isLast={index === repliesData[reply.id].length - 1}
                      expandedReplies={expandedReplies}
                      repliesLoading={repliesLoading}
                      repliesData={repliesData}
                      repliesCount={repliesCount}
                      handleToggleReplies={handleToggleReplies}
                    />
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    {t('questionsPage.answers.noReplies')}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface AnswerItemProps {
  answer: Answer;
  canSeeAnonymousNames: boolean;
  onReply: (replyId?: string) => void;
  onLike: (answerId: string) => void;
  isLiked: boolean;
  likedAnswers: Set<string>;
  localLikesCount: Record<string, number>;
  replyingTo: string | null;
  replyingToReply: string | null;
  replyContent: string;
  setReplyContent: (content: string) => void;
  replyAnonymous: boolean;
  setReplyAnonymous: (anonymous: boolean) => void;
  onSubmitReply: (parentId: string) => void;
  submittingReply: boolean;
  onCancelReply: () => void;
  isFirst: boolean;
  isLast: boolean;
  expandedReplies: Record<string, boolean>;
  repliesLoading: Record<string, boolean>;
  repliesData: Record<string, Answer[]>;
  repliesCount: Record<string, number>;
  handleToggleReplies: (parentId: string) => Promise<void>;
}

const AnswerItem: React.FC<AnswerItemProps> = ({
  answer,
  canSeeAnonymousNames,
  onReply,
  onLike,
  isLiked,
  likedAnswers,
  localLikesCount,
  replyingTo,
  replyingToReply,
  replyContent,
  setReplyContent,
  replyAnonymous,
  setReplyAnonymous,
  onSubmitReply,
  submittingReply,
  onCancelReply,
  isFirst,
  isLast,
  expandedReplies,
  repliesLoading,
  repliesData,
  repliesCount,
  handleToggleReplies
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isReplying = replyingTo === answer.id;
  const { t } = useTranslation('other');

  return (
    <div className="space-y-3">
      {/* Main Answer */}
      <div className="bg-card rounded-lg p-3 sm:p-4 shadow-sm border border-border">
        <div className="flex items-start gap-2 sm:gap-3">
          {/* Avatar */}
          {answer.is_anonymous && !canSeeAnonymousNames ? (
            <Avatar className="h-6 w-6 sm:h-10 sm:w-10 flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-amber-500/10 text-xs sm:text-sm">
                <User className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-6 w-6 sm:h-10 sm:w-10 flex-shrink-0">
              <AvatarImage src={answer.profiles?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-xs sm:text-sm">
                {answer.profiles?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
              <span className="font-semibold text-xs sm:text-sm text-foreground">
                {answer.is_anonymous && !canSeeAnonymousNames 
                  ? t('questionsPage.anonymous') 
                  : answer.profiles?.full_name || t('questionsPage.unknownUser')
                }
              </span>
              
              {answer.profiles?.role === 'teacher' && (
                <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-500">
                  <Star className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Teacher</span>
                </Badge>
              )}
              
              {answer.profiles?.role === 'admin' && (
                <Badge variant="secondary" className="text-xs bg-red-500/10 text-red-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Admin</span>
                </Badge>
              )}

              {answer.is_anonymous && canSeeAnonymousNames && (
                <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/30 bg-amber-500/5">
                  <User className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Anonymous</span>
                </Badge>
              )}

              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
              </span>
            </div>

            {/* Answer Content */}
            <div className="text-xs sm:text-sm text-foreground mb-3 leading-relaxed">
              {answer.content}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <button 
                onClick={() => onLike(answer.id)}
                className={`flex items-center gap-1 transition-colors ${
                  isLiked 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <ThumbsUp className={`h-3 w-3 sm:h-4 sm:w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">{isLiked ? t('questionsPage.answers.liked') : t('questionsPage.answers.like')}</span>
                {(localLikesCount[answer.id] || answer.likes_count) > 0 && (
                  <span className="text-xs">({localLikesCount[answer.id] || answer.likes_count})</span>
                )}
              </button>
              
              <button 
                onClick={() => onReply()}
                className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
              >
                <Reply className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{t('questionsPage.answers.reply')}</span>
                {answer.replies && answer.replies.length > 0 && (
                  <span className="text-xs">({answer.replies.length})</span>
                )}
              </button>
              
              <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{t('questionsPage.answers.share')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Form for Main Answer */}
      {isReplying && !replyingToReply && (
        <div className="ml-6 sm:ml-12 bg-muted/50 rounded-lg p-3 sm:p-4 border border-border">
          <div className="flex items-start gap-3">
            <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-xs sm:text-sm">
                {user?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div className="text-xs text-muted-foreground mb-2">
                {t('questionsPage.answers.replyingTo')} {answer.is_anonymous && !canSeeAnonymousNames 
                  ? t('questionsPage.anonymous') 
                  : answer.profiles?.full_name || t('questionsPage.unknownUser')
                }
              </div>
              <Textarea
                placeholder={t('questionsPage.answers.answerPlaceholder')}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px] resize-none w-full max-w-full overflow-hidden"
                style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
              />
              
              <div className="space-y-3">
                {/* Anonymous toggle */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="reply-anonymous"
                    checked={replyAnonymous}
                    onCheckedChange={setReplyAnonymous}
                  />
                  <Label htmlFor="reply-anonymous" className="text-sm">
                    {t('questionsPage.answers.postAnonymously')}
                  </Label>
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-col xs:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCancelReply}
                    disabled={submittingReply}
                    className="px-3 py-2 h-auto"
                  >
                    {t('questionsPage.answers.cancelReply')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onSubmitReply(answer.id)}
                    disabled={submittingReply || !replyContent.trim()}
                    className="px-3 py-2 h-auto"
                  >
                    {submittingReply ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t('questionsPage.answers.replying')}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {t('questionsPage.answers.reply')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Replies */}
      {repliesCount[answer.id] > 0 && (
        <button
          className="text-primary text-xs font-medium mt-2 ml-1 sm:ml-2 hover:underline"
          onClick={() => handleToggleReplies(answer.id)}
        >
          {expandedReplies[answer.id] ? (
            t('questionsPage.answers.hideReplies')
          ) : (
            `${t('questionsPage.answers.showReplies')} (${repliesCount[answer.id]})`
          )}
        </button>
      )}
      {expandedReplies[answer.id] && (
        <div className="ml-3 sm:ml-6 md:ml-12 space-y-0">
          {repliesLoading[answer.id] ? (
            <div className="text-muted-foreground text-xs py-2">{t('questionsPage.answers.loadingReplies')}</div>
          ) : (
            (repliesData[answer.id] || []).map((reply, index) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                canSeeAnonymousNames={canSeeAnonymousNames}
                onLike={onLike}
                onReply={(replyId) => onReply(replyId)}
                likedAnswers={likedAnswers}
                localLikesCount={localLikesCount}
                nestingLevel={reply.nestingLevel || 1}
                replyingToReply={replyingToReply}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                replyAnonymous={replyAnonymous}
                setReplyAnonymous={setReplyAnonymous}
                onSubmitReply={onSubmitReply}
                submittingReply={submittingReply}
                onCancelReply={onCancelReply}
                isFirst={index === 0}
                isLast={index === (repliesData[answer.id]?.length || 1) - 1}
                expandedReplies={expandedReplies}
                repliesLoading={repliesLoading}
                repliesData={repliesData}
                repliesCount={repliesCount}
                handleToggleReplies={handleToggleReplies}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

interface Answer {
  id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  is_accepted: boolean;
  user_id: string;
  parent_id?: string | null;
  likes_count?: number;
  nestingLevel?: number;
  profiles?: {
    full_name: string;
    avatar_url?: string;
    role: string;
  } | null;
  replies?: Answer[];
}

interface QuestionAnswersProps {
  questionId: string;
  allowStudentAnswers: boolean;
  onUpdate: () => void;
}

export const QuestionAnswers: React.FC<QuestionAnswersProps> = ({
  questionId,
  allowStudentAnswers,
  onUpdate,
}) => {
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newAnswer, setNewAnswer] = useState({
    content: '',
    is_anonymous: false,
  });
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyAnonymous, setReplyAnonymous] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [likedAnswers, setLikedAnswers] = useState<Set<string>>(new Set());
  const [localLikesCount, setLocalLikesCount] = useState<Record<string, number>>({});
  const [replyingToReply, setReplyingToReply] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [repliesLoading, setRepliesLoading] = useState<Record<string, boolean>>({});
  const [repliesData, setRepliesData] = useState<Record<string, Answer[]>>({});
  const [repliesCount, setRepliesCount] = useState<Record<string, number>>({});

  const canSeeAnonymousNames = user?.role === 'teacher' || user?.role === 'admin';
  const { t } = useTranslation('other');

  useEffect(() => {
    fetchAnswers();
    
    // Set up real-time subscription for answers
    const answersChannel = supabase
      .channel(`question-answers-${questionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'question_answers',
          filter: `question_id=eq.${questionId}`
        },
        (payload) => {
          console.log('Answer change received:', payload);
          if (payload.eventType === 'INSERT') {
            fetchAnswers(); // Refresh to get profile data
          } else if (payload.eventType === 'UPDATE') {
            setAnswers(prev => prev.map(answer => 
              answer.id === payload.new.id ? { ...answer, ...payload.new } : answer
            ));
          } else if (payload.eventType === 'DELETE') {
            setAnswers(prev => prev.filter(answer => answer.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(answersChannel);
    };
  }, [questionId]);

  // Helper to fetch direct reply count for a parent
  async function fetchReplyCount(parentId: string) {
    const { count, error } = await supabase
      .from('question_answers')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', parentId);
    if (error) throw error;
    return count || 0;
  }

  // Helper to fetch direct replies for a parent
  async function fetchReplies(parentId: string) {
    const { data, error } = await supabase
      .from('question_answers')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  // Fetch top-level answers and their reply counts
  const fetchAnswers = async () => {
    setLoading(true);
    try {
      const { data: answersData, error: answersError } = await supabase
        .from('question_answers')
        .select('*')
        .eq('question_id', questionId)
        .is('parent_id', null)
        .order('created_at', { ascending: true });
      if (answersError) throw answersError;

      // Get profile data and reply count for each answer
      const answersWithMeta = await Promise.all(
        (answersData || []).map(async (answer) => {
          let profileData = null;
          if (!answer.is_anonymous || canSeeAnonymousNames) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url, role')
              .eq('id', answer.user_id)
              .single();
            profileData = profile;
          }
          // Fetch reply count
          const count = await fetchReplyCount(answer.id);
          setRepliesCount((prev) => ({ ...prev, [answer.id]: count }));
          return {
            ...answer,
            profiles: profileData,
            replies: [],
          };
        })
      );
      setAnswers(answersWithMeta);
    } catch (error: any) {
      console.error('Error fetching answers:', error);
      toast({
        title: 'Error',
        description: t('questionsPage.error.failedToLoadAnswers'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler to expand/collapse and fetch replies for a parent
  const handleToggleReplies = useCallback(async (parentId: string) => {
    const willExpand = !expandedReplies[parentId];
    setExpandedReplies((prev) => ({ ...prev, [parentId]: !prev[parentId] }));
    
    if (willExpand) {
      setRepliesLoading((prev) => ({ ...prev, [parentId]: true }));
      try {
        const replies = await fetchReplies(parentId);
        // Fetch profile and reply count for each reply
        const repliesWithMeta = await Promise.all(
          replies.map(async (reply) => {
            let profileData = null;
            if (!reply.is_anonymous || canSeeAnonymousNames) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, avatar_url, role')
                .eq('id', reply.user_id)
                .single();
              profileData = profile;
            }
            // Fetch reply count for this reply
            const count = await fetchReplyCount(reply.id);
            setRepliesCount((prev) => ({ ...prev, [reply.id]: count }));
            return {
              ...reply,
              profiles: profileData,
              replies: [],
            };
          })
        );
        setRepliesData((prev) => ({ ...prev, [parentId]: repliesWithMeta }));
      } catch (error) {
        toast({
          title: 'Error',
          description: t('questionsPage.error.failedToLoadReplies'),
          variant: 'destructive',
        });
      } finally {
        setRepliesLoading((prev) => ({ ...prev, [parentId]: false }));
      }
    }
  }, [expandedReplies, canSeeAnonymousNames]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Error',
        description: t('questionsPage.error.mustBeLoggedIn'),
        variant: 'destructive',
      });
      return;
    }

    if (!newAnswer.content.trim()) {
      toast({
        title: 'Error',
        description: t('questionsPage.error.pleaseEnterQuestion'),
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('question_answers')
        .insert({
          question_id: questionId,
          user_id: user.id,
          content: newAnswer.content.trim(),
          is_anonymous: newAnswer.is_anonymous,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: t('questionsPage.success.questionPosted'),
      });

      setNewAnswer({ content: '', is_anonymous: false });
      fetchAnswers();
      onUpdate();
    } catch (error: any) {
      console.error('Error posting answer:', error);
      toast({
        title: 'Error',
        description: t('questionsPage.error.failedToPost'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    console.log('handleSubmitReply called with parentId:', parentId);
    
    if (!user) {
      toast({
        title: 'Error',
        description: t('questionsPage.error.mustBeLoggedIn'),
        variant: 'destructive',
      });
      return;
    }

    if (!replyContent.trim()) {
      toast({
        title: 'Error',
        description: t('questionsPage.error.pleaseEnterQuestion'),
        variant: 'destructive',
      });
      return;
    }

    // Ensure parentId is a clean string
    const cleanParentId = typeof parentId === 'string' ? parentId : null;
    console.log('Clean parentId:', cleanParentId);
    
    // Additional safety check - ensure all values are primitive
    const safeInsertData = {
      question_id: String(questionId),
      user_id: String(user.id),
      content: String(replyContent.trim()),
      is_anonymous: Boolean(replyAnonymous),
      parent_id: cleanParentId ? String(cleanParentId) : null,
    };
    
    console.log('Inserting reply data:', safeInsertData);

    setSubmittingReply(true);

    try {
      const { error } = await supabase
        .from('question_answers')
        .insert(safeInsertData);

      if (error) throw error;

      toast({
        title: 'Success',
        description: t('questionsPage.success.questionPosted'),
      });

      setReplyContent('');
      setReplyAnonymous(false);
      setReplyingTo(null);
      setReplyingToReply(null);
      fetchAnswers();
      onUpdate();
    } catch (error: any) {
      console.error('Error posting reply:', error);
      toast({
        title: 'Error',
        description: t('questionsPage.error.failedToPost'),
        variant: 'destructive',
      });
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleLike = async (answerId: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: t('questionsPage.error.mustBeLoggedIn'),
        variant: 'destructive',
      });
      return;
    }

    // Prevent double-clicking
    if (likedAnswers.has(answerId)) {
      return;
    }

    // Add to liked set for immediate visual feedback
    setLikedAnswers(prev => new Set(prev).add(answerId));

    try {
      // First get the current likes count
      const { data: currentAnswer, error: fetchError } = await supabase
        .from('question_answers')
        .select('likes_count')
        .eq('id', answerId)
        .single();

      if (fetchError) throw fetchError;

      const newLikesCount = (currentAnswer?.likes_count || 0) + 1;

      // Update local state immediately for instant feedback
      setLocalLikesCount(prev => ({
        ...prev,
        [answerId]: newLikesCount
      }));

      // Update with incremented count
      const { error } = await supabase
        .from('question_answers')
        .update({ 
          likes_count: newLikesCount
        })
        .eq('id', answerId);

      if (error) throw error;

      // Don't refetch - we've already updated local state
    } catch (error: any) {
      console.error('Error liking answer:', error);
      // Remove from liked set if there was an error
      setLikedAnswers(prev => {
        const newSet = new Set(prev);
        newSet.delete(answerId);
        return newSet;
      });
      // Revert local likes count
      setLocalLikesCount(prev => {
        const newCounts = { ...prev };
        delete newCounts[answerId];
        return newCounts;
      });
      toast({
        title: 'Error',
        description: t('questionsPage.error.failedToPost'),
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-lg border border-border/50 animate-pulse">
            <div className="flex items-start gap-2 sm:gap-3">
              {/* Avatar skeleton */}
              <div className="h-6 w-6 sm:h-10 sm:w-10 bg-gradient-to-br from-primary/30 to-primary/20 rounded-full flex-shrink-0 border border-primary/30"></div>
              
              {/* Content skeleton */}
              <div className="flex-1 space-y-3">
                {/* Header skeleton */}
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  <div className="h-4 bg-gradient-to-r from-primary/30 to-primary/20 rounded w-24 border border-primary/20"></div>
                  <div className="h-4 bg-gradient-to-r from-secondary/30 to-secondary/20 rounded w-16 border border-secondary/20"></div>
                  <div className="h-3 bg-gradient-to-r from-muted/40 to-muted/20 rounded w-20 border border-border/30"></div>
                </div>
                
                {/* Answer content skeleton */}
                <div className="space-y-2">
                  <div className="h-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded w-full border border-border/40"></div>
                  <div className="h-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded w-3/4 border border-border/40"></div>
                </div>
                
                {/* Action bar skeleton */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <div className="h-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded w-16 border border-border/40"></div>
                  <div className="h-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded w-12 border border-border/40"></div>
                  <div className="h-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded w-14 border border-border/40"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Existing Answers */}
      {answers.length > 0 ? (
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {t('questionsPage.answers.answers')} ({answers.length})
          </h4>
          
          {answers.map((answer) => (
            <AnswerItem
              key={answer.id}
              answer={answer}
              canSeeAnonymousNames={canSeeAnonymousNames}
              onReply={(replyId) => {
                if (replyId) {
                  setReplyingToReply(replyId);
                  setReplyingTo(answer.id);
                } else {
                  setReplyingTo(answer.id);
                  setReplyingToReply(null);
                }
              }}
              onLike={handleLike}
              isLiked={likedAnswers.has(answer.id)}
              likedAnswers={likedAnswers}
              localLikesCount={localLikesCount}
              replyingTo={replyingTo}
              replyingToReply={replyingToReply}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              replyAnonymous={replyAnonymous}
              setReplyAnonymous={setReplyAnonymous}
              onSubmitReply={(parentId) => handleSubmitReply(parentId)}
              submittingReply={submittingReply}
              onCancelReply={() => {
                setReplyingTo(null);
                setReplyingToReply(null);
              }}
              isFirst={false}
              isLast={false}
              expandedReplies={expandedReplies}
              repliesLoading={repliesLoading}
              repliesData={repliesData}
              repliesCount={repliesCount}
              handleToggleReplies={handleToggleReplies}
            />
          ))}
        </div>
      ) : (
        /* No Answers Yet - Show "Be the first to answer" message */
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl mb-4">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h4 className="text-lg font-semibold text-foreground mb-2">
            {t('questionsPage.answers.beFirstToAnswer')}
          </h4>
          <p className="text-muted-foreground">
            {t('questionsPage.answers.noAnswersYet')}
          </p>
        </div>
      )}

      {/* Answer Form */}
      {user && (
        <div className="border-t border-border/50 pt-6">
          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="answer-content" className="text-sm font-medium">
                {t('questionsPage.answers.addAnswer')}
              </Label>
              <Textarea
                id="answer-content"
                placeholder={t('questionsPage.answers.answerPlaceholder')}
                value={newAnswer.content}
                onChange={(e) => setNewAnswer({ ...newAnswer, content: e.target.value })}
                className="glass min-h-[100px] w-full max-w-full overflow-hidden"
                style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="answer-anonymous"
                  checked={newAnswer.is_anonymous}
                  onCheckedChange={(checked) =>
                    setNewAnswer({ ...newAnswer, is_anonymous: checked })
                  }
                />
                <Label htmlFor="answer-anonymous" className="text-sm">
                  {t('questionsPage.answers.postAnonymously')}
                </Label>
              </div>

              <Button
                type="submit"
                disabled={submitting || !newAnswer.content.trim()}
                className="btn-primary"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('questionsPage.answers.postingAnswer')}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {t('questionsPage.answers.postAnswer')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {!user && (
        <div className="text-center py-6 text-muted-foreground">
          {t('questionsPage.error.mustBeLoggedIn')}
        </div>
      )}
    </div>
  );
};
