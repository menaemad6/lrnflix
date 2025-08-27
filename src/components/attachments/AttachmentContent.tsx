import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { CheckCircle, FileText, Link as LinkIcon, ExternalLink, Download } from 'lucide-react';
import { LessonContentSkeleton } from '../student/skeletons';

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
    return <LessonContentSkeleton onBackToCourse={onBackToCourse} />;
  }

  return (
    <div className="flex-1 overflow-auto mt-4 sm:mt-0">
      <div className="container mx-auto py-2 sm:py-4 md:py-6 space-y-4 sm:space-y-6 md:space-y-8 px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Premium Attachment Header */}
        <Card className="relative overflow-hidden border bg-gradient-to-br from-background via-background to-muted/20 shadow-xl">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          {/* Content */}
          <div className="relative z-10 p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Header Row */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-6 md:mb-8">
              {/* Left Side - Attachment Info */}
              <div className="flex-1 space-y-3 sm:space-y-4 md:space-y-6">
                {/* Attachment Title */}
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary to-primary/80 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg border border-border/50">
                        {attachment.type === 'pdf' ? (
                          <FileText className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary-foreground" />
                        ) : (
                          <LinkIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary-foreground" />
                        )}
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-3 md:w-3 text-white" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground leading-tight">
                        {attachment.title}
                      </h1>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                        <span className="text-xs sm:text-sm text-muted-foreground">{t('attachments.from')}</span>
                        <Badge variant="default" className="px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 bg-gradient-to-r from-primary/20 to-primary/30 border-primary/30 text-xs sm:text-sm">
                          {course.title}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attachment Description */}
                {attachment.description && (
                  <div className="p-3 sm:p-4 md:p-6 bg-card/50 backdrop-blur-sm border-border/50 rounded-lg sm:rounded-xl">
                    <p className="text-foreground leading-relaxed text-sm sm:text-base md:text-lg">{attachment.description}</p>
                  </div>
                )}
              </div>

              {/* Right Side - Status & Actions */}
              <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 lg:items-end">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {isCompleted && (
                    <Badge variant="default" className="px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">{t('attachments.completed')}</span>
                      </div>
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Attachment Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 pt-4 sm:pt-6 md:pt-8 border-t border-border/50">
              {/* Type */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary/20 to-primary/30 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg border border-primary/30 flex-shrink-0">
                      {attachment.type === 'pdf' ? (
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                      ) : (
                        <LinkIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-foreground text-sm sm:text-base md:text-lg">
                        {attachment.type === 'pdf' ? t('attachments.pdfDocument') : t('attachments.externalLink')}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{t('attachments.type')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* File Size - Only show for PDFs */}
              {attachment.type === 'pdf' && (
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary/20 to-primary/30 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg border border-primary/30 flex-shrink-0">
                        <Download className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-foreground text-sm sm:text-base md:text-lg">
                          {attachment.size ? formatFileSize(attachment.size) : t('attachments.unknownSize')}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">{t('attachments.fileSize')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Index */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300 sm:col-span-2 lg:col-span-1">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary/20 to-primary/30 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg border border-primary/30 flex-shrink-0">
                      <span className="text-xs sm:text-sm md:text-base font-bold text-primary">{attachment.order_index}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-foreground text-sm sm:text-base md:text-lg">
                        {t('attachments.order')} #{attachment.order_index}
                      </div>
                      
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
          <div className="relative z-10 p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Content Header */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-primary/80 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg border border-border/50">
                  {attachment.type === 'pdf' ? (
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary-foreground" />
                  ) : (
                    <LinkIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary-foreground" />
                  )}
                </div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                  {attachment.type === 'pdf' ? t('attachments.pdfDocument') : t('attachments.externalResource')}
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
                  {attachment.type === 'pdf' ? t('attachments.viewAndDownloadPdf') : t('attachments.accessExternalResource')}
                </p>
              </div>
            </div>

            {/* PDF Viewer */}
            {attachment.type === 'pdf' && attachment.attachment_url && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {attachment.size && formatFileSize(attachment.size)}
                    </span>
                  </div>
                  <Button
                    onClick={() => window.open(attachment.attachment_url, '_blank')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto"
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">{t('attachments.downloadPdf')}</span>
                  </Button>
                </div>
                
                <div className="relative">
                  <iframe
                    src={attachment.attachment_url}
                    className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] border border-border rounded-lg sm:rounded-xl shadow-lg"
                    title={attachment.title}
                  />
                  
                  {/* Subtle PDF Overlay Effects */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute bottom-0 right-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl"></div>
                  </div>
                </div>
              </div>
            )}

            {/* External Link */}
            {attachment.type === 'link' && attachment.attachment_url && (
              <div className="space-y-4 sm:space-y-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/20 to-primary/30 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg border border-primary/30 flex-shrink-0">
                        <LinkIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-semibold text-base sm:text-lg text-foreground">{t('attachments.externalResource')}</h3>
                          <p className="text-muted-foreground text-xs sm:text-sm">
                            {t('attachments.externalResourceDescription')}
                          </p>
                        </div>
                        <div className="p-3 sm:p-4 bg-muted/30 rounded-lg sm:rounded-xl border border-border/50">
                          <div className="flex items-center gap-2 mb-2">
                            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                            <span className="text-xs sm:text-sm font-medium text-foreground">{t('attachments.url')}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground break-all">
                            {attachment.attachment_url}
                          </p>
                        </div>
                        <Button
                          onClick={() => window.open(attachment.attachment_url, '_blank')}
                          size="lg"
                          className="w-full bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg sm:rounded-xl font-semibold hover:scale-105 text-sm sm:text-base md:text-lg"
                        >
                          <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                          <span className="text-xs sm:text-sm md:text-base">{t('attachments.openExternalResource')}</span>
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
