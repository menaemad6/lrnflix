import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { IMAGE_UPLOAD_BUCKETS } from '@/data/constants';
import type { UploadedImage } from '@/hooks/useImageUpload';

interface CreateChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChapterCreated: () => void;
}

export const CreateChapterModal = ({ isOpen, onClose, onChapterCreated }: CreateChapterModalProps) => {
  const { t } = useTranslation('dashboard');
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    status: 'draft'
  });

  const handleImageUploaded = (image: UploadedImage) => {
    setUploadedImage(image);
    toast({
      title: t('teacherChapterManagement.success'),
      description: t('teacherChapterManagement.chapterThumbnailUploaded'),
    });
  };

  const handleImageDeleted = (path: string) => {
    setUploadedImage(null);
    toast({
      title: t('teacherChapterManagement.success'),
      description: t('teacherChapterManagement.chapterThumbnailRemoved'),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('chapters')
        .insert({
          instructor_id: user.id,
          title: formData.title,
          description: formData.description,
          price: formData.price,
          status: formData.status,
          cover_image_url: uploadedImage?.url || null
        });

      if (error) throw error;

      toast({
        title: t('teacherChapterManagement.success'),
        description: t('teacherChapterManagement.chapterCreatedSuccessfully'),
      });

      setFormData({
        title: '',
        description: '',
        price: 0,
        status: 'draft'
      });
      setUploadedImage(null);
      
      onChapterCreated();
      onClose();
    } catch (error: unknown) {
      console.error('Error creating chapter:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create chapter';
      toast({
        title: t('teacherChapterManagement.error'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      price: 0,
      status: 'draft'
    });
    setUploadedImage(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-white/10">
        <DialogHeader>
          <DialogTitle className="gradient-text">{t('teacherChapterManagement.createNewChapter')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">{t('teacherChapterManagement.chapterTitle')}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('teacherChapterManagement.enterChapterTitle')}
              required
              className="glass"
            />
          </div>

          <div>
            <Label htmlFor="description">{t('teacherChapterManagement.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('teacherChapterManagement.describeWhatStudentsWillLearn')}
              rows={3}
              className="glass"
            />
          </div>

          <div>
            <Label>{t('teacherChapterManagement.chapterThumbnail')}</Label>
            <ImageUploader
              bucket={IMAGE_UPLOAD_BUCKETS.CHAPTERS_THUMBNAILS}
              folder="chapters"
              compress={true}
              generateThumbnail={true}
              onImageUploaded={handleImageUploaded}
              onImageDeleted={handleImageDeleted}
              onError={(error) => {
                toast({
                  title: t('teacherChapterManagement.error'),
                  description: error,
                  variant: 'destructive',
                });
              }}
              variant="compact"
              size="sm"
              placeholder={t('teacherChapterManagement.uploadChapterThumbnail')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">{t('teacherChapterManagement.price')}</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="glass"
              />
            </div>

            <div>
              <Label htmlFor="status">{t('teacherChapterManagement.status')}</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="glass">
                  <SelectValue placeholder={t('teacherChapterManagement.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t('teacherChapterManagement.draft')}</SelectItem>
                  <SelectItem value="published">{t('teacherChapterManagement.published')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || !formData.title}
              variant='default'
              className='flex-1'
            >
              {loading ? t('teacherChapterManagement.creating') : t('teacherChapterManagement.createChapter')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="glass"
            >
              {t('teacherChapterManagement.cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};