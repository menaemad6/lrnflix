import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, MessageCircle, Search, Hash, Copy, Trash2, Share2, Calendar, Crown, Sparkles, Star, Settings } from 'lucide-react';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { useTeacherGroups } from '@/lib/queries';
import { GroupCardSkeleton } from '@/components/student/skeletons/GroupCardSkeleton';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { IMAGE_UPLOAD_BUCKETS } from '@/data/constants';
import type { UploadedImage } from '@/hooks/useImageUpload';

interface Group {
  id: string;
  name: string;
  description: string | null;
  group_code: string;
  created_at: string;
  member_count: number;
  is_public: boolean;
  max_members: number | null;
  thumbnail_url?: string;
}

export const TeacherGroups = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: groups = [], isLoading, refetch } = useTeacherGroups();
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    is_public: false,
    max_members: ''
  });

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

  const handleImageUploaded = (image: UploadedImage) => {
    setUploadedImage(image);
    toast({
      title: 'Success',
      description: 'Group thumbnail uploaded successfully!',
    });
  };

  const handleImageDeleted = (path: string) => {
    setUploadedImage(null);
    toast({
      title: 'Success',
      description: 'Group thumbnail removed',
    });
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
          group_code: 'TEMP', // This will be replaced by the trigger
          thumbnail_url: uploadedImage?.url || null
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
      setUploadedImage(null);
      setShowCreateForm(false);
      refetch();
    } catch (error: unknown) {
      console.error('Error creating group:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create group';
      toast({
        title: 'Error',
        description: errorMessage,
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

      refetch();
    } catch (error: unknown) {
      console.error('Error deleting group:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unknown error',
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

  const handleCloseForm = () => {
    setNewGroup({ name: '', description: '', is_public: false, max_members: '' });
    setUploadedImage(null);
    setShowCreateForm(false);
  };


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <TeacherPageHeader
          title="Study Groups"
          subtitle="Create and manage study groups for your students"
        />

        {/* Search Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>

        {/* Create Group Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Group</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Group Name</label>
                  <Input
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    placeholder="Enter group name"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    placeholder="Describe the group's purpose"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Group Thumbnail</label>
                  <ImageUploader
                    bucket={IMAGE_UPLOAD_BUCKETS.GROUPS_THUMBNAILS}
                    folder="groups"
                    compress={true}
                    generateThumbnail={true}
                    onImageUploaded={handleImageUploaded}
                    onImageDeleted={handleImageDeleted}
                    onError={(error) => {
                      toast({
                        title: 'Error',
                        description: error,
                        variant: 'destructive',
                      });
                    }}
                    variant="compact"
                    size="sm"
                    placeholder="Upload group thumbnail"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Max Members (Optional)</label>
                    <Input
                      type="number"
                      value={newGroup.max_members}
                      onChange={(e) => setNewGroup({ ...newGroup, max_members: e.target.value })}
                      placeholder="No limit"
                      min="1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_public"
                      checked={newGroup.is_public}
                      onCheckedChange={(checked) => setNewGroup({ ...newGroup, is_public: checked })}
                    />
                    <label htmlFor="is_public" className="text-sm font-medium">Make group public</label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={!newGroup.name.trim()}>
                    Create Group
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCloseForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Groups Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
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
            {filteredGroups.map((group) => {
              const isPublic = group.is_public;
              const borderColor = isPublic ? 'border-l-8 border-primary-500' : 'border-l-8 border-yellow-400';
              const badgeColor = isPublic ? 'bg-primary-500 text-white' : 'bg-yellow-400 text-yellow-900 font-bold rounded-full shadow px-3 py-1 border border-yellow-300 hover:bg-yellow-300 hover:border-yellow-500 transition-colors';
              const badgeLabel = isPublic ? 'Public' : 'Private';
              return (
                <Card
                  key={group.id}
                  className={`glass-card ${borderColor} rounded-2xl shadow-lg hover:shadow-primary-500/30 hover:scale-[1.02] transition-all duration-200 group-card w-full`}
                >
                  {/* Group Thumbnail */}
                  <div className="w-full h-48 overflow-hidden rounded-t-2xl">
                    {group.thumbnail_url ? (
                      <img
                        src={group.thumbnail_url}
                        alt={group.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/10 to-muted/20 flex items-center justify-center">
                        <Users className="w-16 h-16 text-primary/60" />
                      </div>
                    )}
                  </div>
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
                        <span>Created {new Date(group.created_at).toLocaleDateString()}</span>
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
                        onClick={() => copyGroupLink(group.id, group.group_code)}
                        title="Copy invitation link"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="rounded-xl text-destructive hover:text-destructive"
                        onClick={() => handleDeleteGroup(group.id, group.name)}
                        title="Delete group"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
      </div>
    </DashboardLayout>
  );
};
