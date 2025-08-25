
import React, { useState, useRef } from 'react';
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<string>('pdf');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [viewLimit, setViewLimit] = useState('');
  const [deviceLimit, setDeviceLimit] = useState('');
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
          view_limit: data.view_limit ? parseInt(data.view_limit) : null,
          device_limit: data.device_limit ? parseInt(data.device_limit) : null,
          size: data.size || null
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Attachment created successfully');
      onAttachmentCreated();
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating attachment:', error);
      toast.error('Failed to create attachment');
    }
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('pdf');
    setAttachmentUrl('');
    setViewLimit('');
    setDeviceLimit('');
  };

  const handleFileUpload = async (file: File) => {
    if (type !== 'pdf') {
      toast.error('File upload is only available for PDF type');
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
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (type === 'link' && !attachmentUrl.trim()) {
      toast.error('Please enter a URL for link type');
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      type,
      attachment_url: attachmentUrl.trim(),
      view_limit: viewLimit,
      device_limit: deviceLimit,
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
          <DialogTitle>Add New Attachment</DialogTitle>
          <DialogDescription>
            Add a PDF file or external link as a course attachment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter attachment title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter attachment description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select attachment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    PDF File
                  </div>
                </SelectItem>
                <SelectItem value="link">
                  <div className="flex items-center">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    External Link
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === 'pdf' && (
            <div className="space-y-2">
              <Label>PDF File</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingFile ? 'Uploading...' : 'Upload PDF'}
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
                  File uploaded: {attachmentUrl.split('/').pop()}
                </p>
              )}
            </div>
          )}

          {type === 'link' && (
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                type="url"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="https://example.com"
                required={type === 'link'}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="viewLimit">View Limit</Label>
              <Input
                id="viewLimit"
                type="number"
                min="1"
                value={viewLimit}
                onChange={(e) => setViewLimit(e.target.value)}
                placeholder="Unlimited"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceLimit">Device Limit</Label>
              <Input
                id="deviceLimit"
                type="number"
                min="1"
                value={deviceLimit}
                onChange={(e) => setDeviceLimit(e.target.value)}
                placeholder="Unlimited"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || uploadingFile}>
              {createMutation.isPending ? 'Creating...' : 'Create Attachment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
