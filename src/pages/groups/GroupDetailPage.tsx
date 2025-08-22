import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
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
import { useTenantItemValidation } from '@/hooks/useTenantItemValidation';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { IMAGE_UPLOAD_BUCKETS } from '@/data/constants';
import type { UploadedImage } from '@/hooks/useImageUpload';
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
  UserMinus,
  Sparkles
} from 'lucide-react';
import type { RootState } from '@/store/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ObjectSharingModal } from '@/components/groups/ObjectSharingModal';
import { SharedObjectsList } from '@/components/groups/SharedObjectsList';
import { Switch } from '@/components/ui/switch';
import { GroupDetailSkeleton } from '@/components/groups/skeletons';
import { useTranslation } from 'react-i18next';

interface GroupDetails {
  id: string;
  name: string;
  description: string | null;
  group_code: string;
  created_at: string;
  created_by: string;
  max_members: number | null;
  is_public: boolean;
  is_code_visible: boolean;
  is_members_visible: boolean;
  thumbnail_url?: string;
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
  const { t } = useTranslation('dashboard');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Tenant item validation hook
  const { validateWithCreatorId } = useTenantItemValidation({
    redirectTo: '/student/groups',
  });
  
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
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [objectRefreshTrigger, setObjectRefreshTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('student');
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [groupSettings, setGroupSettings] = useState({
    name: '',
    description: '',
    max_members: '',
    is_public: false,
    is_code_visible: true,
    is_members_visible: true
  });
  const [groupCodeInput, setGroupCodeInput] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

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
    } else if (joinCode) {
      // If no groupId but we have a join code, fetch group by code first
      fetchGroupByCode();
    } else {
      console.error('No groupId or join code provided in URL parameters');
      setError('No group ID or join code found in URL');
      setLoading(false);
    }
  }, [groupId, joinCode]);

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

  // Refresh messages when user becomes a member
  useEffect(() => {
    if (isMember && groupId) {
      console.log('User became a member, refreshing messages');
      fetchMessages();
    }
  }, [isMember, groupId]);

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
          title: t('groupDetailPage.error'),
          description: t('groupDetailPage.failedToSendMessage', { errorMessage: error.message }),
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
        title: t('groupDetailPage.error'),
        description: t('groupDetailPage.failedToSendMessage', { errorMessage: error.message }),
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
      
      // Validate group access before setting it
      validateWithCreatorId(groupData.created_by);
      
      setGroup(groupData);
      setIsOwner(groupData.created_by === currentUser.id);
      setGroupSettings({
        name: groupData.name,
        description: groupData.description || '',
        max_members: groupData.max_members?.toString() || '',
        is_public: groupData.is_public || false,
        is_code_visible: groupData.is_code_visible !== false,
        is_members_visible: groupData.is_members_visible !== false
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
          title: t('groupDetailPage.warning'),
          description: t('groupDetailPage.couldNotLoadGroupMembers'),
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
        title: t('groupDetailPage.error'),
        description: error.message || t('groupDetailPage.failedToLoadGroupDetails'),
        variant: 'destructive',
      });
      setGroup(null);
    } finally {
      setLoading(false);
      console.log('=== fetchGroupDetails completed ===');
    }
  };

  const fetchGroupByCode = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('=== Starting fetchGroupByCode ===');
      console.log('Fetching group with code:', joinCode);

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

      // Fetch group details by code
      console.log('Fetching group data for code:', joinCode);
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('group_code', joinCode)
        .single();

      console.log('Group by code query result:', { groupData, groupError });

      if (groupError) {
        console.error('Group fetch error:', groupError);
        setError(`Failed to load group: ${groupError.message}`);
        setGroup(null);
        return;
      }

      if (!groupData) {
        console.log('No group data returned for code:', joinCode);
        setError('Invalid group code');
        setGroup(null);
        return;
      }

      console.log('Group data retrieved successfully:', groupData);
      
      // Validate group access before setting it
      validateWithCreatorId(groupData.created_by);
      
      setGroup(groupData);
      setIsOwner(groupData.created_by === currentUser.id);
      setGroupSettings({
        name: groupData.name,
        description: groupData.description || '',
        max_members: groupData.max_members?.toString() || '',
        is_public: groupData.is_public || false,
        is_code_visible: groupData.is_code_visible !== false,
        is_members_visible: groupData.is_members_visible !== false
      });

      // Set the groupId for future operations
      const url = new URL(window.location.href);
      url.pathname = `/groups/${groupData.id}`;
      url.searchParams.set('code', joinCode);
      window.history.replaceState({}, '', url.toString());

      // Fetch group members
      console.log('Fetching group members...');
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('id, student_id, joined_at')
        .eq('group_id', groupData.id);

      console.log('Members query result:', { membersData, membersError });

      if (membersError) {
        console.error('Members fetch error:', membersError);
        toast({
          title: t('groupDetailPage.warning'),
          description: t('groupDetailPage.couldNotLoadGroupMembers'),
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

      // Fetch messages after setting up the group
      await fetchMessages();

    } catch (error: any) {
      console.error('Error in fetchGroupByCode:', error);
      setError(error.message || 'An unexpected error occurred');
      toast({
        title: t('groupDetailPage.error'),
        description: error.message || t('groupDetailPage.failedToLoadGroupDetails'),
        variant: 'destructive',
      });
      setGroup(null);
    } finally {
      setLoading(false);
      console.log('=== fetchGroupByCode completed ===');
    }
  };

  const handleJoinWithCode = async () => {
    if (!groupCodeInput.trim()) {
      toast({
        title: t('groupDetailPage.error'),
        description: t('groupDetailPage.pleaseEnterGroupCode'),
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Joining group with entered code:', groupCodeInput.trim());
      
      // Check if the entered code matches the group's code
      if (groupCodeInput.trim().toUpperCase() !== group?.group_code) {
        toast({
          title: t('groupDetailPage.invalidCode'),
          description: t('groupDetailPage.enteredGroupCodeIsIncorrect'),
          variant: 'destructive',
        });
        return;
      }

      // Check if user is already a member
      const { data: existingMember, error: checkError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('student_id', user?.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking membership:', checkError);
        throw checkError;
      }

      if (existingMember) {
        toast({
          title: t('groupDetailPage.alreadyMember'),
          description: t('groupDetailPage.alreadyMemberOfGroup'),
        });
        return;
      }

      // Check if group is full
      if (group.max_members) {
        const { count: currentMembers, error: countError } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id);

        if (countError) {
          console.error('Error counting members:', countError);
        } else if (currentMembers && currentMembers >= group.max_members) {
          toast({
            title: t('groupDetailPage.groupFull'),
            description: t('groupDetailPage.groupReachedMaxCapacity'),
            variant: 'destructive',
          });
          return;
        }
      }

      // Add user to group
      const { error: joinError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          student_id: user?.id
        });

      if (joinError) {
        console.error('Join group error:', joinError);
        throw joinError;
      }

      toast({
        title: t('groupDetailPage.success'),
        description: t('groupDetailPage.joinedGroup', { groupName: group.name }),
      });

      // Hide the code input and refresh data
      setShowCodeInput(false);
      setGroupCodeInput('');
      
      // Refresh group details and fetch messages after joining
      await fetchGroupDetails();
      await fetchMessages();

    } catch (error: any) {
      console.error('Error joining group with code:', error);
      toast({
        title: t('groupDetailPage.error'),
        description: error.message || t('groupDetailPage.failedToJoinGroup'),
        variant: 'destructive',
      });
    }
  };

  const handleJoinGroup = async () => {
    if (!group) return;

    try {
      console.log('Joining group with code:', group.group_code);
      
      // Check if user is already a member
      const { data: existingMember, error: checkError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('student_id', user?.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking membership:', checkError);
        throw checkError;
      }

      if (existingMember) {
        toast({
          title: t('groupDetailPage.alreadyMember'),
          description: t('groupDetailPage.alreadyMemberOfGroup'),
        });
        return;
      }

      // Check if group is full
      if (group.max_members) {
        const { count: currentMembers, error: countError } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id);

        if (countError) {
          console.error('Error counting members:', countError);
        } else if (currentMembers && currentMembers >= group.max_members) {
          toast({
            title: t('groupDetailPage.groupFull'),
            description: t('groupDetailPage.groupReachedMaxCapacity'),
            variant: 'destructive',
          });
          return;
        }
      }

      // Add user to group
      const { error: joinError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          student_id: user?.id
        });

      if (joinError) {
        console.error('Join group error:', joinError);
        throw joinError;
      }

      toast({
        title: t('groupDetailPage.success'),
        description: t('groupDetailPage.joinedGroup', { groupName: group.name }),
      });

      // Remove ?code=... from the URL if present
      if (joinCode) {
        const url = new URL(window.location.href);
        url.searchParams.delete('code');
        window.history.replaceState({}, '', url.pathname + url.search);
      }

      // Refresh group details and fetch messages after joining
      await fetchGroupDetails();
      await fetchMessages();

    } catch (error: any) {
      console.error('Error joining group:', error);
      toast({
        title: t('groupDetailPage.error'),
        description: error.message || t('groupDetailPage.failedToJoinGroup'),
        variant: 'destructive',
      });
    }
  };

  const handleLeaveGroup = async () => {
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
        title: t('groupDetailPage.success'),
        description: t('groupDetailPage.leftGroup'),
      });

      setShowLeaveConfirmation(false);
      navigate(userRole === 'teacher' ? '/teacher/groups' : '/student/groups');
    } catch (error: any) {
      console.error('Error leaving group:', error);
      toast({
        title: t('groupDetailPage.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleImageUploaded = (image: UploadedImage) => {
    setUploadedImage(image);
    toast({
      title: t('groupDetailPage.success'),
      description: t('groupDetailPage.groupThumbnailUploadedSuccessfully'),
    });
  };

  const handleImageDeleted = (path: string) => {
    setUploadedImage(null);
    toast({
      title: t('groupDetailPage.success'),
      description: t('groupDetailPage.groupThumbnailRemoved'),
    });
  };

  const handleUpdateGroup = async () => {
    try {
      const { error } = await supabase
        .from('groups')
        .update({
          name: groupSettings.name,
          description: groupSettings.description,
          max_members: groupSettings.max_members ? parseInt(groupSettings.max_members) : null,
          is_public: groupSettings.is_public,
          is_code_visible: groupSettings.is_code_visible,
          is_members_visible: groupSettings.is_members_visible,
          thumbnail_url: uploadedImage?.url || group?.thumbnail_url || null
        })
        .eq('id', groupId);

      if (error) throw error;

      toast({
        title: t('groupDetailPage.success'),
        description: t('groupDetailPage.groupSettingsUpdatedSuccessfully'),
      });

      // Refresh group data
      fetchGroupDetails();
      setUploadedImage(null);
      setShowSettings(false);
    } catch (error: any) {
      console.error('Error updating group:', error);
      toast({
        title: t('groupDetailPage.error'),
        description: t('groupDetailPage.failedToUpdateGroupSettings'),
        variant: 'destructive',
      });
    }
  };

  const copyGroupLink = () => {
    if (!group) return;
    const link = `${window.location.origin}/groups/${group.id}?code=${group.group_code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: t('groupDetailPage.copied'),
      description: t('groupDetailPage.groupInvitationLinkCopiedToClipboard'),
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
      title: t('groupDetailPage.success'),
      description: t('groupDetailPage.objectSharedWithGroup'),
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
      toast({ title: t('groupDetailPage.removed'), description: `${studentName} removed from group.` });
      fetchGroupDetails();
    } catch (error: any) {
      toast({ title: t('groupDetailPage.error'), description: error.message, variant: 'destructive' });
    }
  };

  // Determine what to show based on user role
  const showMembersSection = (userRole === 'teacher' || isOwner) || (group?.is_members_visible !== false);
  const showObjectSharingButton = userRole === 'teacher' || isOwner;
  const showGroupCodeAndShare = (group?.is_public || userRole === 'teacher' || isOwner) && isMember;
  const showSharedObjects = isMember; // Students can see shared objects

  console.log('Current render state:', { loading, error, group: !!group, members: members.length });

  if (loading) {
    return (
      <DashboardLayout>
        <GroupDetailSkeleton />
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
            <h2 className="text-xl font-semibold mb-2">{t('groupDetailPage.errorLoadingGroup')}</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate(userRole === 'teacher' ? '/teacher/groups' : '/student/groups')}>
              {t('groupDetailPage.backToGroups')}
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
            <h2 className="text-xl font-semibold mb-2">{t('groupDetailPage.groupNotFound')}</h2>
            <p className="text-muted-foreground mb-4">{t('groupDetailPage.groupMayHaveBeenDeletedOrYouDoNotHaveAccess')}</p>
            <Button onClick={() => navigate(userRole === 'teacher' ? '/teacher/groups' : '/student/groups')}>
              {t('groupDetailPage.backToGroups')}
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
        <div className="space-y-4 sm:space-y-0 sm:flex sm:items-start sm:justify-between">
          <div className="flex items-start gap-3 sm:gap-4">
            <Button variant="outline" onClick={() => navigate(-1)} className="flex-shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-3 sm:gap-4 mb-3">
                {/* Group Thumbnail */}
                {group.thumbnail_url && (
                  <div className="flex-shrink-0">
                    <img 
                      src={group.thumbnail_url} 
                      alt={group.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-border/20 shadow-lg"
                    />
                  </div>
                )}
                
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    {isOwner ? (
                      <Crown className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <UserCheck className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                    <Badge variant={group.is_public ? 'default' : undefined} className={`flex-shrink-0 ${group.is_public ? '' : 'bg-yellow-400 text-yellow-900 font-bold rounded-full shadow px-3 py-1 border border-yellow-300 hover:bg-yellow-300 hover:border-yellow-500 transition-colors'}`}>
                      {group.is_public ? 'Public Group' : 'Private Group'}
                    </Badge>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold break-words">{group.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-muted-foreground text-sm sm:text-base">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span>{members.length} {t('groupDetailPage.members')}</span>
                    </div>
                    {showGroupCodeAndShare && (userRole === 'teacher' || isOwner || group.is_code_visible) && (
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 flex-shrink-0" />
                        <span className="break-all">{group.group_code}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 sm:gap-3 sm:flex-shrink-0">
            {isMember && showObjectSharingButton && (
              <Button onClick={() => setShowObjectSharing(true)} size="sm" className="text-xs sm:text-sm">
                <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t('groupDetailPage.shareObject')}</span>
                <span className="sm:hidden">{t('groupDetailPage.share')}</span>
              </Button>
            )}
            {isOwner && (
              <Button variant="outline" onClick={() => setShowSettings(true)} size="sm" className="text-xs sm:text-sm">
                <Settings className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t('groupDetailPage.settings')}</span>
                <span className="sm:hidden">{t('groupDetailPage.settings')}</span>
              </Button>
            )}
          </div>
        </div>

        <div className={`grid gap-6 ${showMembersSection || showSharedObjects ? 'grid-cols-1 xl:grid-cols-3' : 'grid-cols-1'}`}>
          {/* Group Info & Chat - Takes full width if no sidebar, or 2 columns if sidebar */}
          <div className={`space-y-6 ${showMembersSection || showSharedObjects ? 'xl:col-span-2' : ''}`}>
            {/* Group Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="w-5 h-5" />
                  {t('groupDetailPage.groupInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.description && (
                  <div>
                    <h4 className="font-semibold mb-2">{t('groupDetailPage.description')}</h4>
                    <p className="text-muted-foreground">{group.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {showGroupCodeAndShare && (userRole === 'teacher' || isOwner || group.is_code_visible) && (
                    <div>
                      <h4 className="font-semibold mb-2">{t('groupDetailPage.groupCode')}</h4>
                      <Badge 
                        className="cursor-pointer break-all"
                        onClick={() => navigator.clipboard.writeText(group.group_code)}
                      >
                        <Hash className="w-4 h-4 mr-1" />
                        {group.group_code}
                        <Copy className="w-4 h-4 ml-1" />
                      </Badge>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold mb-2">{t('groupDetailPage.members')}</h4>
                    <div className="text-2xl font-bold text-primary">
                      {members.length}{group.max_members ? `/${group.max_members}` : ''}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">{t('groupDetailPage.created')}</h4>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(group.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-3 pt-4">
                  {showGroupCodeAndShare && (userRole === 'teacher' || isOwner || group.is_code_visible) && (
                    <Button onClick={copyGroupLink} size="sm" className="text-xs sm:text-sm">
                      <LinkIcon className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">{t('groupDetailPage.shareLink')}</span>
                      <span className="sm:hidden">{t('groupDetailPage.share')}</span>
                    </Button>
                  )}
                  
                  {/* Show join options based on membership and group privacy */}
                  {!isMember && (
                    <>
                      {group.is_public ? (
                        // Public group - direct join
                        <Button onClick={handleJoinGroup} size="sm" className="text-xs sm:text-sm">
                          <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">{t('groupDetailPage.joinGroup')}</span>
                          <span className="sm:hidden">{t('groupDetailPage.join')}</span>
                        </Button>
                      ) : (
                        // Private group - show code input
                        <>
                          {!showCodeInput ? (
                            <Button onClick={() => setShowCodeInput(true)} size="sm" className="text-xs sm:text-sm">
                              <Hash className="w-4 h-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">{t('groupDetailPage.enterCodeToJoin')}</span>
                              <span className="sm:hidden">{t('groupDetailPage.enterCode')}</span>
                            </Button>
                          ) : (
                            <div className="flex gap-2 items-center">
                              <Input
                                placeholder={t('groupDetailPage.enterGroupCode')}
                                value={groupCodeInput}
                                onChange={(e) => setGroupCodeInput(e.target.value.toUpperCase())}
                                className="w-32 text-center font-mono text-sm"
                                maxLength={8}
                              />
                              <Button onClick={handleJoinWithCode} size="sm" className="text-xs sm:text-sm">
                                <UserCheck className="w-4 h-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">{t('groupDetailPage.join')}</span>
                                <span className="sm:hidden">{t('groupDetailPage.join')}</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setShowCodeInput(false);
                                  setGroupCodeInput('');
                                }} 
                                size="sm" 
                                className="text-xs sm:text-sm"
                              >
                                {t('groupDetailPage.cancel')}
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                  
                  {isMember && !isOwner && (
                    <Button variant="destructive" onClick={() => setShowLeaveConfirmation(true)} size="sm" className="text-xs sm:text-sm">
                      <span className="hidden sm:inline">{t('groupDetailPage.leaveGroup')}</span>
                      <span className="sm:hidden">{t('groupDetailPage.leave')}</span>
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
                    {t('groupDetailPage.groupChat')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                  {/* Messages Area - Proper ScrollArea implementation */}
                  <ScrollArea className="flex-1 px-4">
                    <div className="space-y-4 pr-2 py-2">
                      {messages.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">{t('groupDetailPage.startConversation')}</h3>
                          <p className="text-muted-foreground">{t('groupDetailPage.firstMessageInGroup')}</p>
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
                                      {message.author_name || t('groupDetailPage.unknownUser')}
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
                                     <AvatarFallback className="bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 text-white font-semibold">
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
                        placeholder={t('groupDetailPage.typeMessage')}
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
            <div className="xl:col-span-1 space-y-6">
              {/* Members List - Only for teachers/owners */}
              {showMembersSection && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {t('groupDetailPage.members')} ({members.length})
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
                                  <Link to={`/teacher/students/${member.student_id}`}>
                                    {member.profile?.full_name || member.profile?.email || 'Unknown User'}
                                  </Link>
                                </p>
                                {member.student_id === group.created_by && (
                                  <Crown className="w-4 h-4 text-primary flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {t('groupDetailPage.joined', { date: new Date(member.joined_at).toLocaleDateString() })}
                              </p>
                            </div>
                            {userRole === 'teacher' && member.student_id !== group.created_by && (
                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => handleRemoveStudent(member.student_id, member.profile?.full_name || member.profile?.email || 'User')}
                                title={t('groupDetailPage.removeFromGroup')}
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        
                        {members.length === 0 && (
                          <div className="text-center py-8">
                            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">{t('groupDetailPage.noMembersYet')}</p>
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
                      {t('groupDetailPage.sharedObjects')}
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
           <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden p-0">
             <DialogHeader className="px-6 py-4 border-b">
               <DialogTitle className="text-xl font-semibold">{t('groupDetailPage.groupSettings')}</DialogTitle>
             </DialogHeader>
             <div className="overflow-y-auto max-h-[calc(95vh-140px)] px-6 py-4">
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                 {/* Left Column - Basic Settings */}
                 <div className="space-y-6">
                   <div>
                     <label className="block text-sm font-medium mb-2">{t('groupDetailPage.groupName')}</label>
                     <Input
                       value={groupSettings.name}
                       onChange={(e) => setGroupSettings({ ...groupSettings, name: e.target.value })}
                       className="w-full"
                     />
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium mb-2">{t('groupDetailPage.description')}</label>
                     <Textarea
                       value={groupSettings.description}
                       onChange={(e) => setGroupSettings({ ...groupSettings, description: e.target.value })}
                       rows={4}
                       className="w-full"
                     />
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium mb-2">{t('groupDetailPage.maxMembers')}</label>
                     <Input
                       type="number"
                       value={groupSettings.max_members}
                       onChange={(e) => setGroupSettings({ ...groupSettings, max_members: e.target.value })}
                       placeholder={t('groupDetailPage.noLimit')}
                       min="1"
                       className="w-full"
                     />
                   </div>

                   {/* Privacy Settings */}
                   <div className="space-y-4">
                     <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('groupDetailPage.privacySettings')}</h3>
                     
                     <div className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:bg-card/70 transition-colors">
                       <div className="space-y-1">
                         <label htmlFor="is_public_setting" className="text-sm font-medium">{t('groupDetailPage.makeGroupPublic')}</label>
                         <p className="text-xs text-muted-foreground">{t('groupDetailPage.anyoneCanSeeAndJoinGroup')}</p>
                       </div>
                       <Switch
                         id="is_public_setting"
                         checked={groupSettings.is_public}
                         onCheckedChange={(checked) => setGroupSettings({ ...groupSettings, is_public: checked })}
                       />
                     </div>
                     
                     <div className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:bg-card/70 transition-colors">
                       <div className="space-y-1">
                         <label htmlFor="is_code_visible_setting" className="text-sm font-medium">{t('groupDetailPage.showGroupCode')}</label>
                         <p className="text-xs text-muted-foreground">{t('groupDetailPage.studentsCanSeeGroupInvitationCode')}</p>
                       </div>
                       <Switch
                         id="is_code_visible_setting"
                         checked={groupSettings.is_code_visible}
                         onCheckedChange={(checked) => setGroupSettings({ ...groupSettings, is_code_visible: checked })}
                       />
                     </div>
                     
                     <div className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:bg-card/70 transition-colors">
                       <div className="space-y-1">
                         <label htmlFor="is_members_visible_setting" className="text-sm font-medium">{t('groupDetailPage.showMembers')}</label>
                         <p className="text-xs text-muted-foreground">{t('groupDetailPage.studentsCanSeeGroupMembers')}</p>
                       </div>
                       <Switch
                         id="is_members_visible_setting"
                         checked={groupSettings.is_members_visible}
                         onCheckedChange={(checked) => setGroupSettings({ ...groupSettings, is_members_visible: checked })}
                       />
                     </div>
                   </div>
                 </div>

                 {/* Right Column - Thumbnail Management */}
                 <div className="space-y-6">
                   {/* Current Thumbnail Display */}
                   <div>
                     <label className="block text-sm font-medium mb-2">{t('groupDetailPage.currentThumbnail')}</label>
                     <div className="w-full h-48 overflow-hidden rounded-xl border border-input bg-card/50 hover:bg-card/70 transition-colors">
                       {group?.thumbnail_url ? (
                         <img
                           src={group.thumbnail_url}
                           alt={group.name}
                           className="w-full h-full object-cover"
                         />
                       ) : (
                         <div className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/10 to-muted/20 flex items-center justify-center">
                           <div className="text-center">
                             <Sparkles className="w-16 h-16 text-primary/60 mx-auto mb-2" />
                             <p className="text-sm text-muted-foreground">{t('groupDetailPage.noThumbnailSet')}</p>
                           </div>
                         </div>
                       )}
                     </div>
                   </div>

                   {/* Thumbnail Uploader */}
                   <div>
                     <label className="block text-sm font-medium mb-2">{t('groupDetailPage.updateThumbnail')}</label>
                     <ImageUploader
                       bucket={IMAGE_UPLOAD_BUCKETS.GROUPS_THUMBNAILS}
                       folder="groups"
                       compress={true}
                       generateThumbnail={true}
                       onImageUploaded={handleImageUploaded}
                       onImageDeleted={handleImageDeleted}
                       onError={(error) => {
                         toast({
                           title: t('groupDetailPage.error'),
                           description: error,
                           variant: 'destructive',
                         });
                       }}
                       variant="compact"
                       size="sm"
                       placeholder={t('groupDetailPage.uploadGroupThumbnail')}
                     />
                     <p className="text-xs text-muted-foreground mt-2">
                       {t('groupDetailPage.recommendedSize', { width: 800, height: 600, maxSize: 5 })}
                     </p>
                   </div>

                   {/* Group Stats */}
                   <div className="space-y-3">
                     <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('groupDetailPage.groupInformation')}</h3>
                     
                     <div className="grid grid-cols-2 gap-3">
                       <div className="p-4 rounded-lg border bg-card/50 text-center hover:bg-card/70 transition-colors">
                         <div className="text-2xl font-bold text-primary">{members.length}</div>
                         <div className="text-xs text-muted-foreground">{t('groupDetailPage.currentMembers')}</div>
                       </div>
                       
                       <div className="p-4 rounded-lg border bg-card/50 text-center hover:bg-card/70 transition-colors">
                         <div className="text-2xl font-bold text-secondary">
                           {group?.max_members || '∞'}
                         </div>
                         <div className="text-xs text-muted-foreground">{t('groupDetailPage.maxMembers')}</div>
                       </div>
                     </div>
                     
                     <div className="p-4 rounded-lg border bg-card/50 hover:bg-card/70 transition-colors">
                       <div className="text-sm text-muted-foreground">{t('groupDetailPage.created')}</div>
                       <div className="font-medium">
                         {group?.created_at ? new Date(group.created_at).toLocaleDateString() : 'Unknown'}
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Action Buttons - Full Width */}
               <div className="flex gap-3 pt-6 mt-6 border-t">
                 <Button onClick={handleUpdateGroup} className="flex-1 h-11">{t('groupDetailPage.saveChanges')}</Button>
                 <Button variant="outline" onClick={() => setShowSettings(false)} className="flex-1 h-11">{t('groupDetailPage.cancel')}</Button>
               </div>
             </div>
           </DialogContent>
         </Dialog>

         {/* Leave Group Confirmation Dialog */}
         <Dialog open={showLeaveConfirmation} onOpenChange={setShowLeaveConfirmation}>
           <DialogContent>
             <DialogHeader>
               <DialogTitle className="text-destructive">{t('groupDetailPage.leaveGroup')}</DialogTitle>
             </DialogHeader>
             <div className="space-y-4">
               <p className="text-muted-foreground">
                 {t('groupDetailPage.leaveGroupConfirmation', { groupName: group?.name })}
               </p>
               <div className="flex gap-3 pt-4">
                 <Button variant="destructive" onClick={handleLeaveGroup}>
                   {t('groupDetailPage.leaveGroup')}
                 </Button>
                 <Button variant="outline" onClick={() => setShowLeaveConfirmation(false)}>{t('groupDetailPage.cancel')}</Button>
               </div>
             </div>
           </DialogContent>
         </Dialog>
      </div>
    </DashboardLayout>
  );
};
