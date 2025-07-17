
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Share2, Plus, FileText, Video, Users, BookOpen, ClipboardList, Trash2, Calendar, User } from 'lucide-react';

interface GroupObject {
  id: string;
  object_type: string;
  object_id: string | null;
  object_data: any;
  title: string;
  description: string | null;
  shared_by: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string;
  } | null;
}

interface GroupObjectsSectionProps {
  groupId: string;
  isCreator: boolean;
  isMember: boolean;
}

const objectTypeIcons = {
  lecture: BookOpen,
  group: Users,
  document: FileText,
  video: Video,
  quiz: ClipboardList,
  assignment: ClipboardList,
};

const objectTypeLabels = {
  lecture: 'Lecture',
  group: 'Group',
  document: 'Document',
  video: 'Video',
  quiz: 'Quiz',
  assignment: 'Assignment',
};

export const GroupObjectsSection = ({ groupId, isCreator, isMember }: GroupObjectsSectionProps) => {
  const { toast } = useToast();
  const [objects, setObjects] = useState<GroupObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareForm, setShowShareForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newObject, setNewObject] = useState({
    object_type: '',
    title: '',
    description: '',
    object_data: {}
  });

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (isMember || isCreator) {
      fetchGroupObjects();
    }
  }, [groupId, isMember, isCreator]);

  const fetchGroupObjects = async () => {
    try {
      const { data, error } = await supabase
        .from('group_objects')
        .select(`
          *,
          profiles:shared_by (
            full_name,
            email
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData: GroupObject[] = (data || []).map(item => ({
        ...item,
        profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
      }));

      setObjects(transformedData);
    } catch (error: any) {
      console.error('Error fetching group objects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shared content',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShareObject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObject.object_type || !newObject.title.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('group_objects')
        .insert({
          group_id: groupId,
          object_type: newObject.object_type,
          title: newObject.title.trim(),
          description: newObject.description.trim() || null,
          shared_by: user.id,
          object_data: newObject.object_data
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Content shared successfully!',
      });

      setNewObject({ object_type: '', title: '', description: '', object_data: {} });
      setShowShareForm(false);
      fetchGroupObjects();
    } catch (error: any) {
      console.error('Error sharing object:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteObject = async (objectId: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}"?`)) return;

    try {
      const { error } = await supabase
        .from('group_objects')
        .delete()
        .eq('id', objectId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Content removed successfully!',
      });

      fetchGroupObjects();
    } catch (error: any) {
      console.error('Error deleting object:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (!isMember && !isCreator) {
    return null;
  }

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Shared Content
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowShareForm(!showShareForm)}
            className="hover-glow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Share Content
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showShareForm && (
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Share New Content</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleShareObject} className="space-y-4">
                <div>
                  <Select
                    value={newObject.object_type}
                    onValueChange={(value) => setNewObject({ ...newObject, object_type: value })}
                  >
                    <SelectTrigger className="glass border-white/20">
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lecture">📚 Lecture</SelectItem>
                      <SelectItem value="document">📄 Document</SelectItem>
                      <SelectItem value="video">🎥 Video</SelectItem>
                      <SelectItem value="quiz">📝 Quiz</SelectItem>
                      <SelectItem value="assignment">📋 Assignment</SelectItem>
                      <SelectItem value="group">👥 Group</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Input
                    placeholder="Content title"
                    value={newObject.title}
                    onChange={(e) => setNewObject({ ...newObject, title: e.target.value })}
                    className="glass border-white/20"
                    required
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Description (optional)"
                    value={newObject.description}
                    onChange={(e) => setNewObject({ ...newObject, description: e.target.value })}
                    className="glass border-white/20"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="hover-glow">
                    Share Content
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowShareForm(false)}
                    className="glass hover-glow"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {objects.length === 0 ? (
          <div className="text-center py-8">
            <Share2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2">No Shared Content</h4>
            <p className="text-muted-foreground">
              Start sharing lectures, documents, and other resources with the group!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {objects.map((object) => {
              const IconComponent = objectTypeIcons[object.object_type as keyof typeof objectTypeIcons] || FileText;
              
              return (
                <Card key={object.id} className="glass border-white/10 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium truncate">{object.title}</h5>
                            <Badge variant="outline" className="glass text-xs">
                              {objectTypeLabels[object.object_type as keyof typeof objectTypeLabels]}
                            </Badge>
                          </div>
                          {object.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {object.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{object.profiles?.full_name || object.profiles?.email || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(object.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {(isCreator || object.shared_by === currentUserId) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteObject(object.id, object.title)}
                          className="glass hover-glow hover:bg-destructive/20 ml-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
