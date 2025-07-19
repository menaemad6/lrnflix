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
import { GroupCardSkeleton } from '@/components/student/skeletons/GroupCardSkeleton';

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
          } catch (error: unknown) {
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
    } catch (error: unknown) {
      console.error('Error leaving group:', error instanceof Error ? error.message : error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    }
  };

  const shareGroup = (group: Group) => {
    const shareLink = `${window.location.origin}/groups/${group.id}`;
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
          <Card className="glass-card w-full max-w-full">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-row gap-4 w-full items-center">
                <div className="flex-1 min-w-0 w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search by group name, description, or code"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 glass"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Groups Grid or Skeletons */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
              {[...Array(6)].map((_, i) => (
                <GroupCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredGroups.length === 0 ? (
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
              {filteredGroups.map((group) => {
                const isPublic = group.is_public;
                const borderColor = isPublic ? 'border-l-8 border-emerald-500' : 'border-l-8 border-yellow-400';
                const badgeColor = isPublic ? 'bg-emerald-500 text-white' : 'bg-yellow-400 text-yellow-900 font-bold rounded-full shadow px-3 py-1 border border-yellow-300 hover:bg-yellow-300 hover:border-yellow-500 transition-colors';
                const badgeLabel = isPublic ? 'Public' : 'Private';
                return (
                  <Card
                    key={group.id}
                    className={`glass-card ${borderColor} rounded-2xl shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] transition-all duration-200 group-card w-full`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl font-extrabold gradient-text mb-1 break-words whitespace-normal">
                            {group.name}
                          </CardTitle>
                          {group.description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-3 break-words whitespace-normal">{group.description}</p>
                          )}
                        </div>
                        <Badge className={`ml-2 flex-shrink-0 px-3 py-1 rounded-full text-base font-bold ${badgeColor} shadow-md`}>
                          <Users className="w-4 h-4 mr-1" />
                          {group.member_count}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          
                          <Badge className={`px-2 py-1 rounded-lg text-xs font-semibold ${badgeColor}`}>{badgeLabel}</Badge>
                          {group.max_members && (
                            <span className="text-xs text-muted-foreground ml-2">Max: {group.max_members}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 sm:mt-0">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {new Date(group.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Button 
                          onClick={() => navigate(`/groups/${group.id}`)}
                          className="rounded-xl font-semibold flex-1 min-w-[100px]"
                          size="sm"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Open
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => shareGroup(group)}
                          title="Share group"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        
                        {/* Leave button: only show if student is a member of the group */}
                        {memberGroupIds.includes(group.id) && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="rounded-xl text-destructive hover:text-destructive"
                            onClick={() => handleLeaveGroup(group.id, group.name)}
                            title="Leave group"
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
