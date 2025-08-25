
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Sparkles } from 'lucide-react';

interface CreateLessonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  onLessonCreated: () => void;
}

export const CreateLessonModal: React.FC<CreateLessonModalProps> = ({
  open,
  onOpenChange,
  courseId,
  onLessonCreated
}) => {
  const { t } = useTranslation('courses');
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: t('teacherCourseDetails.error'),
        description: t('createLessonModal.titleRequired'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('lessons')
        .insert({
          course_id: courseId,
          title: formData.title,
          description: formData.description || null,
          video_url: formData.video_url || null,
        });

      if (error) throw error;

      toast({
        title: t('teacherCourseDetails.success'),
        description: t('createLessonModal.lessonCreatedSuccess'),
      });

      setFormData({ title: '', description: '', video_url: '' });
      onOpenChange(false);
      onLessonCreated();
    } catch (error: any) {
      console.error('Error creating lesson:', error);
      toast({
        title: t('teacherCourseDetails.error'),
        description: t('createLessonModal.lessonCreatedError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            {t('createLessonModal.title')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t('createLessonModal.lessonTitle')}</label>
            <Input
              placeholder={t('createLessonModal.lessonTitlePlaceholder')}
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t('createLessonModal.description')}</label>
            <Textarea
              placeholder={t('createLessonModal.descriptionPlaceholder')}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t('createLessonModal.videoUrl')}</label>
            <Input
              placeholder={t('createLessonModal.videoUrlPlaceholder')}
              value={formData.video_url}
              onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="btn-primary flex-1" disabled={loading}>
              <Sparkles className="h-4 w-4 mr-2" />
              {loading ? t('createLessonModal.creating') : t('createLessonModal.createLesson')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t('createLessonModal.cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
