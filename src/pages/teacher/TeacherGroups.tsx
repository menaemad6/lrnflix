import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, MessageCircle, Search, Hash, Copy, Trash2, Share2, Calendar, Crown, Sparkles, Star, Settings } from 'lucide-react';

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

export const TeacherGroups = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    is_public: false,
    max_members: ''
  });

  useEffect(() => {
    fetchTeacherGroups();
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

  const fetchTeacherGroups = async () => {
    try {
      setLoading(true);
      console.log('Starting to fetch teacher groups...');

      // First verify we have a user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Auth error:', userError);
        throw userError;
      }
      
      if (!user) {
        console.log('No authenticated user found');
        toast({
          title: 'Error',
          description: 'You must be logged in to view groups',
          variant: 'destructive',
        });
        return;
      }

      console.log('Authenticated user ID:', user.id);

      // Check user role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw profileError;
      }

      if (profile?.role !== 'teacher') {
        console.log('User is not a teacher, role:', profile?.role);
        toast({
          title: 'Access Denied',
          description: 'Only teachers can access this page',
          variant: 'destructive',
        });
        navigate('/student/groups');
        return;
      }

      console.log('User is a teacher, fetching groups...');

      // Fetch groups created by this teacher
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (groupsError) {
        console.error('Groups fetch error:', groupsError);
        throw groupsError;
      }

      console.log('Raw groups data:', groupsData);

      if (!groupsData) {
        console.log('No groups data returned');
        setGroups([]);
        setFilteredGroups([]);
        return;
      }

      // Get member counts for each group
      const groupsWithCounts = await Promise.all(
        groupsData.map(async (group) => {
          try {
            console.log(`Fetching member count for group ${group.id}...`);
            const { count, error: countError } = await supabase
              .from('group_members')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', group.id);

            if (countError) {
              console.error(`Count error for group ${group.id}:`, countError);
              return { ...group, member_count: 0 };
            }

            console.log(`Group ${group.id} has ${count} members`);
            return {
              ...group,
              member_count: count || 0
            };
          } catch (error) {
            console.error(`Error getting count for group ${group.id}:`, error);
            return { ...group, member_count: 0 };
          }
        })
      );

      console.log('Final groups with counts:', groupsWithCounts);
      setGroups(groupsWithCounts);
      setFilteredGroups(groupsWithCounts);
      
      if (groupsWithCounts.length === 0) {
        console.log('No groups found for this teacher');
      } else {
        console.log(`Successfully loaded ${groupsWithCounts.length} groups`);
      }
    } catch (error: any) {
      console.error('Error in fetchTeacherGroups:', error);
      toast({
        title: 'Error',
        description: `Failed to load groups: ${error.message}`,
        variant: 'destructive',
      });
      setGroups([]);
      setFilteredGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroup.name.trim()) return;

    try {
      console.log('Creating new group:', newGroup);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to create a group',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: newGroup.name.trim(),
          description: newGroup.description.trim() || null,
          created_by: user.id,
          is_public: newGroup.is_public,
          max_members: newGroup.max_members ? parseInt(newGroup.max_members) : null,
          group_code: 'TEMP' // This will be replaced by the trigger
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating group:', error);
        throw error;
      }

      console.log('Group created successfully:', data);

      toast({
        title: 'Success',
        description: 'Group created successfully!',
      });

      setNewGroup({ name: '', description: '', is_public: false, max_members: '' });
      setShowCreateForm(false);
      fetchTeacherGroups();
    } catch (error: any) {
      console.error('Error creating group:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Are you sure you want to delete "${groupName}"? This action cannot be undone.`)) return;

    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Group deleted successfully!',
      });

      fetchTeacherGroups();
    } catch (error: any) {
      console.error('Error deleting group:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const copyGroupCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied!',
      description: 'Group code copied to clipboard',
    });
  };

  const copyGroupLink = (groupId: string, code: string) => {
    const link = `${window.location.origin}/groups/${groupId}?code=${code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Copied!',
      description: 'Group invitation link copied to clipboard',
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manage Groups</h1>
            <p className="text-muted-foreground">Create and manage study groups for students</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>

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

        {/* Create Group Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Create New Group
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <Input
                  placeholder="Group name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Group description (optional)"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  rows={3}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Max members (optional)"
                    value={newGroup.max_members}
                    onChange={(e) => setNewGroup({ ...newGroup, max_members: e.target.value })}
                    min="1"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_public"
                      checked={newGroup.is_public}
                      onChange={(e) => setNewGroup({ ...newGroup, is_public: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="is_public" className="text-sm font-medium">Make group public</label>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="submit">Create Group</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

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
                  ? 'Try adjusting your search terms to find the right group' 
                  : 'Create your first group to help students collaborate and learn together'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Group
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
                      onClick={() => copyGroupCode(group.group_code)}
                    >
                      <Hash className="w-3 h-3 mr-1" />
                      {group.group_code}
                      <Copy className="w-3 h-3 ml-1" />
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
                    <span>Created {new Date(group.created_at).toLocaleDateString()}</span>
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
                      onClick={() => copyGroupLink(group.id, group.group_code)}
                      title="Copy invitation link"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteGroup(group.id, group.name)}
                      className="text-destructive hover:text-destructive"
                      title="Delete group"
                    >
                      <Trash2 className="w-4 h-4" />
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
      </div>
    </DashboardLayout>
  );
};
