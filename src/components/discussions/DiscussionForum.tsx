
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Plus, Send } from 'lucide-react';

interface Discussion {
  id: string;
  title: string;
  content: string;
  created_at: string;
  student_id: string;
  author_name: string;
  author_email: string;
  reply_count: number;
}

interface Reply {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author_name: string;
  author_email: string;
}

interface DiscussionForumProps {
  courseId: string;
}

export const DiscussionForum = ({ courseId }: DiscussionForumProps) => {
  const { toast } = useToast();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<string | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [newReply, setNewReply] = useState('');

  useEffect(() => {
    fetchDiscussions();
  }, [courseId]);

  const fetchDiscussions = async () => {
    try {
      // First, get discussions
      const { data: discussionsData, error: discussionsError } = await supabase
        .from('discussions')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (discussionsError) throw discussionsError;

      if (!discussionsData || discussionsData.length === 0) {
        setDiscussions([]);
        setLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(discussionsData.map(d => d.student_id))];

      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Create profile lookup
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, {
          full_name: profile.full_name,
          email: profile.email
        });
      });

      // Get reply counts for each discussion
      const discussionIds = discussionsData.map(d => d.id);
      const { data: repliesData, error: repliesError } = await supabase
        .from('discussion_replies')
        .select('discussion_id')
        .in('discussion_id', discussionIds);

      if (repliesError) {
        console.error('Error fetching reply counts:', repliesError);
      }

      const replyCounts = new Map();
      repliesData?.forEach(reply => {
        const count = replyCounts.get(reply.discussion_id) || 0;
        replyCounts.set(reply.discussion_id, count + 1);
      });

      // Combine data
      const enrichedDiscussions: Discussion[] = discussionsData.map(discussion => {
        const profile = profilesMap.get(discussion.student_id);
        return {
          ...discussion,
          author_name: profile?.full_name || 'Unknown User',
          author_email: profile?.email || '',
          reply_count: replyCounts.get(discussion.id) || 0
        };
      });

      setDiscussions(enrichedDiscussions);
    } catch (error: any) {
      console.error('Error fetching discussions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load discussions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (discussionId: string) => {
    try {
      // Get replies
      const { data: repliesData, error: repliesError } = await supabase
        .from('discussion_replies')
        .select('*')
        .eq('discussion_id', discussionId)
        .order('created_at', { ascending: true });

      if (repliesError) throw repliesError;

      if (!repliesData || repliesData.length === 0) {
        setReplies([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(repliesData.map(r => r.user_id))];

      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching reply profiles:', profilesError);
      }

      // Create profile lookup
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, {
          full_name: profile.full_name,
          email: profile.email
        });
      });

      // Combine data
      const enrichedReplies: Reply[] = repliesData.map(reply => {
        const profile = profilesMap.get(reply.user_id);
        return {
          ...reply,
          author_name: profile?.full_name || 'Unknown User',
          author_email: profile?.email || ''
        };
      });

      setReplies(enrichedReplies);
    } catch (error: any) {
      console.error('Error fetching replies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load replies',
        variant: 'destructive',
      });
    }
  };

  const createDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('discussions')
        .insert({
          course_id: courseId,
          student_id: user.id,
          title: newDiscussion.title,
          content: newDiscussion.content
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Discussion created successfully!',
      });

      setNewDiscussion({ title: '', content: '' });
      setShowNewDiscussion(false);
      fetchDiscussions();
    } catch (error: any) {
      console.error('Error creating discussion:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const createReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDiscussion || !newReply.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('discussion_replies')
        .insert({
          discussion_id: selectedDiscussion,
          user_id: user.id,
          content: newReply.trim()
        });

      if (error) throw error;

      setNewReply('');
      fetchReplies(selectedDiscussion);
      fetchDiscussions(); // Refresh to update reply counts
    } catch (error: any) {
      console.error('Error creating reply:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Loading discussions...</div>;
  }

  if (selectedDiscussion) {
    const discussion = discussions.find(d => d.id === selectedDiscussion);
    if (!discussion) {
      setSelectedDiscussion(null);
      return null;
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{discussion.title}</CardTitle>
            <Button variant="outline" onClick={() => setSelectedDiscussion(null)}>
              Back to Discussions
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-b pb-4">
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarFallback>
                  {discussion.author_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{discussion.author_name}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(discussion.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{discussion.content}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Replies ({replies.length})</h4>
            {replies.map((reply) => (
              <div key={reply.id} className="flex items-start gap-3 pl-4 border-l-2 border-gray-200">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {reply.author_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{reply.author_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(reply.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={createReply} className="space-y-3">
            <Textarea
              placeholder="Write a reply..."
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              required
            />
            <Button type="submit" disabled={!newReply.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Post Reply
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Course Discussions</CardTitle>
          <Button onClick={() => setShowNewDiscussion(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Discussion
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showNewDiscussion && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Discussion</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createDiscussion} className="space-y-4">
                <Input
                  placeholder="Discussion title"
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="What would you like to discuss?"
                  value={newDiscussion.content}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit">Create Discussion</Button>
                  <Button type="button" variant="outline" onClick={() => setShowNewDiscussion(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {discussions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No discussions yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <Card 
                key={discussion.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedDiscussion(discussion.id);
                  fetchReplies(discussion.id);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {discussion.author_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{discussion.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {discussion.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>By {discussion.author_name}</span>
                        <span>{new Date(discussion.created_at).toLocaleDateString()}</span>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{discussion.reply_count} replies</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
