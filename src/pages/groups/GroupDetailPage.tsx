import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Settings, 
  MessageCircle, 
  Calendar, 
  Hash, 
  Copy, 
  Plus, 
  ArrowLeft,
  Crown,
  Link as LinkIcon,
  Shield,
  UserCheck,
  Send,
  Share2,
  UserMinus
} from 'lucide-react';
import type { RootState } from '@/store/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ObjectSharingModal } from '@/components/groups/ObjectSharingModal';
import { SharedObjectsList } from '@/components/groups/SharedObjectsList';

interface GroupDetails {
  id: string;
  name: string;
  description: string | null;
  group_code: string;
  created_at: string;
  created_by: string;
  max_members: number | null;
  is_public: boolean;
}

interface GroupMember {
  id: string;
  student_id: string;
  joined_at: string;
  profile: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author_name: string;
  author_email: string;
  isOptimistic?: boolean;
}

interface JoinGroupResponse {
  success: boolean;
  group_id?: string;
  group_name?: string;
  error?: string;
}

export const GroupDetailPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const joinCode = searchParams.get('code');
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Extract groupId from params - handle both 'groupId' and 'id' parameters
  const groupId = params.groupId || params.id;
  
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showObjectSharing, setShowObjectSharing] = useState(false);
  const [objectRefreshTrigger, setObjectRefreshTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('student');
  const [groupSettings, setGroupSettings] = useState({
    name: '',
    description: '',
    max_members: '',
    is_public: false
  });

  useEffect(() => {
    console.log('=== GroupDetailPage Mount ===');
    console.log('URL params:', params);
    console.log('Extracted GroupId:', groupId);
    console.log('JoinCode:', joinCode);
    console.log('Current user:', user);
    console.log('Window location:', window.location.pathname);
    
    if (groupId) {
      fetchGroupDetails();
      fetchMessages();
    } else {
      console.error('No groupId provided in URL parameters');
      setError('No group ID found in URL');
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (!groupId || !user?.id) {
      console.log('Skipping real-time setup - missing groupId or user');
      return;
    }

    console.log('Setting up real-time subscription for group:', groupId, 'user:', user.id);
    
    // Set up real-time subscription with better configuration
    const channel = supabase
      .channel(`group-${groupId}`, {
        config: {
          broadcast: { self: false },
          presence: { key: user.id }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`
        },
        async (payload) => {
          console.log('Real-time message received:', payload);
          
          try {
            const newMessage = payload.new;
            console.log('Processing new message:', newMessage);

            // Skip if it's our own message (to avoid duplicates with optimistic updates)
            if (newMessage.user_id === user.id) {
              console.log('Skipping own message to avoid duplicate');
              return;
            }

            // Get the author profile for the new message
            const { data: authorProfile, error: profileError } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', newMessage.user_id)
              .single();

            if (profileError) {
              console.error('Error fetching author profile:', profileError);
            }

            const enrichedMessage: Message = {
              id: newMessage.id,
              content: newMessage.content,
              created_at: newMessage.created_at,
              user_id: newMessage.user_id,
              author_name: authorProfile?.full_name || 'Unknown User',
              author_email: authorProfile?.email || ''
            };

            console.log('Adding real-time message:', enrichedMessage);

            setMessages(prevMessages => {
              // Check if message already exists to avoid duplicates
              const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
              
              if (!messageExists) {
                console.log('Adding new real-time message to UI');
                return [...prevMessages, enrichedMessage];
              }
              
              console.log('Message already exists, skipping');
              return prevMessages;
            });
          } catch (error) {
            console.error('Error processing real-time message:', error);
          }
        }
      )
      .subscribe((status, error) => {
        console.log('Real-time subscription status:', status);
        if (error) {
          console.error('Real-time subscription error:', error);
        }
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time updates');
        }
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [groupId, user?.id]);

  useEffect(() => {
    if (joinCode && groupId && !isMember && group && user) {
      console.log('Auto-joining group with code:', joinCode);
      handleJoinGroup();
    }
  }, [joinCode, groupId, isMember, group, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!groupId) return;

    try {
      console.log('Fetching messages for group:', groupId);
      const { data: messagesData, error: messagesError } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        return;
      }

      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        return;
      }

      const userIds = [...new Set(messagesData.map(m => m.user_id))];

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, {
          full_name: profile.full_name,
          email: profile.email
        });
      });

      const enrichedMessages: Message[] = messagesData.map(message => {
        const profile = profilesMap.get(message.user_id);
        return {
          ...message,
          author_name: profile?.full_name || 'Unknown User',
          author_email: profile?.email || ''
        };
      });

      console.log('Messages fetched successfully:', enrichedMessages.length);
      setMessages(enrichedMessages);
    } catch (error: any) {
      console.error('Error in fetchMessages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !groupId) return;

    const messageContent = newMessage.trim();
    const optimisticId = `optimistic-${Date.now()}-${Math.random()}`;
    
    console.log('Sending message:', { groupId, userId: user.id, content: messageContent });
    
    // Create optimistic message
    const optimisticMessage: Message = {
      id: optimisticId,
      content: messageContent,
      created_at: new Date().toISOString(),
      user_id: user.id,
      author_name: user.full_name || user.email,
      author_email: user.email,
      isOptimistic: true
    };

    // Clear input and add optimistic message immediately
    setNewMessage('');
    setMessages(prevMessages => [...prevMessages, optimisticMessage]);

    try {
      const { data, error } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          user_id: user.id,
          content: messageContent
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        // Remove optimistic message on error
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg.id !== optimisticId)
        );
        
        // Restore the input
        setNewMessage(messageContent);
        
        toast({
          title: 'Error',
          description: 'Failed to send message: ' + error.message,
          variant: 'destructive',
        });
        return;
      }

      console.log('Message sent successfully:', data);
      
      // Replace optimistic message with real message
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === optimisticId 
            ? {
                ...msg,
                id: data.id,
                created_at: data.created_at,
                isOptimistic: false
              }
            : msg
        )
      );
      
    } catch (error: any) {
      console.error('Error in sendMessage:', error);
      // Remove optimistic message on error
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== optimisticId)
      );
      
      // Restore the input
      setNewMessage(messageContent);
      
      toast({
        title: 'Error',
        description: 'Failed to send message: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('=== Starting fetchGroupDetails ===');
      console.log('Fetching group with ID:', groupId);

      // Get current user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      console.log('Auth check result:', { currentUser: currentUser?.id, userError });
      
      if (userError) {
        console.error('Auth error:', userError);
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!currentUser) {
        console.log('No authenticated user found');
        setError('You must be logged in to view this group');
        navigate('/auth');
        return;
      }

      console.log('Authenticated user ID:', currentUser.id);

      // Get user role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
      } else {
        setUserRole(profile.role || 'student');
      }

      // Fetch group details
      console.log('Fetching group data for ID:', groupId);
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      console.log('Group query result:', { groupData, groupError });

      if (groupError) {
        console.error('Group fetch error:', groupError);
        if (groupError.code === 'PGRST116') {
          setError('Group not found or you do not have access to view it');
        } else {
          setError(`Failed to load group: ${groupError.message}`);
        }
        setGroup(null);
        return;
      }

      if (!groupData) {
        console.log('No group data returned');
        setError('Group not found');
        setGroup(null);
        return;
      }

      console.log('Group data retrieved successfully:', groupData);
      setGroup(groupData);
      setIsOwner(groupData.created_by === currentUser.id);
      setGroupSettings({
        name: groupData.name,
        description: groupData.description || '',
        max_members: groupData.max_members?.toString() || '',
        is_public: groupData.is_public || false
      });

      // Fetch group members
      console.log('Fetching group members...');
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('id, student_id, joined_at')
        .eq('group_id', groupId);

      console.log('Members query result:', { membersData, membersError });

      if (membersError) {
        console.error('Members fetch error:', membersError);
        toast({
          title: 'Warning',
          description: 'Could not load group members',
          variant: 'destructive',
        });
        setMembers([]);
        setIsMember(false);
        return;
      }

      const studentIds = membersData?.map(m => m.student_id) || [];
      console.log('Student IDs to fetch profiles for:', studentIds);
      
      let profilesData: any[] = [];
      
      if (studentIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .in('id', studentIds);

        console.log('Profiles query result:', { profiles, profilesError });

        if (profilesError) {
          console.error('Profiles fetch error:', profilesError);
        } else {
          profilesData = profiles || [];
        }
      }

      const formattedMembers: GroupMember[] = membersData?.map(member => {
        const profile = profilesData.find(p => p.id === member.student_id);
        return {
          id: member.id,
          student_id: member.student_id,
          joined_at: member.joined_at,
          profile: profile ? {
            full_name: profile.full_name,
            email: profile.email,
            avatar_url: profile.avatar_url
          } : null
        };
      }) || [];

      console.log('Final formatted members:', formattedMembers);
      setMembers(formattedMembers);
      setIsMember(formattedMembers.some(m => m.student_id === currentUser.id));
      console.log('User is member:', formattedMembers.some(m => m.student_id === currentUser.id));

    } catch (error: any) {
      console.error('Error in fetchGroupDetails:', error);
      setError(error.message || 'An unexpected error occurred');
      toast({
        title: 'Error',
        description: error.message || 'Failed to load group details',
        variant: 'destructive',
      });
      setGroup(null);
    } finally {
      setLoading(false);
      console.log('=== fetchGroupDetails completed ===');
    }
  };

  const handleJoinGroup = async () => {
    if (!group) return;

    try {
      console.log('Joining group with code:', group.group_code);
      const { data, error } = await supabase.rpc('join_group_by_code', {
        p_group_code: group.group_code
      });

      if (error) {
        console.error('Join group error:', error);
        throw error;
      }

      const result = data as unknown as JoinGroupResponse;
      console.log('Join group result:', result);

      if (result.success) {
        toast({
          title: 'Success',
          description: `Joined group: ${group.name}`,
        });
        fetchGroupDetails();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to join group',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error joining group:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return;

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('student_id', currentUser.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Left the group',
      });

      navigate(userRole === 'teacher' ? '/teacher/groups' : '/student/groups');
    } catch (error: any) {
      console.error('Error leaving group:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateGroup = async () => {
    try {
      const { error } = await supabase
        .from('groups')
        .update({
          name: groupSettings.name,
          description: groupSettings.description || null,
          max_members: groupSettings.max_members ? parseInt(groupSettings.max_members) : null,
          is_public: groupSettings.is_public
        })
        .eq('id', groupId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Group settings updated!',
      });

      setShowSettings(false);
      fetchGroupDetails();
    } catch (error: any) {
      console.error('Error updating group:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const copyGroupLink = () => {
    if (!group) return;
    const link = `${window.location.origin}/groups/${group.id}?code=${group.group_code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Copied!',
      description: 'Group invitation link copied to clipboard',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleObjectShared = () => {
    setObjectRefreshTrigger(prev => prev + 1);
    toast({
      title: 'Success',
      description: 'Object shared with the group!',
    });
  };

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!groupId) return;
    if (!confirm(`Remove ${studentName} from the group?`)) return;
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('student_id', studentId);
      if (error) throw error;
      toast({ title: 'Removed', description: `${studentName} removed from group.` });
      fetchGroupDetails();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  // Determine what to show based on user role
  const showMembersSection = userRole === 'teacher' || isOwner;
  const showObjectSharingButton = userRole === 'teacher' || isOwner;
  const showGroupCodeAndShare = (group?.is_public || userRole === 'teacher' || isOwner) && isMember;
  const showSharedObjects = isMember; // Students can see shared objects

  console.log('Current render state:', { loading, error, group: !!group, members: members.length });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-20">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Error Loading Group</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate(userRole === 'teacher' ? '/teacher/groups' : '/student/groups')}>
              Back to Groups
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (!group) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-20">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Group not found</h2>
            <p className="text-muted-foreground mb-4">This group may have been deleted or you don't have access.</p>
            <Button onClick={() => navigate(userRole === 'teacher' ? '/teacher/groups' : '/student/groups')}>
              Back to Groups
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                {isOwner ? (
                  <Crown className="w-5 h-5 text-primary" />
                ) : (
                  <UserCheck className="w-5 h-5 text-primary" />
                )}
                <Badge variant={group.is_public ? 'default' : 'secondary'}>
                  {group.is_public ? 'Public Group' : 'Private Group'}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold">{group.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{members.length} members</span>
                </div>
                {showGroupCodeAndShare && (
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    <span>{group.group_code}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            {isMember && showObjectSharingButton && (
              <Button onClick={() => setShowObjectSharing(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Share Object
              </Button>
            )}
            {isOwner && (
              <Button variant="outline" onClick={() => setShowSettings(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            )}
          </div>
        </div>

        <div className={`grid gap-6 ${showMembersSection || showSharedObjects ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {/* Group Info & Chat - Takes full width if no sidebar, or 2 columns if sidebar */}
          <div className={`space-y-6 ${showMembersSection || showSharedObjects ? 'lg:col-span-2' : ''}`}>
            {/* Group Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="w-5 h-5" />
                  Group Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground">{group.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {showGroupCodeAndShare && (
                    <div>
                      <h4 className="font-semibold mb-2">Group Code</h4>
                      <Badge 
                        className="cursor-pointer"
                        onClick={() => navigator.clipboard.writeText(group.group_code)}
                      >
                        <Hash className="w-4 h-4 mr-1" />
                        {group.group_code}
                        <Copy className="w-4 h-4 ml-1" />
                      </Badge>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold mb-2">Members</h4>
                    <div className="text-2xl font-bold text-primary">
                      {members.length}{group.max_members ? `/${group.max_members}` : ''}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Created</h4>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(group.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  {showGroupCodeAndShare && (
                    <Button onClick={copyGroupLink}>
                      <LinkIcon className="w-4 w-4 mr-2" />
                      Share Link
                    </Button>
                  )}
                  {!isMember && (
                    <Button onClick={handleJoinGroup}>
                      <Plus className="w-4 h-4 mr-2" />
                      Join Group
                    </Button>
                  )}
                  {isMember && !isOwner && (
                    <Button variant="destructive" onClick={handleLeaveGroup}>
                      Leave Group
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chat Section - Fixed Layout with Proper Scrolling */}
            {isMember && (
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="pb-3 flex-shrink-0">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Group Chat
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                  {/* Messages Area - Proper ScrollArea implementation */}
                  <ScrollArea className="flex-1 px-4">
                    <div className="space-y-4 pr-2 py-2">
                      {messages.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Start the conversation!</h3>
                          <p className="text-muted-foreground">Be the first to send a message in this group</p>
                        </div>
                      ) : (
                        messages.map((message, index) => {
                          const showDate = index === 0 || 
                            formatDate(message.created_at) !== formatDate(messages[index - 1].created_at);
                          const isCurrentUser = message.user_id === user?.id;

                          return (
                            <div key={message.id}>
                              {showDate && (
                                <div className="text-center my-4">
                                  <div className="inline-block bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                                    {formatDate(message.created_at)}
                                  </div>
                                </div>
                              )}
                              
                              <div className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                {!isCurrentUser && (
                                  <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarFallback>
                                      {message.author_name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                
                                <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-1' : ''}`}>
                                  {!isCurrentUser && (
                                    <div className="text-xs text-muted-foreground mb-1">
                                      {message.author_name || 'Unknown User'}
                                    </div>
                                  )}
                                  <div className={`rounded-lg px-3 py-2 break-words ${
                                    isCurrentUser 
                                      ? `bg-primary text-primary-foreground ${message.isOptimistic ? 'opacity-70' : ''}` 
                                      : 'bg-muted'
                                  }`}>
                                    <p className="text-sm">{message.content}</p>
                                    <div className={`text-xs mt-1 ${
                                      isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                    }`}>
                                      {formatTime(message.created_at)}
                                      {message.isOptimistic && (
                                        <span className="ml-1">⏳</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {isCurrentUser && (
                                  <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarFallback>
                                      {user?.email?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input - Fixed at bottom */}
                  <div className="border-t p-4 flex-shrink-0">
                    <form onSubmit={sendMessage} className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                        maxLength={500}
                      />
                      <Button type="submit" disabled={!newMessage.trim()} size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Show for teachers/owners OR students who can see shared objects */}
          {(showMembersSection || showSharedObjects) && (
            <div className="lg:col-span-1 space-y-6">
              {/* Members List - Only for teachers/owners */}
              {showMembersSection && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Members ({members.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3 pr-2">
                        {members.map((member) => (
                          <div key={member.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarFallback>
                                {member.profile?.full_name?.charAt(0) || member.profile?.email?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold truncate">
                                  {member.profile?.full_name || member.profile?.email || 'Unknown User'}
                                </p>
                                {member.student_id === group.created_by && (
                                  <Crown className="w-4 h-4 text-primary flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Joined {new Date(member.joined_at).toLocaleDateString()}
                              </p>
                            </div>
                            {userRole === 'teacher' && member.student_id !== group.created_by && (
                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => handleRemoveStudent(member.student_id, member.profile?.full_name || member.profile?.email || 'User')}
                                title="Remove from group"
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        
                        {members.length === 0 && (
                          <div className="text-center py-8">
                            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No members yet</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Shared Objects - Show for all members */}
              {showSharedObjects && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Share2 className="w-5 h-5" />
                      Shared Objects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SharedObjectsList groupId={groupId!} refreshTrigger={objectRefreshTrigger} />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Object Sharing Modal - Only for teachers/owners */}
        {showObjectSharingButton && (
          <ObjectSharingModal
            isOpen={showObjectSharing}
            onClose={() => setShowObjectSharing(false)}
            groupId={groupId!}
            onObjectShared={handleObjectShared}
          />
        )}

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Group Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Group Name</label>
                <Input
                  value={groupSettings.name}
                  onChange={(e) => setGroupSettings({ ...groupSettings, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={groupSettings.description}
                  onChange={(e) => setGroupSettings({ ...groupSettings, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Members</label>
                <Input
                  type="number"
                  value={groupSettings.max_members}
                  onChange={(e) => setGroupSettings({ ...groupSettings, max_members: e.target.value })}
                  placeholder="No limit"
                  min="1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_public_setting"
                  checked={groupSettings.is_public}
                  onChange={(e) => setGroupSettings({ ...groupSettings, is_public: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_public_setting" className="text-sm font-medium">Make group public</label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handleUpdateGroup}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setShowSettings(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};
