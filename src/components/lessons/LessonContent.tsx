import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Play, CheckCircle, Clock, Eye, FileText, Smartphone } from 'lucide-react';
import { detectDeviceType, getDetailedDeviceFingerprint } from '@/utils/deviceDetection';
import { VoiceTutor } from '@/components/lessons/VoiceTutor';
import { SecureVideoPlayer } from '@/components/video/SecureVideoPlayer';
import { LessonContentSkeleton } from '@/components/student/skeletons';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  course_id: string;
  device_limit: number | null;
  view_limit: number | null;
  duration_minutes: number | null;
}

interface Course {
  id: string;
  title: string;
  profiles?: {
    full_name: string;
  };
}

interface LessonContent {
  summary: string | null;
}

interface LessonContentProps {
  lesson: Lesson;
  course: Course;
  isCompleted: boolean;
  onLessonComplete: (lessonId: string) => void;
  onBackToCourse: () => void;
}

const extractYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

const getEmbedUrl = (url: string): string => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }
  return url;
};

export const LessonContent = ({ lesson, course, isCompleted, onLessonComplete, onBackToCourse }: LessonContentProps) => {
  const { toast } = useToast();
  const { t } = useTranslation('courses');
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [viewCount, setViewCount] = useState(0);
  const [deviceCount, setDeviceCount] = useState(0);
  const [canView, setCanView] = useState(true);
  const [canViewOnDevice, setCanViewOnDevice] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessonData();
    trackView();
  }, [lesson.id]);

  const fetchLessonData = async () => {
    try {
      // Fetch lesson content (summary for AI tutor)
      const { data: contentData, error: contentError } = await supabase
        .from('lesson_content')
        .select('summary')
        .eq('lesson_id', lesson.id)
        .maybeSingle();

      if (contentError) {
        console.error('Error fetching lesson content:', contentError);
      } else {
        setLessonContent(contentData);
      }

      // Check view count for this user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: viewsData } = await supabase
          .from('lesson_views')
          .select('*')
          .eq('lesson_id', lesson.id)
          .eq('student_id', user.id);

        setViewCount(viewsData?.length || 0);

        // Check if user can still view (if there's a view limit)
        if (lesson.view_limit && viewsData) {
          setCanView(viewsData.length < lesson.view_limit);
        }

        // Check device count for this user
        const { data: deviceViewsData } = await supabase
          .from('lesson_views')
          .select('device_type')
          .eq('lesson_id', lesson.id)
          .eq('student_id', user.id);

        if (deviceViewsData) {
          // Count unique devices based on detailed device fingerprints
          const uniqueDevices = new Set(deviceViewsData.map(view => view.device_type));
          setDeviceCount(uniqueDevices.size);

          // Check if user can still view on this device type (if there's a device limit)
          if (lesson.device_limit) {
            setCanViewOnDevice(uniqueDevices.size < lesson.device_limit);
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching lesson data:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackView = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get detailed device fingerprint for unique device identification
        const deviceFingerprint = getDetailedDeviceFingerprint();
        
        const { error } = await supabase
          .from('lesson_views')
          .insert({
            lesson_id: lesson.id,
            student_id: user.id,
            device_type: deviceFingerprint,
          });

        if (error) {
          console.error('Error tracking view:', error);
        }
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const markAsCompleted = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('lessonContent.error'),
          description: t('lessonContent.mustBeLoggedIn'),
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          lesson_id: lesson.id,
          student_id: user.id,
        }, { onConflict: 'lesson_id,student_id' });

      if (error) throw error;

      onLessonComplete(lesson.id);
      toast({
        title: t('lessonContent.success'),
        description: t('lessonContent.lessonCompleted'),
      });
    } catch (error: any) {
      console.error('Error marking lesson complete:', error);
      toast({
        title: t('lessonContent.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <LessonContentSkeleton onBackToCourse={onBackToCourse} />;
  }

  if (lesson.view_limit && !canView) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">{t('lessonContent.viewLimitReached')}</h2>
            <p className="text-muted-foreground">
              {t('lessonContent.viewLimitDescription')} ({lesson.view_limit})
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (lesson.device_limit && !canViewOnDevice) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">{t('lessonContent.deviceLimitReached')}</h2>
            <p className="text-muted-foreground">
              {t('lessonContent.deviceLimitDescription')} ({lesson.device_limit})
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto mt-4 sm:mt-0">
      <div className="container mx-auto py-2 sm:py-4 md:py-6 space-y-4 sm:space-y-6 md:space-y-8 px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Premium Lesson Header */}
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
              {/* Left Side - Lesson Info */}
              <div className="flex-1 space-y-3 sm:space-y-4 md:space-y-6">
                {/* Lesson Title */}
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                                                       <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary to-primary/80 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg border border-border/50">
                        <Play className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary-foreground" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-3 md:w-3 text-white" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-xl  sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground leading-tight">
                        {lesson.title}
                      </h1>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3  sm:mt-3">
                        <span className="text-xs sm:text-sm text-muted-foreground">{t('lessonContent.from')}</span>
                        <Badge variant="default" className="px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 bg-gradient-to-r from-primary/20 to-primary/30 border-primary/30 text-xs sm:text-sm">
                          {course.title}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lesson Description */}
                {lesson.description && (
                  <div className="p-3 sm:p-4 md:p-6 bg-card/50 backdrop-blur-sm border-border/50 rounded-lg sm:rounded-xl">
                    <p className="text-foreground leading-relaxed text-sm sm:text-base md:text-lg">{lesson.description}</p>
                  </div>
                )}
              </div>

              {/* Right Side - Status & Actions */}
              <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 lg:items-end">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {lesson.view_limit && (
                    <Badge variant="default" className="px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="font-medium text-xs sm:text-sm">Views: {viewCount}/{lesson.view_limit}</span>
                      </div>
                    </Badge>
                  )}
                  {lesson.device_limit && (
                    <Badge variant="default" className="px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Smartphone className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="font-medium text-xs sm:text-sm">Devices: {deviceCount}/{lesson.device_limit}</span>
                      </div>
                    </Badge>
                  )}
                  {isCompleted && (
                    <Badge variant="default" className="px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">{t('lessonContent.completed')}</span>
                      </div>
                    </Badge>
                  )}
                </div>

                {/* Action Button */}
                {!isCompleted && (
                  <Button 
                    onClick={markAsCompleted} 
                    size="lg"
                    className="px-4 py-2 sm:px-6 sm:py-2 md:px-8 md:py-3 bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base md:text-lg hover:scale-105"
                  >
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2 md:mr-3" />
                    <span className="text-xs sm:text-sm md:text-base">{t('lessonContent.markAsCompleted')}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Lesson Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 pt-4 sm:pt-6 md:pt-8 border-t border-border/50">
              {/* Estimated Time */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary/20 to-primary/30 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg border border-primary/30 flex-shrink-0">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-foreground text-sm sm:text-base md:text-lg">
                        {lesson.duration_minutes ? `~${lesson.duration_minutes} ${t('lessonContent.minutes')}` : `~15 ${t('lessonContent.minutes')}`}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{t('lessonContent.estimatedTime')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* View Status */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary/20 to-primary/30 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg border border-primary/30 flex-shrink-0">
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-foreground text-sm sm:text-base md:text-lg">
                        {lesson.view_limit ? `${viewCount}/${lesson.view_limit}` : t('lessonContent.unlimited')}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{t('lessonContent.viewLimit')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Device Status */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300 sm:col-span-2 lg:col-span-1">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary/20 to-primary/30 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg border border-primary/30 flex-shrink-0">
                      <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-foreground text-sm sm:text-base md:text-lg">
                        {lesson.device_limit ? `${deviceCount}/${lesson.device_limit}` : t('lessonContent.unlimited')}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{t('lessonContent.deviceLimit')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Card>

        {/* Secure Video Section */}
        {lesson.video_url && (
          <Card className="relative overflow-hidden border bg-gradient-to-br from-background via-background to-muted/20 shadow-xl">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Content */}
            <div className="relative z-10 p-3 sm:p-4 md:p-6 lg:p-8">
              {/* Video Header */}
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-primary/80 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg border border-border/50">
                    <Play className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{t('lessonContent.lessonVideo')}</h2>
                  <p className="text-muted-foreground text-xs sm:text-sm md:text-base">{t('lessonContent.watchInstructional')}</p>
                </div>
              </div>

              {/* Secure Video Player */}
              <div className="relative">
                <SecureVideoPlayer 
                  lessonId={lesson.id}
                  className="w-full aspect-video shadow-2xl rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden"
                />
                
                {/* Subtle Video Overlay Effects */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute bottom-0 right-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl"></div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* AI Voice Tutor Section */}
        <VoiceTutor
          lessonTitle={lesson.title}
          lessonSummary={lessonContent?.summary || null}
          lessonId={lesson.id}
        />
      </div>
    </div>
  );
};
