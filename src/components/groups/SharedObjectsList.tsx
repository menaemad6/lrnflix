import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ModernScrollbar } from '@/components/ui/modern-scrollbar';
import { 
  FileText, 
  Image, 
  Link as LinkIcon, 
  Video, 
  Share2, 
  Trash2,
  ExternalLink,
  Calendar,
  BookOpen,
  PlayCircle,
  Brain
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '@/store/store';

interface GroupObject {
  id: string;
  object_type: string;
  title: string;
  description: string | null;
  object_data: any;
  shared_by: string;
  created_at: string;
  sharer_name?: string;
  sharer_email?: string;
}

interface SharedObjectsListProps {
  groupId: string;
  refreshTrigger?: number;
}

export const SharedObjectsList = ({ groupId, refreshTrigger }: SharedObjectsListProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [objects, setObjects] = useState<GroupObject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchObjects();
  }, [groupId, refreshTrigger]);

  const fetchObjects = async () => {
    try {
      setLoading(true);
      
      const { data: objectsData, error: objectsError } = await supabase
        .from('group_objects')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (objectsError) throw objectsError;

      if (!objectsData || objectsData.length === 0) {
        setObjects([]);
        return;
      }

      // Get sharer profiles
      const sharerIds = [...new Set(objectsData.map(obj => obj.shared_by))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', sharerIds);

      if (profilesError) {
        console.error('Error fetching sharer profiles:', profilesError);
      }

      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, {
          name: profile.full_name,
          email: profile.email
        });
      });

      const enrichedObjects: GroupObject[] = objectsData.map(obj => {
        const profile = profilesMap.get(obj.shared_by);
        return {
          ...obj,
          sharer_name: profile?.name || 'Unknown User',
          sharer_email: profile?.email || ''
        };
      });

      setObjects(enrichedObjects);
    } catch (error: unknown) {
      console.error('Error fetching shared objects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shared objects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteObject = async (objectId: string) => {
    if (!confirm('Are you sure you want to delete this object?')) return;

    try {
      const { error } = await supabase
        .from('group_objects')
        .delete()
        .eq('id', objectId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Object deleted successfully',
      });

      fetchObjects();
    } catch (error: unknown) {
      console.error('Error deleting object:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete object',
        variant: 'destructive',
      });
    }
  };

  const getObjectIcon = (type: string) => {
    switch (type) {
      case 'document': return FileText;
      case 'image': return Image;
      case 'link': return LinkIcon;
      case 'video': return Video;
      case 'course': return BookOpen;
      case 'lesson': return PlayCircle;
      case 'quiz': return Brain;
      default: return FileText;
    }
  };

  const getObjectBadgeColor = (type: string) => {
    switch (type) {
      case 'course': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'lesson': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'quiz': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'border-white/20';
    }
  };

  const handleObjectClick = (obj: GroupObject) => {
    if (obj.object_type === 'link' && obj.object_data?.url) {
      window.open(obj.object_data.url, '_blank');
    } else if (obj.object_type === 'image' && obj.object_data?.url) {
      window.open(obj.object_data.url, '_blank');
    } else if (obj.object_type === 'video' && obj.object_data?.url) {
      window.open(obj.object_data.url, '_blank');
    } else if (obj.object_type === 'course' && obj.object_data?.course_id) {
      navigate(`/courses/${obj.object_data.course_id}`);
    } else if (obj.object_type === 'lesson' && obj.object_data?.lesson_id && obj.object_data?.course_id) {
      if (user?.role === 'teacher') {
        navigate(`/teacher/courses/${obj.object_data.course_id}/manage`);
      } else {
        navigate(`/courses/${obj.object_data.course_id}/progress/lesson/${obj.object_data.lesson_id}`);
      }
    } else if (obj.object_type === 'quiz' && obj.object_data?.quiz_id && obj.object_data?.course_id) {
      if (user?.role === 'teacher') {
        navigate(`/teacher/courses/${obj.object_data.course_id}/manage`);
      } else {
        navigate(`/courses/${obj.object_data.course_id}/progress/quiz/${obj.object_data.quiz_id}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {objects.length === 0 ? (
        <div className="text-center py-8">
          <Share2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No objects shared yet</p>
        </div>
      ) : (
        <ModernScrollbar maxHeight="500px">
          <div className="space-y-3 pr-2">
            {objects.map((obj) => {
              const IconComponent = getObjectIcon(obj.object_type);
              const isClickable = ['link', 'image', 'video', 'course', 'lesson', 'quiz'].includes(obj.object_type);
              const canDelete = obj.shared_by === user?.id;
              const badgeColor = getObjectBadgeColor(obj.object_type);

              return (
                <Card 
                  key={obj.id} 
                  className={`hover-glow transition-all duration-300 ${isClickable ? 'cursor-pointer' : ''}`}
                  onClick={() => isClickable && handleObjectClick(obj)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        ['course', 'lesson', 'quiz'].includes(obj.object_type) 
                          ? 'bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20' 
                          : 'bg-primary/10'
                      }`}>
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold truncate">{obj.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs capitalize ${badgeColor}`}
                            >
                              {obj.object_type}
                            </Badge>
                            {isClickable && (
                              <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        
                        {obj.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {obj.description}
                          </p>
                        )}

                        {/* Educational content preview */}
                        {['course', 'lesson', 'quiz'].includes(obj.object_type) && (
                          <div className="mb-3 p-2 rounded-lg bg-gradient-to-r from-primary/5 to-transparent border-l-2 border-primary/30">
                            <p className="text-xs text-primary font-medium">
                              🎓 Educational Content - Click to access
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {obj.sharer_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-xs text-muted-foreground">
                              <span>{obj.sharer_name}</span>
                              <span className="mx-1">•</span>
                              <span>{new Date(obj.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteObject(obj.id);
                              }}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ModernScrollbar>
      )}
    </div>
  );
};
