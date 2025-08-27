
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
  Link as LinkIcon,
  Upload
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 relative z-10 p-3 sm:p-4 lg:p-8">
        {/* Header */}
        <div className="card p-3 sm:p-4 lg:p-8 border border-border bg-card">
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-6">
              <Button 
                variant="outline" 
                onClick={onBack} 
                size="sm"
                className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Attachments</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div>
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">
                  {t('attachments.editAttachment')}
                </h1>
                <p className="text-muted-foreground mt-1 text-xs sm:text-sm lg:text-base">
                  {t('attachments.updateAttachmentDetails')}
                </p>
              </div>
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={saving} 
              size="sm"
              className="gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              <Save className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{saving ? t('attachments.saving') : t('attachments.saveChanges')}</span>
              <span className="sm:hidden">{saving ? 'Saving...' : 'Save'}</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Basic Information */}
            <Card className="card border border-border bg-card">
              <CardHeader className="pb-3 sm:pb-4 p-3 sm:p-4 lg:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                  <Paperclip className="h-4 w-4 sm:h-5 sm:w-5 text-[hsl(var(--primary))]" />
                  {t('attachments.basicInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-3 sm:p-4 lg:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium">{t('attachments.titleLabel')}</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter attachment title"
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium">{t('attachments.typeLabel')}</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-input rounded-md bg-background text-sm sm:text-base"
                    >
                      <option value="pdf">{t('attachments.pdfFile')}</option>
                      <option value="link">{t('attachments.externalLink')}</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">{t('attachments.descriptionLabel')}</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter attachment description"
                    className="text-sm sm:text-base"
                  />
                </div>

                {formData.type === 'link' ? (
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium">{t('attachments.urlLabel')}</label>
                    <Input
                      value={formData.attachment_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, attachment_url: e.target.value }))}
                      placeholder="Enter external URL"
                      className="text-sm sm:text-base"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium">{t('attachments.fileLabel')}</label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={formData.attachment_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, attachment_url: e.target.value }))}
                        placeholder="File URL or upload new file"
                        className="text-sm sm:text-base"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                      >
                        <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Upload</span>
                        <span className="sm:hidden">Upload</span>
                      </Button>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                      className="hidden"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Attachment Info */}
            <Card className="card border border-border bg-card">
              <CardHeader className="pb-3 sm:pb-4 p-3 sm:p-4 lg:p-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                    {getAttachmentIcon(attachment.type)}
                  </div>
                  {t('attachments.attachmentInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">{t('attachments.type')}</span>
                  <Badge className={getAttachmentColor(attachment.type)}>
                    {attachment.type.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">{t('attachments.order')}</span>
                  <span className="text-xs sm:text-sm font-medium">{attachment.order_index}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">{t('attachments.created')}</span>
                  <span className="text-xs sm:text-sm font-medium">
                    {new Date(attachment.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="card border border-border bg-card">
              <CardHeader className="pb-3 sm:pb-4 p-3 sm:p-4 lg:p-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-accent-500 to-primary-500 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-black" />
                  </div>
                  {t('attachments.analytics')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">{t('attachments.totalViews')}</span>
                  <span className="text-xs sm:text-sm font-medium">{totalViews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">{t('attachments.completed')}</span>
                  <span className="text-xs sm:text-sm font-medium">{completedViews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">{t('attachments.completionRate')}</span>
                  <span className="text-xs sm:text-sm font-medium">{completionRate}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
