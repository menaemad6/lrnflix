
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Upload, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface CreateAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachmentCreated: () => void;
  courseId: string;
  chapterId?: string;
}

export const CreateAttachmentModal: React.FC<CreateAttachmentModalProps> = ({
  isOpen,
  onClose,
  onAttachmentCreated,
  courseId,
  chapterId
}) => {
  const { t } = useTranslation('dashboard');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<string>('pdf');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('attachments')
        .insert({
          course_id: courseId,
          chapter_id: chapterId || null,
          title: data.title,
          description: data.description || null,
          type: data.type,
          attachment_url: data.attachment_url || null,


          size: data.size || null
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t('attachments.attachmentCreatedSuccessfully'));
      onAttachmentCreated();
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating attachment:', error);
      toast.error(t('attachments.failedToUpdateAttachment'));
    }
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('pdf');
    setAttachmentUrl('');
  };

  const handleFileUpload = async (file: File) => {
    if (type !== 'pdf') {
      toast.error(t('attachments.fileUploadOnlyForPdf'));
      return;
    }

    setUploadingFile(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${courseId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course_attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course_attachments')
        .getPublicUrl(filePath);

      setAttachmentUrl(publicUrl);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      toast.success(t('attachments.fileUploadedSuccessfully'));
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(t('attachments.failedToUploadFile'));
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error(t('attachments.pleaseEnterTitle'));
      return;
    }

    if (type === 'link' && !attachmentUrl.trim()) {
      toast.error(t('attachments.pleaseEnterUrlForLink'));
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      type,
      attachment_url: attachmentUrl.trim(),
      size: null // Will be calculated if file is uploaded
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('attachments.addNewAttachment')}</DialogTitle>
          <DialogDescription>
            {t('attachments.createAndManageAttachments')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('attachments.titleLabel')} *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('attachments.enterAttachmentTitle')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('attachments.descriptionLabel')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('attachments.enterAttachmentDescription')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">{t('attachments.typeLabel')} *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder={t('attachments.selectAttachmentType')} />
              </SelectTrigger>
              <SelectContent>
                                    <SelectItem value="pdf">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        {t('attachments.pdfFile')}
                      </div>
                    </SelectItem>
                    <SelectItem value="link">
                      <div className="flex items-center">
                        <LinkIcon className="h-4 w-4 mr-2" />
                        {t('attachments.externalLink')}
                      </div>
                    </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === 'pdf' && (
            <div className="space-y-2">
              <Label>{t('attachments.pdfFile')}</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingFile ? t('attachments.uploading') : t('attachments.uploadPdf')}
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />
              {attachmentUrl && (
                <p className="text-sm text-muted-foreground">
                  {t('attachments.fileUploaded', { fileName: attachmentUrl.split('/').pop() })}
                </p>
              )}
            </div>
          )}

          {type === 'link' && (
            <div className="space-y-2">
              <Label htmlFor="url">{t('attachments.urlLabel')} *</Label>
              <Input
                id="url"
                type="url"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder={t('attachments.enterUrlForLink')}
                required={type === 'link'}
              />
            </div>
          )}


          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('attachments.cancel')}
            </Button>
            <Button type="submit" disabled={createMutation.isPending || uploadingFile}>
              {createMutation.isPending ? t('attachments.creating') : t('attachments.createAttachment')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
