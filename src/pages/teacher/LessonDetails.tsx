import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Edit, Trash2, Save, Eye, Users, BarChart3, FileText } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  course_id: string;
  view_limit: number | null;
  order_index: number;
}

interface Course {
  id: string;
  title: string;
}

interface LessonView {
  id: string;
  student_id: string;
  viewed_at: string;
  view_duration: number;
  completed: boolean;
  student_name?: string;
  student_email?: string;
}

interface LessonContent {
  id: string;
  lesson_id: string;
  transcription: string | null;
  summary: string | null;
  is_transcribed: boolean;
  created_at: string;
  updated_at: string;
}

export const LessonDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessonViews, setLessonViews] = useState<LessonView[]>([]);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    video_url: '',
    view_limit: ''
  });
  const [contentForm, setContentForm] = useState({
    transcription: '',
    summary: '',
    is_transcribed: false
  });

  useEffect(() => {
    if (id) {
      fetchLessonData();
      fetchLessonAnalytics();
      fetchLessonContent();
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

      // Set form data
      setEditForm({
        title: lessonData.title,
        description: lessonData.description || '',
        video_url: lessonData.video_url || '',
        view_limit: lessonData.view_limit?.toString() || ''
      });

      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id, title')
        .eq('id', lessonData.course_id)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);
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

  const fetchLessonContent = async () => {
    try {
      const { data, error } = await supabase
        .from('lesson_content')
        .select('*')
        .eq('lesson_id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setLessonContent(data);
        setContentForm({
          transcription: data.transcription || '',
          summary: data.summary || '',
          is_transcribed: data.is_transcribed
        });
      } else {
        // Initialize with empty content
        setContentForm({
          transcription: '',
          summary: '',
          is_transcribed: false
        });
      }
    } catch (error: any) {
      console.error('Error fetching lesson content:', error);
    }
  };

  const saveContentData = async () => {
    try {
      if (lessonContent) {
        // Update existing content
        const { error } = await supabase
          .from('lesson_content')
          .update({
            transcription: contentForm.transcription || null,
            summary: contentForm.summary || null,
            is_transcribed: contentForm.is_transcribed
          })
          .eq('id', lessonContent.id);

        if (error) throw error;
      } else {
        // Create new content
        const { data, error } = await supabase
          .from('lesson_content')
          .insert({
            lesson_id: id!,
            transcription: contentForm.transcription || null,
            summary: contentForm.summary || null,
            is_transcribed: contentForm.is_transcribed
          })
          .select()
          .single();

        if (error) throw error;
        setLessonContent(data);
      }

      toast({
        title: 'Success',
        description: 'Lesson content saved successfully!',
      });
    } catch (error: any) {
      console.error('Error saving content:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchLessonAnalytics = async () => {
    try {
      // First get lesson views
      const { data: viewsData, error: viewsError } = await supabase
        .from('lesson_views')
        .select('*')
        .eq('lesson_id', id)
        .order('viewed_at', { ascending: false });

      if (viewsError) throw viewsError;

      // Then get student profiles for those views
      if (viewsData && viewsData.length > 0) {
        const studentIds = [...new Set(viewsData.map(view => view.student_id))];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', studentIds);

        if (profilesError) throw profilesError;

        // Combine the data
        const enrichedViews = viewsData.map(view => {
          const profile = profilesData?.find(p => p.id === view.student_id);
          return {
            ...view,
            student_name: profile?.full_name || 'Unknown Student',
            student_email: profile?.email || ''
          };
        });

        setLessonViews(enrichedViews);
      } else {
        setLessonViews([]);
      }
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      setLessonViews([]);
    }
  };

  const updateLesson = async () => {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({
          title: editForm.title,
          description: editForm.description || null,
          video_url: editForm.video_url || null,
          view_limit: editForm.view_limit ? parseInt(editForm.view_limit) : null
        })
        .eq('id', id);

      if (error) throw error;

      setLesson(prev => prev ? {
        ...prev,
        title: editForm.title,
        description: editForm.description || null,
        video_url: editForm.video_url || null,
        view_limit: editForm.view_limit ? parseInt(editForm.view_limit) : null
      } : null);

      setEditing(false);
      toast({
        title: 'Success',
        description: 'Lesson updated successfully!',
      });
    } catch (error: any) {
      console.error('Error updating lesson:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteLesson = async () => {
    if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Lesson deleted successfully!',
      });

      navigate(`/teacher/courses/${course?.id}`);
    } catch (error: any) {
      console.error('Error deleting lesson:', error);
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

  const uniqueStudents = new Set(lessonViews.map(view => view.student_id)).size;
  const totalViews = lessonViews.length;
  const avgViewDuration = lessonViews.length > 0 
    ? lessonViews.reduce((sum, view) => sum + view.view_duration, 0) / lessonViews.length 
    : 0;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/teacher/courses/${course.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold gradient-text">{lesson.title}</h1>
          <p className="text-muted-foreground">From {course.title}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setEditing(!editing)}
          >
            <Edit className="h-4 w-4 mr-2" />
            {editing ? 'Cancel' : 'Edit'}
          </Button>
          <Button
            variant="destructive"
            onClick={deleteLesson}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueStudents}</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg View Duration</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgViewDuration)}s</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="transcription">AI Content</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Lesson Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Lesson title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Lesson description"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Video URL</label>
                    <Input
                      value={editForm.video_url}
                      onChange={(e) => setEditForm(prev => ({ ...prev, video_url: e.target.value }))}
                      placeholder="YouTube, Vimeo, etc."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">View Limit</label>
                    <Input
                      type="number"
                      value={editForm.view_limit}
                      onChange={(e) => setEditForm(prev => ({ ...prev, view_limit: e.target.value }))}
                      placeholder="Leave empty for unlimited views"
                    />
                  </div>
                  <Button onClick={updateLesson}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">
                      {lesson.description || 'No description provided'}
                    </p>
                  </div>

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

                  <div className="flex items-center gap-4 pt-4 border-t">
                    <Badge variant="outline">
                      Order: {lesson.order_index}
                    </Badge>
                    {lesson.view_limit && (
                      <Badge variant="outline">
                        View Limit: {lesson.view_limit}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transcription">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  AI Content Management
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={contentForm.is_transcribed}
                    onCheckedChange={(checked) => 
                      setContentForm(prev => ({ ...prev, is_transcribed: checked }))
                    }
                  />
                  <span className="text-sm">Transcribed</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Transcription</label>
                <Textarea
                  value={contentForm.transcription}
                  onChange={(e) => setContentForm(prev => ({ ...prev, transcription: e.target.value }))}
                  placeholder="Enter the lesson transcription here..."
                  rows={8}
                  className="min-h-[200px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This transcription will be used by AI assistants to answer student questions about the lesson.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Summary</label>
                <Textarea
                  value={contentForm.summary}
                  onChange={(e) => setContentForm(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Enter a summary of the lesson content..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  A concise summary of the key points covered in this lesson.
                </p>
              </div>

              <Button onClick={saveContentData} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save AI Content
              </Button>

              {lessonContent && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date(lessonContent.updated_at).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>View Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lessonViews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No views recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {lessonViews.map((view) => (
                      <div key={view.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">
                            {view.student_name || 'Unknown Student'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {view.student_email}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {new Date(view.viewed_at).toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Duration: {view.view_duration}s
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
