
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Attachment {
  id: string;
  course_id: string;
  chapter_id: string | null;
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
}

export const useAttachments = (courseId: string, chapterId?: string) => {
  return useQuery({
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
};

export const useCreateAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attachment: Omit<Attachment, 'id' | 'created_at' | 'updated_at' | 'order_index'>) => {
      const { data, error } = await supabase
        .from('attachments')
        .insert(attachment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] });
    }
  });
};

export const useUpdateAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Attachment> & { id: string }) => {
      const { data, error } = await supabase
        .from('attachments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] });
    }
  });
};

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('attachments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] });
    }
  });
};
