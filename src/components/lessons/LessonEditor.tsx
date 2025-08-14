import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Video,
  FileText,
  BarChart3,
  Save,
  Eye,
  Clock,
  Users,
  Play,
  Brain,
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  Upload
} from 'lucide-react';
import { usePdfAi } from '@/hooks/usePdfAi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  course_id: string;
  order_index: number;
  view_limit: number | null;
  created_at: string;
  duration_minutes?: number;
}

interface LessonContent {
  id: string;
  lesson_id: string;
  transcription: string | null;
  summary: string | null;
  is_transcribed: boolean;
}

interface LessonView {
  id: string;
  lesson_id: string;
  student_id: string;
  viewed_at: string;
  view_duration: number;
  completed: boolean;
  student_name?: string;
  student_email?: string;
}

interface LessonEditorProps {
  lessonId: string;
  onBack: () => void;
}

export const LessonEditor = ({ lessonId, onBack }: LessonEditorProps) => {
  const { toast } = useToast();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [lessonViews, setLessonViews] = useState<LessonView[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    view_limit: '',
    duration_minutes: '',
  });
  const [contentData, setContentData] = useState({
    transcription: '',
    summary: '',
  });

  // AI: extract course info from slides PDF and synthesize a lesson summary
  const { process: processCourseInfo, loading: aiLoading } = usePdfAi('extract-course-info');

  const handleSlidesPdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast({ title: 'Invalid file', description: 'Please upload a PDF.', variant: 'destructive' });
      return;
    }
    try {
      const res = await processCourseInfo({ pdfFile: file });
      if (!res.success) {
        toast({ title: 'AI extraction failed', description: res.error || 'Could not extract course info', variant: 'destructive' });
        return;
      }
      const info = res.data as any;
      const course = info?.course ?? info;
      // Build a descriptive summary ONLY (no title or outline)
      const desc = (course?.description ?? '').trim();
      const chapters = Array.isArray(course?.chapters) ? course.chapters : [];
      let summaryText = desc;
      if (!summaryText) {
        const topics = chapters.map((ch: any) => (ch?.title ? String(ch.title) : '')).filter(Boolean);
        if (topics.length > 0) {
          summaryText = `This lesson provides an overview of ${topics.join(', ')}.`;
        }
      }
      setContentData(prev => ({ ...prev, summary: summaryText || prev.summary }));
      toast({ title: 'Summary generated', description: 'AI summary inserted from slides.' });
      event.target.value = '';
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to process PDF', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchLessonData();
  }, [lessonId]);

  const fetchLessonData = async () => {
    try {
      // Fetch lesson details
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (lessonError) throw lessonError;
      setLesson(lessonData);
      setFormData({
        title: lessonData.title || '',
        description: lessonData.description || '',
        video_url: lessonData.video_url || '',
        view_limit: lessonData.view_limit?.toString() || '',
        duration_minutes: lessonData.duration_minutes?.toString() || '',
      });

      // Fetch lesson content
      const { data: contentData, error: contentError } = await supabase
        .from('lesson_content')
        .select('*')
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (contentError && contentError.code !== 'PGRST116') throw contentError;
      setLessonContent(contentData);
      setContentData({
        transcription: contentData?.transcription || '',
        summary: contentData?.summary || '',
      });

      // Fetch lesson views with student profiles
      const { data: viewsData, error: viewsError } = await supabase
        .from('lesson_views')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('viewed_at', { ascending: false });

      if (viewsError) throw viewsError;

      // Fetch student profiles separately to avoid relation issues
      const studentIds = viewsData?.map(view => view.student_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', studentIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const viewsWithProfiles = (viewsData || []).map(view => ({
        ...view,
        student_name: profilesData?.find(p => p.id === view.student_id)?.full_name || 'Unknown Student',
        student_email: profilesData?.find(p => p.id === view.student_id)?.email || 'N/A'
      }));

      setLessonViews(viewsWithProfiles);
    } catch (error: any) {
      console.error('Error fetching lesson data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load lesson data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update lesson
      const { error: lessonError } = await supabase
        .from('lessons')
        .update({
          title: formData.title,
          description: formData.description || null,
          video_url: formData.video_url || null,
          view_limit: formData.view_limit ? parseInt(formData.view_limit) : null,
          duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        })
        .eq('id', lessonId);

      if (lessonError) throw lessonError;

      // Update or create lesson content
      if (lessonContent) {
        const { error: contentError } = await supabase
          .from('lesson_content')
          .update({
            transcription: contentData.transcription || null,
            summary: contentData.summary || null,
          })
          .eq('lesson_id', lessonId);

        if (contentError) throw contentError;
      } else if (contentData.transcription || contentData.summary) {
        const { error: contentError } = await supabase
          .from('lesson_content')
          .insert({
            lesson_id: lessonId,
            transcription: contentData.transcription || null,
            summary: contentData.summary || null,
          });

        if (contentError) throw contentError;
      }

      toast({
        title: 'Success',
        description: 'Lesson updated successfully',
      });

      fetchLessonData();
    } catch (error: any) {
      console.error('Error updating lesson:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const extractYouTubeId = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const prepareChartData = () => {
    const dailyViews = lessonViews.reduce((acc, view) => {
      const date = new Date(view.viewed_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyViews).map(([date, views]) => ({
      date,
      views,
    }));
  };

  const prepareCompletionData = () => {
    const completed = lessonViews.filter(view => view.completed).length;
    const incomplete = lessonViews.length - completed;
    
    return [
      { name: 'Completed', value: completed, color: '#10b981' },
      { name: 'In Progress', value: incomplete, color: '#f59e0b' }
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Lesson not found</p>
      </div>
    );
  }

  const chartData = prepareChartData();
  const completionData = prepareCompletionData();
  const youtubeId = extractYouTubeId(formData.video_url);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="space-y-6 sm:space-y-8 relative z-10 p-4 sm:p-8">
        {/* Header */}
        <div className="card p-4 sm:p-8 border border-border bg-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-6">
              <Button 
                variant="outline" 
                onClick={onBack}
                className="bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-emerald-300 backdrop-blur-sm transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Edit Lesson
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">Customize your lesson content and settings</p>
              </div>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 text-black font-semibold px-8 py-3 rounded-2xl shadow-lg shadow-emerald-500/25 border border-emerald-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="card border border-border bg-card p-2 overflow-x-auto">
            <TabsTrigger 
              value="details"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-emerald-300 data-[state=active]:border data-[state=active]:border-emerald-500/30 transition-all duration-300"
            >
              <FileText className="h-4 w-4 mr-2" />
              Lesson Details
            </TabsTrigger>
            <TabsTrigger 
              value="content"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-teal-300 data-[state=active]:border data-[state=active]:border-teal-500/30 transition-all duration-300"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Content
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-300 data-[state=active]:border data-[state=active]:border-purple-500/30 transition-all duration-300"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="preview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-emerald-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-500/30 transition-all duration-300"
            >
              <Video className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card className="card border border-border bg-card">
              <CardHeader className="pb-4 p-4 sm:p-6">
                <CardTitle className="text-xl text-emerald-300 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-black" />
                  </div>
                  Lesson Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-4 sm:p-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-emerald-300">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-background/50 border-emerald-500/30 focus:border-emerald-500/50 text-emerald-100 placeholder:text-emerald-300/50"
                    placeholder="Enter lesson title..."
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-emerald-300">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-background/50 border-emerald-500/30 focus:border-emerald-500/50 text-emerald-100 placeholder:text-emerald-300/50 min-h-[100px]"
                    placeholder="Enter lesson description..."
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-emerald-300">Video URL</label>
                  <Input
                    value={formData.video_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                    className="bg-background/50 border-emerald-500/30 focus:border-emerald-500/50 text-emerald-100 placeholder:text-emerald-300/50"
                    placeholder="Enter video URL..."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-emerald-300">View Limit</label>
                    <Input
                      value={formData.view_limit}
                      onChange={(e) => setFormData(prev => ({ ...prev, view_limit: e.target.value }))}
                      className="bg-background/50 border-emerald-500/30 focus:border-emerald-500/50 text-emerald-100 placeholder:text-emerald-300/50"
                      placeholder="Enter view limit..."
                      type="number"
                      min="0"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-emerald-300">Duration (minutes)</label>
                    <Input
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: e.target.value.replace(/[^0-9]/g, '') }))}
                      className="bg-background/50 border-emerald-500/30 focus:border-emerald-500/50 text-emerald-100 placeholder:text-emerald-300/50"
                      placeholder="Enter duration in minutes..."
                      type="number"
                      min="1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card className="card border border-border bg-card">
              <CardHeader className="pb-4 p-4 sm:p-6">
                <CardTitle className="text-xl text-teal-300 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Brain className="h-4 w-4 text-black" />
                  </div>
                  AI-Generated Content
                  <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-medium">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Powered
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-4 sm:p-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-teal-300">Generate summary from slides (PDF)</label>
                  <div className="relative inline-flex items-center gap-3">
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={handleSlidesPdfUpload}
                      disabled={aiLoading}
                      className="file:mr-4 file:rounded-md file:border file:border-teal-500/30 file:bg-background/50 file:px-3 file:py-1 file:text-teal-300"
                    />
                    <Button variant="outline" disabled className="hidden sm:inline-flex">
                      <Upload className="h-4 w-4 mr-2" />
                      {aiLoading ? 'Processing...' : 'Choose PDF'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Upload course slides PDF to auto-generate a concise lesson summary.</p>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-teal-300">Transcription</label>
                  <Textarea
                    value={contentData.transcription}
                    onChange={(e) => setContentData(prev => ({ ...prev, transcription: e.target.value }))}
                    className="bg-background/50 border-teal-500/30 focus:border-teal-500/50 text-teal-100 placeholder:text-teal-300/50 min-h-[200px]"
                    placeholder="AI-generated transcription will appear here..."
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-teal-300">Summary</label>
                  <Textarea
                    value={contentData.summary}
                    onChange={(e) => setContentData(prev => ({ ...prev, summary: e.target.value }))}
                    className="bg-background/50 border-teal-500/30 focus:border-teal-500/50 text-teal-100 placeholder:text-teal-300/50 min-h-[150px]"
                    placeholder="AI-generated summary will appear here..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <Card className="card border border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-purple-300">Total Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Eye className="h-5 w-5 text-black" />
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {lessonViews.length}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card border border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-emerald-300">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <Target className="h-5 w-5 text-black" />
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      {lessonViews.filter(v => v.completed).length}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card border border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-cyan-300">Avg Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Clock className="h-5 w-5 text-black" />
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                      {Math.round(lessonViews.reduce((acc, v) => acc + v.view_duration, 0) / (lessonViews.length || 1))}m
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="card border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-emerald-300 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Views Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '8px'
                        }} 
                      />
                      <Line type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="card border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-teal-300 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie 
                        data={completionData} 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={80} 
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {completionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Student Views Table */}
            <Card className="card border border-border bg-card">
              <CardHeader className="p-4 sm:p-6 pb-0">
                <CardTitle className="text-purple-300 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Student Views
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-purple-500/20">
                        <TableHead className="text-purple-300">Student</TableHead>
                        <TableHead className="text-purple-300">Email</TableHead>
                        <TableHead className="text-purple-300">Viewed At</TableHead>
                        <TableHead className="text-purple-300">Duration</TableHead>
                        <TableHead className="text-purple-300">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lessonViews.map((view) => (
                        <TableRow key={view.id} className="border-b border-purple-500/10 hover:bg-purple-500/5">
                          <TableCell className="text-purple-200">
                            {view.student_name}
                          </TableCell>
                          <TableCell className="text-purple-200">
                            {view.student_email}
                          </TableCell>
                          <TableCell className="text-purple-200">
                            {new Date(view.viewed_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-purple-200">
                            {view.view_duration} minutes
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={view.completed 
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" 
                                : "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
                              }
                            >
                              {view.completed ? 'Completed' : 'In Progress'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {lessonViews.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No views recorded yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card className="card border border-border bg-card">
              <CardHeader className="pb-4 p-4 sm:p-6">
                <CardTitle className="text-xl text-cyan-300 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Video className="h-4 w-4 text-black" />
                  </div>
                  Lesson Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-4 sm:p-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-cyan-300">{formData.title}</h2>
                  {formData.description && (
                    <p className="text-muted-foreground leading-relaxed">{formData.description}</p>
                  )}
                  {formData.view_limit && (
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40">
                      <Eye className="h-3 w-3 mr-1" />
                      View limit: {formData.view_limit}
                    </Badge>
                  )}
                </div>
                
                {youtubeId ? (
                  <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl shadow-cyan-500/20">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      title={formData.title}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
                        <Video className="h-8 w-8 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-cyan-300 font-medium">No video URL provided</p>
                        <p className="text-sm text-muted-foreground">Add a video URL to see the preview</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
