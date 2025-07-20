
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Users, Settings, ArrowLeft, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GroupDetails {
  id: string;
  name: string;
  description: string;
  group_code: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  max_members: number;
  is_public: boolean;
  is_code_visible: boolean;
  is_members_visible: boolean;
}

interface Member {
  id: string;
  user_id: string;
  group_id: string;
  joined_at: string;
  user: {
    id: string;
    email: string;
    user_metadata: {
      avatar_url: string;
      full_name: string;
    };
  };
}

const GroupDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchGroupDetails();
      fetchGroupMembers();
    }
  }, [id]);

  const fetchGroupDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, description, group_code, created_at, updated_at, created_by, max_members, is_public, is_code_visible, is_members_visible')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Set default values for missing properties
      const groupWithDefaults: GroupDetails = {
        id: data.id,
        name: data.name,
        description: data.description,
        group_code: data.group_code,
        created_at: data.created_at,
        updated_at: data.updated_at,
        created_by: data.created_by,
        max_members: data.max_members,
        is_public: data.is_public,
        is_code_visible: data.is_code_visible ?? true,
        is_members_visible: data.is_members_visible ?? true
      };

      setGroup(groupWithDefaults);
    } catch (err) {
      console.error('Error fetching group:', err);
      setError('Failed to load group details');
    }
  };

  const fetchGroupMembers = async () => {
    try {
      // First get the group members
      const { data: groupMembersData, error: membersError } = await supabase
        .from('group_members')
        .select('id, group_id, student_id, joined_at')
        .eq('group_id', id);

      if (membersError) throw membersError;

      if (!groupMembersData || groupMembersData.length === 0) {
        setMembers([]);
        setLoading(false);
        return;
      }

      // Get the student IDs
      const studentIds = groupMembersData.map(member => member.student_id);

      // Fetch profiles for these students
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .in('id', studentIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const transformedMembers: Member[] = groupMembersData.map(member => {
        const profile = profilesData?.find(p => p.id === member.student_id);
        
        return {
          id: member.id,
          user_id: member.student_id,
          group_id: member.group_id,
          joined_at: member.joined_at,
          user: {
            id: profile?.id || '',
            email: profile?.email || '',
            user_metadata: {
              avatar_url: profile?.avatar_url || '',
              full_name: profile?.full_name || ''
            }
          }
        };
      });

      setMembers(transformedMembers);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load group members');
    } finally {
      setLoading(false);
    }
  };

  const copyGroupCode = () => {
    if (group?.group_code) {
      navigator.clipboard.writeText(group.group_code);
      toast({
        title: "Code copied!",
        description: "Group code copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading group details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !group) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-500">{error || 'Group not found'}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/groups')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Groups</span>
            </Button>
            <h1 className="text-2xl font-bold">{group.name}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={group.is_public ? "default" : "secondary"}>
              {group.is_public ? "Public" : "Private"}
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Group Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Group Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Description</h3>
              <p className="text-muted-foreground">{group.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Group Code</h3>
                <div className="flex items-center space-x-2">
                  <code className="bg-muted px-2 py-1 rounded text-sm">
                    {group.group_code}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyGroupCode}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold">Members</h3>
                <p className="text-muted-foreground">
                  {members.length} / {group.max_members} members
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Members ({members.length})</span>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Members
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {member.user.user_metadata.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {member.user.user_metadata.full_name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GroupDetailPage;
