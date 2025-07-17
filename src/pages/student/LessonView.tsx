import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Play, CheckCircle, Clock, Eye } from 'lucide-react';
import { VoiceTutor } from '@/components/lessons/VoiceTutor';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  course_id: string;
  view_limit: number | null;
}

interface Course {
  id: string;
  title: string;
  instructor_id: string;
}

interface LessonContent {
  summary: string | null;
}

export const LessonView = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [canView, setCanView] = useState(true);

  useEffect(() => {
    if (id) {
      fetchLessonData();
      trackView();
    }
  }, [id]);

  const fetchLessonData = async () => {
    try {
      // Fetch lesson details
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single();

      if (lessonError) throw lessonError;
      setLesson(lessonData);

      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id, title, instructor_id')
        .eq('id', lessonData.course_id)
        .eq('status', 'published')
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch lesson content (summary for AI tutor)
      const { data: contentData, error: contentError } = await supabase
        .from('lesson_content')
        .select('summary')
        .eq('lesson_id', id)
        .maybeSingle();

      if (contentError) {
        console.error('Error fetching lesson content:', contentError);
      } else {
        setLessonContent(contentData);
      }

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if lesson is completed
        const { data: progressData } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('lesson_id', id)
          .eq('student_id', user.id)
          .maybeSingle();

        setIsCompleted(!!progressData);

        // Check view count for this user
        const { data: viewsData } = await supabase
          .from('lesson_views')
          .select('*')
          .eq('lesson_id', id)
          .eq('student_id', user.id);

        setViewCount(viewsData?.length || 0);

        // Check if user can still view (if there's a view limit)
        if (lessonData.view_limit && viewsData) {
          setCanView(viewsData.length < lessonData.view_limit);
        }
      }
    } catch (error: any) {
      console.error('Error fetching lesson:', error);
      toast({
        title: 'Error',
        description: 'Failed to load lesson',
        variant: 'destructive',
      });
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
            lesson_id: id,
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
          lesson_id: id,
          student_id: user.id,
        }, { onConflict: 'lesson_id,student_id' });

      if (error) throw error;

      setIsCompleted(true);
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Lesson not found</h2>
            <p className="text-muted-foreground">The lesson you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
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
            <Link to={`/courses/${course.id}`}>
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/courses/${course.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold gradient-text">{lesson.title}</h1>
          <p className="text-muted-foreground">From {course.title}</p>
        </div>
        <div className="flex items-center gap-2">
          {lesson.view_limit && (
            <Badge variant="outline">
              <Eye className="h-3 w-3 mr-1" />
              Views: {viewCount}/{lesson.view_limit}
            </Badge>
          )}
          {isCompleted && (
            <Badge className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
      </div>

      {/* AI Voice Tutor Section */}
      <VoiceTutor
        lessonTitle={lesson.title}
        lessonSummary={lessonContent?.summary || null}
        lessonId={lesson.id}
      />

      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Lesson Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {lesson.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{lesson.description}</p>
            </div>
          )}

          {lesson.video_url && (
            <div>
              <h3 className="font-semibold mb-2">Video</h3>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={lesson.video_url}
                  className="w-full h-full"
                  allowFullScreen
                  title={lesson.title}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-6 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Estimated time: ~15 minutes
            </div>
            {!isCompleted && (
              <Button onClick={markAsCompleted}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Completed
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
