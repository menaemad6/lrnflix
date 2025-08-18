import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Play, CheckCircle, Clock, Eye, FileText } from 'lucide-react';
import { VoiceTutor } from '@/components/lessons/VoiceTutor';
import { SecureVideoPlayer } from '@/components/video/SecureVideoPlayer';
import { LessonContentSkeleton } from '@/components/student/skeletons';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  course_id: string;
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
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [viewCount, setViewCount] = useState(0);
  const [canView, setCanView] = useState(true);
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
        const { error } = await supabase
          .from('lesson_views')
          .insert({
            lesson_id: lesson.id,
            student_id: user.id,
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
          title: 'Error',
          description: 'You must be logged in to mark lessons as completed',
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
        title: 'Success',
        description: 'Lesson marked as completed!',
      });
    } catch (error: any) {
      console.error('Error marking lesson complete:', error);
      toast({
        title: 'Error',
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
            <h2 className="text-xl font-semibold mb-2">View Limit Reached</h2>
            <p className="text-muted-foreground">
              You have reached the maximum number of views ({lesson.view_limit}) for this lesson.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto py-6 space-y-8">
        {/* Premium Lesson Header */}
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
              {/* Left Side - Lesson Info */}
              <div className="flex-1 space-y-6">
                {/* Lesson Title */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg border border-border/50">
                        <Play className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                        {lesson.title}
                      </h1>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-sm text-muted-foreground">From</span>
                        <Badge variant="secondary" className="px-4 py-2 bg-gradient-to-r from-primary/20 to-primary/30 border-primary/30">
                          {course.title}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lesson Description */}
                {lesson.description && (
                  <div className="p-6 bg-card/50 backdrop-blur-sm border-border/50 rounded-xl">
                    <p className="text-foreground leading-relaxed text-lg">{lesson.description}</p>
                  </div>
                )}
              </div>

              {/* Right Side - Status & Actions */}
              <div className="flex flex-col gap-6 lg:items-end">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-3">
                  {lesson.view_limit && (
                    <Badge variant="default" className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span className="font-medium">Views: {viewCount}/{lesson.view_limit}</span>
                      </div>
                    </Badge>
                  )}
                  {isCompleted && (
                                       <Badge variant="default" className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Completed</span>
                      </div>
                    </Badge>
                  )}
                </div>

                {/* Action Button */}
                {!isCompleted && (
                  <Button 
                    onClick={markAsCompleted} 
                    size="lg"
                    className="px-8 py-3 bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl font-semibold text-lg hover:scale-105"
                  >
                    <CheckCircle className="h-5 w-5 mr-3" />
                    Mark as Completed
                  </Button>
                )}
              </div>
            </div>

            {/* Lesson Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-border/50">
              {/* Estimated Time */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/30 rounded-xl flex items-center justify-center shadow-lg border border-primary/30">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-lg">
                        {lesson.duration_minutes ? `~${lesson.duration_minutes} minutes` : '~15 minutes'}
                      </div>
                      <div className="text-sm text-muted-foreground">Estimated time</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* View Status */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/30 rounded-xl flex items-center justify-center shadow-lg border border-primary/30">
                      <Eye className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-lg">
                        {lesson.view_limit ? `${viewCount}/${lesson.view_limit}` : 'Unlimited'}
                      </div>
                      <div className="text-sm text-muted-foreground">View limit</div>
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
            <div className="relative z-10 p-8">
              {/* Video Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg border border-border/50">
                    <Play className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Lesson Video</h2>
                  <p className="text-muted-foreground">Watch the instructional content</p>
                </div>
              </div>

              {/* Secure Video Player */}
              <div className="relative">
                <SecureVideoPlayer 
                  lessonId={lesson.id}
                  className="w-full aspect-video shadow-2xl rounded-2xl overflow-hidden"
                />
                
                {/* Subtle Video Overlay Effects */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl"></div>
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
