
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Loader2, BookOpen } from 'lucide-react';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { IMAGE_UPLOAD_BUCKETS } from '@/data/constants';
import type { UploadedImage } from '@/hooks/useImageUpload';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated: () => void;
}

export const CreateCourseModal = ({ isOpen, onClose, onCourseCreated }: CreateCourseModalProps) => {
  const { t } = useTranslation('dashboard');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
  });
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageUploaded = (image: UploadedImage) => {
    setUploadedImage(image);
    toast({
      title: t('createCourseModal.success'),
      description: t('createCourseModal.courseThumbnailUploaded'),
    });
  };

  const handleImageDeleted = (path: string) => {
    setUploadedImage(null);
    toast({
      title: t('createCourseModal.success'),
      description: t('createCourseModal.courseThumbnailRemoved'),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: t('createCourseModal.error'),
        description: t('createCourseModal.courseTitleRequiredError'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('courses')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            price: formData.price,
            instructor_id: user.id,
            status: 'draft',
            cover_image_url: uploadedImage?.url || null
          }
        ]);

      if (error) throw error;

      toast({
        title: t('createCourseModal.success'),
        description: t('createCourseModal.courseCreatedSuccessfully'),
      });

      setFormData({ title: '', description: '', price: 0 });
      setUploadedImage(null);
      onCourseCreated();
      onClose();
    } catch (error: unknown) {
      console.error('Error creating course:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create course";
      toast({
        title: t('createCourseModal.error'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ title: '', description: '', price: 0 });
      setUploadedImage(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-0 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 gradient-text">
            {t('createCourseModal.title')}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('createCourseModal.courseTitleRequired')}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t('createCourseModal.enterCourseTitle')}
              className="bg-white/10 border-white/20"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">{t('createCourseModal.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('createCourseModal.describeYourCourse')}
              className="bg-white/10 border-white/20 min-h-[100px]"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('createCourseModal.courseThumbnail')}</Label>
            <ImageUploader
              bucket={IMAGE_UPLOAD_BUCKETS.LECTURES_THUMBNAILS}
              folder="courses"
              compress={true}
              generateThumbnail={true}
              onImageUploaded={handleImageUploaded}
              onImageDeleted={handleImageDeleted}
              onError={(error) => {
                toast({
                  title: t('createCourseModal.error'),
                  description: error,
                  variant: "destructive",
                });
              }}
              variant="compact"
              size="sm"
              placeholder={t('createCourseModal.uploadCourseThumbnail')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">{t('createCourseModal.price')}</Label>
            <Input
              id="price"
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              className="bg-white/10 border-white/20"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              {t('createCourseModal.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('createCourseModal.creating')}
                </>
              ) : (
                t('createCourseModal.title')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
