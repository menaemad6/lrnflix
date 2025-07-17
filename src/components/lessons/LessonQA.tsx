
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send } from 'lucide-react';
import type { RootState } from '@/store/store';

interface Discussion {
  id: string;
  title: string;
  content: string;
  created_at: string;
  student_id: string;
  author_name: string;
  author_email: string;
  replies: Reply[];
}

interface Reply {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author_name: string;
  author_email: string;
}

interface LessonQAProps {
  lessonId: string;
  courseId: string;
}

export const LessonQA = ({ lessonId, courseId }: LessonQAProps) => {
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchDiscussions();
  }, [lessonId]);

  const fetchDiscussions = async () => {
    try {
      // Create a lesson-specific discussion by using lesson title as filter
      const { data: discussionsData, error: discussionsError } = await supabase
        .from('discussions')
        .select('*')
        .eq('course_id', courseId)
        .ilike('title', `%lesson%${lessonId}%`)
        .order('created_at', { ascending: false });

      if (discussionsError) throw discussionsError;

      if (!discussionsData || discussionsData.length === 0) {
        setDiscussions([]);
        setLoading(false);
        return;
      }

      // Get user profiles for discussion authors
      const userIds = [...new Set(discussionsData.map(d => d.student_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      // Get replies for each discussion
      const discussionIds = discussionsData.map(d => d.id);
      const { data: repliesData } = await supabase
        .from('discussion_replies')
        .select('*')
        .in('discussion_id', discussionIds)
        .order('created_at', { ascending: true });

      // Get user profiles for reply authors
      const replyUserIds = [...new Set(repliesData?.map(r => r.user_id) || [])];
      const { data: replyProfilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', replyUserIds);

      const replyProfilesMap = new Map();
      replyProfilesData?.forEach(profile => {
        replyProfilesMap.set(profile.id, profile);
      });

      // Combine data
      const enrichedDiscussions: Discussion[] = discussionsData.map(discussion => {
        const profile = profilesMap.get(discussion.student_id);
        const discussionReplies = (repliesData || [])
          .filter(reply => reply.discussion_id === discussion.id)
          .map(reply => {
            const replyProfile = replyProfilesMap.get(reply.user_id);
            return {
              ...reply,
              author_name: replyProfile?.full_name || 'Unknown User',
              author_email: replyProfile?.email || ''
            };
          });

        return {
          ...discussion,
          author_name: profile?.full_name || 'Unknown User',
          author_email: profile?.email || '',
          replies: discussionReplies
        };
      });

      setDiscussions(enrichedDiscussions);
    } catch (error: any) {
      console.error('Error fetching discussions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load Q&A',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const submitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newQuestion.trim()) return;

    try {
      const { error } = await supabase
        .from('discussions')
        .insert({
          title: `Lesson ${lessonId} Question`,
          content: newQuestion.trim(),
          course_id: courseId,
          student_id: user.id
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Question posted successfully!',
      });

      setNewQuestion('');
      fetchDiscussions();
    } catch (error: any) {
      console.error('Error posting question:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const submitReply = async (discussionId: string) => {
    if (!user || !replyContent[discussionId]?.trim()) return;

    try {
      const { error } = await supabase
        .from('discussion_replies')
        .insert({
          discussion_id: discussionId,
          content: replyContent[discussionId].trim(),
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Reply posted successfully!',
      });

      setReplyContent({ ...replyContent, [discussionId]: '' });
      fetchDiscussions();
    } catch (error: any) {
      console.error('Error posting reply:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div>Loading Q&A...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Ask a Question
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitQuestion} className="space-y-4">
            <Textarea
              placeholder="Ask a question about this lesson..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              rows={3}
            />
            <Button type="submit" disabled={!newQuestion.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Post Question
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {discussions.map((discussion) => (
          <Card key={discussion.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {discussion.author_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{discussion.author_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(discussion.created_at)}
                      </span>
                    </div>
                    <p className="text-sm">{discussion.content}</p>
                  </div>
                </div>

                {discussion.replies.length > 0 && (
                  <div className="ml-11 space-y-3 border-l-2 border-muted pl-4">
                    {discussion.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {reply.author_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{reply.author_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(reply.created_at)}
                            </span>
                          </div>
                          <p className="text-sm">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="ml-11">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyContent[discussion.id] || ''}
                      onChange={(e) => setReplyContent({ 
                        ...replyContent, 
                        [discussion.id]: e.target.value 
                      })}
                      rows={2}
                      className="flex-1"
                    />
                    <Button 
                      size="sm"
                      onClick={() => submitReply(discussion.id)}
                      disabled={!replyContent[discussion.id]?.trim()}
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {discussions.length === 0 && (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No questions yet. Be the first to ask!</p>
        </div>
      )}
    </div>
  );
};
