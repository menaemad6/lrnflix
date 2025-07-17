import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { JoinGroupModal } from '@/components/groups/JoinGroupModal';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, MessageCircle, Calendar, Hash, Search, UserMinus, Share2 } from 'lucide-react';
import { useRandomBackground } from "../../hooks/useRandomBackground";
import { useTenant } from '@/contexts/TenantContext';
import DashboardModernHeader from '@/components/ui/DashboardModernHeader';

interface Group {
  id: string;
  name: string;
  description: string | null;
  group_code: string;
  created_at: string;
  member_count: number;
  is_public: boolean;
  max_members: number | null;
}

export const StudentGroups = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [memberGroupIds, setMemberGroupIds] = useState<string[]>([]);
  const bgClass = useRandomBackground();
  const { teacher } = useTenant();

  useEffect(() => {
    fetchStudentGroups();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredGroups(groups);
    } else {
      const filtered = groups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.group_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGroups(filtered);
    }
  }, [searchTerm, groups]);

  const fetchStudentGroups = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        setGroups([]);
        setFilteredGroups([]);
        return;
      }

      // Get groups where the student is a member
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('student_id', user.id);
      if (memberError) throw memberError;
      const groupIds = memberData?.map(m => m.group_id) || [];
      setMemberGroupIds(groupIds);

      // Fetch the actual group data for member groups
      let memberGroupsData: any[] = [];
      if (groupIds.length > 0) {
        let memberGroupsQuery = supabase
          .from('groups')
          .select('*')
          .in('id', groupIds)
          .order('created_at', { ascending: false });
        if (teacher) {
          memberGroupsQuery = memberGroupsQuery.eq('created_by', teacher.user_id);
        }
        const { data, error } = await memberGroupsQuery;
        if (error) throw error;
        memberGroupsData = data || [];
      }

      // Fetch all public groups
      let publicGroupsQuery = supabase
        .from('groups')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      if (teacher) {
        publicGroupsQuery = publicGroupsQuery.eq('created_by', teacher.user_id);
      }
      const { data: publicGroups, error: publicError } = await publicGroupsQuery;
      if (publicError) throw publicError;

      // Merge member groups and public groups, avoiding duplicates
      const allGroupsMap = new Map<string, any>();
      memberGroupsData.forEach(g => allGroupsMap.set(g.id, g));
      (publicGroups || []).forEach(g => allGroupsMap.set(g.id, g));
      const allGroups = Array.from(allGroupsMap.values());

      // Get member counts for each group and create properly typed Group objects
      const groupsWithCounts = await Promise.all(
        allGroups.map(async (group) => {
          try {
            const { count, error: countError } = await supabase
              .from('group_members')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', group.id);
            if (countError) return { ...group, member_count: 0 } as Group;
            return { ...group, member_count: count || 0 } as Group;
          } catch (error) {
            return { ...group, member_count: 0 } as Group;
          }
        })
      );
      setGroups(groupsWithCounts);
      setFilteredGroups(groupsWithCounts);
    } catch (error: unknown) {
      setGroups([]);
      setFilteredGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Are you sure you want to leave "${groupName}"?`)) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('student_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Left group: ${groupName}`,
      });

      fetchStudentGroups();
    } catch (error: any) {
      console.error('Error leaving group:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const shareGroup = (group: Group) => {
    const shareLink = `${window.location.origin}/groups/${group.id}?code=${group.group_code}`;
    if (navigator.share) {
      navigator.share({
        title: `Join ${group.name}`,
        text: `Join our study group: ${group.name}`,
        url: shareLink,
      });
    } else {
      navigator.clipboard.writeText(shareLink);
      toast({
        title: 'Link copied!',
        description: 'Group invitation link copied to clipboard',
      });
    }
  };

  if (loading) {
    return (
      <div className={bgClass + " min-h-screen"}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DashboardLayout>
      </div>
    );
  }

  return (
    <div className={bgClass + " min-h-screen"}>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <DashboardModernHeader
            title="My Study Groups"
            subtitle="Connect and collaborate with your classmates"
            buttonText="Join Group"
            onButtonClick={() => setShowJoinModal(true)}
          />

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Groups Grid */}
          {filteredGroups.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchTerm ? 'No matching groups found' : 'No groups yet'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm 
                    ? 'Try adjusting your search terms to find the perfect group' 
                    : 'Join your first study group to start collaborating with classmates'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowJoinModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Join Your First Group
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <Card key={group.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{group.name}</CardTitle>
                        {group.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{group.description}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-2 flex-shrink-0">
                        <Users className="w-3 h-3 mr-1" />
                        {group.member_count}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => {
                          navigator.clipboard.writeText(group.group_code);
                          toast({ title: 'Code copied!' });
                        }}
                      >
                        <Hash className="w-3 h-3 mr-1" />
                        {group.group_code}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Badge variant={group.is_public ? 'default' : 'secondary'}>
                          {group.is_public ? 'Public' : 'Private'}
                        </Badge>
                        {group.max_members && (
                          <span className="text-xs text-muted-foreground">
                            Max: {group.max_members}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Joined {new Date(group.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => navigate(`/groups/${group.id}`)}
                        className="flex-1"
                        size="sm"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Open
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => shareGroup(group)}
                        title="Share group"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      {group.is_public && !memberGroupIds.includes(group.id) && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setShowJoinModal(true)}
                          title="Join group"
                        >
                          Join
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleLeaveGroup(group.id, group.name)}
                        className="text-destructive hover:text-destructive"
                        title="Leave group"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {searchTerm && filteredGroups.length > 0 && (
            <div className="text-center">
              <p className="text-muted-foreground">
                Found {filteredGroups.length} group{filteredGroups.length !== 1 ? 's' : ''} matching "{searchTerm}"
              </p>
            </div>
          )}

          <JoinGroupModal
            isOpen={showJoinModal}
            onClose={() => setShowJoinModal(false)}
            onGroupJoined={fetchStudentGroups}
          />
        </div>
      </DashboardLayout>
    </div>
  );
};
