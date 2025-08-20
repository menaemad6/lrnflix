
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Trash2, MessageCircle } from 'lucide-react';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { IMAGE_UPLOAD_BUCKETS } from '@/data/constants';
import type { UploadedImage } from '@/hooks/useImageUpload';

interface Group {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  is_public: boolean;
  max_members: number | null;
  group_members: Array<{
    student_id: string;
    profiles: {
      full_name: string | null;
      email: string;
    } | null;
  }>;
}

interface Student {
  id: string;
  full_name: string | null;
  email: string;
}

interface GroupManagerProps {
  courseId?: string;
  onGroupSelect?: (groupId: string) => void;
}

export const GroupManager = ({ courseId, onGroupSelect }: GroupManagerProps) => {
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [newGroup, setNewGroup] = useState({ 
    name: '', 
    description: '', 
    is_public: false,
    max_members: ''
  });
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  useEffect(() => {
    fetchGroups();
    if (courseId) {
      fetchStudents();
    }
  }, [courseId]);

  const fetchGroups = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch groups created by this user
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;

      // Fetch group members
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('group_id, student_id')
        .in('group_id', groupsData?.map(g => g.id) || []);

      if (membersError) throw membersError;

      // Get unique student IDs
      const studentIds = [...new Set(membersData?.map(m => m.student_id) || [])];

      // Fetch profiles for group members
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', studentIds);

      if (profilesError) throw profilesError;

      // Create profile lookup
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, {
          full_name: profile.full_name,
          email: profile.email
        });
      });

      // Combine data
      const enrichedGroups: Group[] = groupsData?.map(group => ({
        ...group,
        group_members: membersData
          ?.filter(member => member.group_id === group.id)
          .map(member => ({
            student_id: member.student_id,
            profiles: profilesMap.get(member.student_id) || null
          })) || []
      })) || [];

      setGroups(enrichedGroups);
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchStudents = async () => {
    try {
      if (!courseId) return;

      // Fetch enrolled students
      const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('course_id', courseId);

      if (error) throw error;

      if (enrollments && enrollments.length > 0) {
        const studentIds = enrollments.map(e => e.student_id);
        
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', studentIds);

        if (profilesError) throw profilesError;

        const transformedStudents: Student[] = profiles?.map(profile => ({
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email
        })) || [];
        
        setStudents(transformedStudents);
      }
    } catch (error: any) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: newGroup.name,
          description: newGroup.description || null,
          created_by: user.id,
          is_public: newGroup.is_public,
          max_members: newGroup.max_members ? parseInt(newGroup.max_members) : null,
          group_code: 'TEMP', // This will be overwritten by the database trigger
          thumbnail_url: uploadedImage?.url || null
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add selected students to the group
      if (selectedStudents.length > 0) {
        const members = selectedStudents.map(studentId => ({
          group_id: group.id,
          student_id: studentId
        }));

        const { error: membersError } = await supabase
          .from('group_members')
          .insert(members);

        if (membersError) throw membersError;
      }

      toast({
        title: 'Success',
        description: 'Group created successfully!',
      });

      setNewGroup({ name: '', description: '', is_public: false, max_members: '' });
      setSelectedStudents([]);
      setUploadedImage(null);
      setShowNewGroup(false);
      fetchGroups();
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

  const deleteGroup = async (groupId: string) => {
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

      fetchGroups();
    } catch (error: any) {
      console.error('Error deleting group:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const removeStudentFromGroup = async (groupId: string, studentId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('student_id', studentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Student removed from group!',
      });

      fetchGroups();
    } catch (error: any) {
      console.error('Error removing student:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const addStudentToGroup = async (groupId: string, studentId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          student_id: studentId
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Student added to group!',
      });

      fetchGroups();
    } catch (error: any) {
      console.error('Error adding student:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCloseNewGroup = () => {
    setNewGroup({ name: '', description: '', is_public: false, max_members: '' });
    setSelectedStudents([]);
    setUploadedImage(null);
    setShowNewGroup(false);
  };

  if (loading) {
    return <div>Loading groups...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Study Groups</h2>
        <Button onClick={() => setShowNewGroup(!showNewGroup)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {showNewGroup && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Group</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createGroup} className="space-y-4">
              <Input
                placeholder="Group name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                required
              />
              <Textarea
                placeholder="Group description"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                rows={3}
              />
              
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
                  />
                  <label htmlFor="is_public" className="text-sm">Make group public</label>
                </div>
              </div>
              
              {courseId && students.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Add Students</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={student.id}
                          checked={selectedStudents.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents([...selectedStudents, student.id]);
                            } else {
                              setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                            }
                          }}
                        />
                        <label htmlFor={student.id} className="text-sm">
                          {student.full_name || student.email}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit">Create Group</Button>
                <Button type="button" variant="outline" onClick={handleCloseNewGroup}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {group.name}
                  </CardTitle>
                  {group.description && (
                    <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {onGroupSelect && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onGroupSelect(group.id)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteGroup(group.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Members ({group.group_members?.length || 0})</h4>
                  <div className="space-y-2">
                    {group.group_members?.map((member) => (
                      <div key={member.student_id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {member.profiles?.full_name?.charAt(0) || member.profiles?.email?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {member.profiles?.full_name || member.profiles?.email || 'Unknown User'}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeStudentFromGroup(group.id, member.student_id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {courseId && students.length > 0 && (
                  <div>
                    <Select onValueChange={(studentId) => addStudentToGroup(group.id, studentId)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add student to group" />
                      </SelectTrigger>
                      <SelectContent>
                        {students
                          .filter(student => 
                            !group.group_members?.some(member => member.student_id === student.id)
                          )
                          .map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.full_name || student.email}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {groups.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
              <p className="text-muted-foreground">Create groups to organize students for collaboration.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
