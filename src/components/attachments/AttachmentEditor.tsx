
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';
import {
  ArrowLeft,
  Paperclip,
  FileText,
  BarChart3,
  Save,
  Eye,
  Link as LinkIcon
} from 'lucide-react';
import { ContentManagementSkeleton } from '@/components/ui/skeletons';

interface Attachment {
  id: string;
  title: string;
  description: string | null;
  attachment_url: string | null;
  course_id: string;
  order_index: number;
  type: string;
  size: number | null;
  created_at: string;
}

interface AttachmentView {
  id: string;
  attachment_id: string;
  student_id: string;
  viewed_at: string;
  view_duration: number;
  completed: boolean;
  device_type: string;
  student_name?: string;
  student_email?: string;
}

interface AttachmentEditorProps {
  attachmentId: string;
  onBack: () => void;
}

export const AttachmentEditor = ({ attachmentId, onBack }: AttachmentEditorProps) => {
  const { toast } = useToast();
  const { t } = useTranslation('dashboard');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [attachmentViews, setAttachmentViews] = useState<AttachmentView[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    attachment_url: '',
    type: 'pdf',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAttachment();

  }, [attachmentId]);

  const fetchAttachment = async () => {
    try {
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('id', attachmentId)
        .single();

      if (error) throw error;
      setAttachment(data);
      setFormData({
        title: data.title,
        description: data.description || '',
        attachment_url: data.attachment_url || '',
        type: data.type,
      });
    } catch (error: any) {
      console.error('Error fetching attachment:', error);
      toast({
        title: t('attachments.error'),
        description: t('attachments.failedToLoadAttachment'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: t('attachments.error'),
        description: t('attachments.pleaseEnterTitle'),
        variant: 'destructive',
      });
      return;
    }

    if (formData.type === 'link' && !formData.attachment_url.trim()) {
      toast({
        title: t('attachments.error'),
        description: t('attachments.pleaseEnterUrlForLink'),
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('attachments')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          attachment_url: formData.attachment_url.trim() || null,
          type: formData.type,
        })
        .eq('id', attachmentId);

      if (error) throw error;

      toast({
        title: t('attachments.success'),
        description: t('attachments.attachmentUpdatedSuccessfully'),
      });

      fetchAttachment();
    } catch (error: any) {
      console.error('Error updating attachment:', error);
      toast({
        title: t('attachments.error'),
        description: error.message || t('attachments.failedToUpdateAttachment'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (formData.type !== 'pdf') {
      toast({
        title: t('attachments.error'),
        description: t('attachments.fileUploadOnlyForPdf'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${attachment?.course_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course_attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course_attachments')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, attachment_url: publicUrl }));
      toast({
        title: t('attachments.success'),
        description: t('attachments.fileUploadedSuccessfully'),
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: t('attachments.error'),
        description: t('attachments.failedToUploadFile'),
        variant: 'destructive',
      });
    }
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'link':
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <Paperclip className="h-4 w-4" />;
    }
  };

  const getAttachmentColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return `bg-[hsl(var(--error)/0.1)] text-[hsl(var(--error))] border-[hsl(var(--error)/0.2)]`;
      case 'link':
        return `bg-[hsl(var(--info)/0.1)] text-[hsl(var(--info))] border-[hsl(var(--info)/0.2)]`;
      default:
        return `bg-[hsl(var(--muted-foreground)/0.1)] text-[hsl(var(--muted-foreground))] border-[hsl(var(--muted-foreground)/0.2)]`;
    }
  };

  if (loading) {
    return <ContentManagementSkeleton />;
  }

  if (!attachment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            ← {t('attachments.backToAttachments')}
          </Button>
          <h1 className="text-2xl font-bold">{t('attachments.attachmentNotFound')}</h1>
        </div>
        <p>{t('attachments.attachmentNotFoundDescription')}</p>
      </div>
    );
  }

  const totalViews = attachmentViews.length;
  const completedViews = attachmentViews.filter(view => view.completed).length;
  const completionRate = totalViews > 0 ? Math.round((completedViews / totalViews) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Attachments
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">
              {t('attachments.editAttachment')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('attachments.updateAttachmentDetails')}
            </p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? t('attachments.saving') : t('attachments.saveChanges')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                  <Paperclip className="h-5 w-5 text-[hsl(var(--primary))]" />
                  {t('attachments.basicInformation')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('attachments.titleLabel')}</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter attachment title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('attachments.typeLabel')}</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="pdf">{t('attachments.pdfFile')}</option>
                    <option value="link">{t('attachments.externalLink')}</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('attachments.descriptionLabel')}</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter attachment description"
                  rows={3}
                />
              </div>

              {formData.type === 'link' ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('attachments.urlLabel')}</label>
                  <Input
                    value={formData.attachment_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, attachment_url: e.target.value }))}
                    placeholder="https://example.com"
                    type="url"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('attachments.pdfFile')}</label>
                  <div className="flex items-center gap-4">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                    {formData.attachment_url && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(formData.attachment_url, '_blank')}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        {t('attachments.viewCurrentFile')}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Attachment Info */}
          <Card>
            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[hsl(var(--primary))]" />
                  {t('attachments.attachmentInfo')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--primary)/0.2)] to-[hsl(var(--secondary)/0.2)] border border-[hsl(var(--primary)/0.3)]">
                  {getAttachmentIcon(attachment.type)}
                </div>
                <div>
                  <h3 className="font-semibold">{attachment.title}</h3>
                  <Badge className={getAttachmentColor(attachment.type)}>
                    {attachment.type.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('attachments.created')}</span>
                  <span>{new Date(attachment.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('attachments.order')}</span>
                  <span>#{attachment.order_index}</span>
                </div>
                {attachment.size && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('attachments.fileSize')}</span>
                    <span>{Math.round(attachment.size / 1024)} KB</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>


        </div>
      </div>


    </div>
  );
};
