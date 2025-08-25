import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { CheckCircle, FileText, Link as LinkIcon, ExternalLink, Download } from 'lucide-react';

interface Attachment {
  id: string;
  title: string;
  description: string | null;
  attachment_url: string | null;
  type: string;
  order_index: number;
  course_id: string;
  size: number | null;
}

interface Course {
  id: string;
  title: string;
  profiles?: {
    full_name: string;
  };
}

interface AttachmentContentProps {
  attachment: Attachment;
  course: Course;
  isCompleted: boolean;
  onAttachmentComplete: (attachmentId: string) => void;
  onBackToCourse: () => void;
}

export const AttachmentContent = ({ attachment, course, isCompleted, onAttachmentComplete, onBackToCourse }: AttachmentContentProps) => {
  const { toast } = useToast();
  const { t } = useTranslation('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [attachment.id]);



  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return t('attachments.unknownSize');
    const sizes = [t('attachments.bytes'), t('attachments.kb'), t('attachments.mb'), t('attachments.gb')];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-6 space-y-8">
          <Card className="relative overflow-hidden border bg-gradient-to-br from-background via-background to-muted/20 shadow-xl">
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }



  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto py-6 space-y-8">
        {/* Premium Attachment Header */}
        <Card className="relative overflow-hidden border bg-gradient-to-br from-background via-background to-muted/20 shadow-xl">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          {/* Content */}
          <div className="relative z-10 p-8">
            {/* Header Row */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-8">
              {/* Left Side - Attachment Info */}
              <div className="flex-1 space-y-6">
                {/* Attachment Title */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg border border-border/50">
                        {attachment.type === 'pdf' ? (
                          <FileText className="h-8 w-8 text-primary-foreground" />
                        ) : (
                          <LinkIcon className="h-8 w-8 text-primary-foreground" />
                        )}
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                        {attachment.title}
                      </h1>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-sm text-muted-foreground">{t('attachments.from')}</span>
                        <Badge variant="default" className="px-4 py-2 bg-gradient-to-r from-primary/20 to-primary/30 border-primary/30">
                          {course.title}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attachment Description */}
                {attachment.description && (
                  <div className="p-6 bg-card/50 backdrop-blur-sm border-border/50 rounded-xl">
                    <p className="text-foreground leading-relaxed text-lg">{attachment.description}</p>
                  </div>
                )}
              </div>

              {/* Right Side - Status & Actions */}
              <div className="flex flex-col gap-6 lg:items-end">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-3">
                  {isCompleted && (
                    <Badge variant="default" className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>{t('attachments.completed')}</span>
                      </div>
                    </Badge>
                  )}
                </div>


              </div>
            </div>

            {/* Attachment Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 pt-8 border-t border-border/50">
              {/* Type */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/30 rounded-xl flex items-center justify-center shadow-lg border border-primary/30">
                      {attachment.type === 'pdf' ? (
                        <FileText className="h-6 w-6 text-primary" />
                      ) : (
                        <LinkIcon className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-lg">
                        {attachment.type === 'pdf' ? t('attachments.pdfDocument') : t('attachments.externalLink')}
                      </div>
                      <div className="text-sm text-muted-foreground">{t('attachments.type')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Card>

        {/* Attachment Content Section */}
        <Card className="relative overflow-hidden border bg-gradient-to-br from-background via-background to-muted/20 shadow-xl">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Content */}
          <div className="relative z-10 p-8">
            {/* Content Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg border border-border/50">
                  {attachment.type === 'pdf' ? (
                    <FileText className="h-6 w-6 text-primary-foreground" />
                  ) : (
                    <LinkIcon className="h-6 w-6 text-primary-foreground" />
                  )}
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {attachment.type === 'pdf' ? t('attachments.pdfDocument') : t('attachments.externalResource')}
                </h2>
                <p className="text-muted-foreground">
                  {attachment.type === 'pdf' ? t('attachments.viewAndDownloadPdf') : t('attachments.accessExternalResource')}
                </p>
              </div>
            </div>

            {/* PDF Viewer */}
            {attachment.type === 'pdf' && attachment.attachment_url && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {attachment.size && formatFileSize(attachment.size)}
                    </span>
                  </div>
                  <Button
                    onClick={() => window.open(attachment.attachment_url, '_blank')}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {t('attachments.downloadPdf')}
                  </Button>
                </div>
                
                <div className="relative">
                  <iframe
                    src={attachment.attachment_url}
                    className="w-full h-[600px] border border-border rounded-xl shadow-lg"
                    title={attachment.title}
                  />
                  
                  {/* Subtle PDF Overlay Effects */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl"></div>
                  </div>
                </div>
              </div>
            )}

            {/* External Link */}
            {attachment.type === 'link' && attachment.attachment_url && (
              <div className="space-y-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/30 rounded-xl flex items-center justify-center shadow-lg border border-primary/30">
                        <LinkIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{t('attachments.externalResource')}</h3>
                          <p className="text-muted-foreground text-sm">
                            {t('attachments.externalResourceDescription')}
                          </p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                          <div className="flex items-center gap-2 mb-2">
                            <ExternalLink className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">{t('attachments.url')}</span>
                          </div>
                          <p className="text-sm text-muted-foreground break-all">
                            {attachment.attachment_url}
                          </p>
                        </div>
                        <Button
                          onClick={() => window.open(attachment.attachment_url, '_blank')}
                          size="lg"
                          className="w-full bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-semibold hover:scale-105"
                        >
                          <ExternalLink className="h-5 w-5 mr-3" />
                          {t('attachments.openExternalResource')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
