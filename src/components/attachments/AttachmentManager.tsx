
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Link as LinkIcon, Edit, Trash2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { CreateAttachmentModal } from './CreateAttachmentModal';
import { AttachmentEditor } from './AttachmentEditor';
import { toast } from 'sonner';

interface Attachment {
  id: string;
  title: string;
  description: string | null;
  attachment_url: string | null;
  order_index: number;
  view_limit: number | null;
  device_limit: number | null;
  size: number | null;
  type: string;
  created_at: string;
  updated_at: string;
  course_id: string;
  chapter_id: string | null;
}

interface AttachmentManagerProps {
  courseId: string;
  chapterId?: string;
}

const getAttachmentIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <FileText className="h-4 w-4" />;
    case 'link':
      return <LinkIcon className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export const AttachmentManager: React.FC<AttachmentManagerProps> = ({ 
  courseId, 
  chapterId 
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAttachment, setEditingAttachment] = useState<Attachment | null>(null);
  const queryClient = useQueryClient();

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['attachments', courseId, chapterId],
    queryFn: async () => {
      let query = supabase
        .from('attachments')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (chapterId) {
        query = query.eq('chapter_id', chapterId);
      } else {
        query = query.is('chapter_id', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Attachment[];
    }
  });

  const reorderMutation = useMutation({
    mutationFn: async (reorderedAttachments: Attachment[]) => {
      const updates = reorderedAttachments.map((attachment, index) => ({
        id: attachment.id,
        order_index: index + 1
      }));

      const { error } = await supabase
        .from('attachments')
        .upsert(updates);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] });
      toast.success('Attachment order updated successfully');
    },
    onError: (error) => {
      console.error('Error reordering attachments:', error);
      toast.error('Failed to update attachment order');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      const { error } = await supabase
        .from('attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] });
      toast.success('Attachment deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting attachment:', error);
      toast.error('Failed to delete attachment');
    }
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedAttachments = Array.from(attachments);
    const [reorderedItem] = reorderedAttachments.splice(result.source.index, 1);
    reorderedAttachments.splice(result.destination.index, 0, reorderedItem);

    reorderMutation.mutate(reorderedAttachments);
  };

  const handleAttachmentCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['attachments'] });
    setIsCreateModalOpen(false);
  };

  const handleAttachmentUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['attachments'] });
    setEditingAttachment(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Course Attachments</CardTitle>
            <CardDescription>
              Manage PDF files, links and other attachments for this course
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Attachment
          </Button>
        </CardHeader>
        <CardContent>
          {attachments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No attachments added yet</p>
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Attachment
              </Button>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="attachments">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {attachments.map((attachment, index) => (
                      <Draggable
                        key={attachment.id}
                        draggableId={attachment.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`${
                              snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                            } hover:shadow-md transition-shadow`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab hover:cursor-grabbing"
                                  >
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    {getAttachmentIcon(attachment.type)}
                                    <Badge variant="outline" className="text-xs">
                                      {attachment.type.toUpperCase()}
                                    </Badge>
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium truncate">
                                      {attachment.title}
                                    </h4>
                                    {attachment.description && (
                                      <p className="text-sm text-muted-foreground truncate">
                                        {attachment.description}
                                      </p>
                                    )}
                                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                                      {attachment.view_limit && (
                                        <span>View Limit: {attachment.view_limit}</span>
                                      )}
                                      {attachment.device_limit && (
                                        <span>Device Limit: {attachment.device_limit}</span>
                                      )}
                                      {attachment.size && (
                                        <span>
                                          Size: {Math.round(attachment.size / 1024)} KB
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingAttachment(attachment)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      if (window.confirm('Are you sure you want to delete this attachment?')) {
                                        deleteMutation.mutate(attachment.id);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>

      <CreateAttachmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAttachmentCreated={handleAttachmentCreated}
        courseId={courseId}
        chapterId={chapterId}
      />

      {editingAttachment && (
        <AttachmentEditor
          attachment={editingAttachment}
          isOpen={!!editingAttachment}
          onClose={() => setEditingAttachment(null)}
          onAttachmentUpdated={handleAttachmentUpdated}
        />
      )}
    </>
  );
};
