import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
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
import { ContentManagementSkeleton } from '@/components/ui/skeletons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DeviceInfoDisplay } from '@/components/lessons/DeviceInfoDisplay';
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
  device_limit: number | null;
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
  device_type: string;
  student_name?: string;
  student_email?: string;
}

interface LessonEditorProps {
  lessonId: string;
  onBack: () => void;
}

export const LessonEditor = ({ lessonId, onBack }: LessonEditorProps) => {
  const { toast } = useToast();
  const { t } = useTranslation('teacher');
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [lessonViews, setLessonViews] = useState<LessonView[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    device_limit: '',
    view_limit: '',
    duration_minutes: '',
  });
  const [contentData, setContentData] = useState({
    transcription: '',
    summary: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setContentData(prev => ({ ...prev, summary: summaryText }));
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
        device_limit: lessonData.device_limit?.toString() || '',
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
          device_limit: formData.device_limit ? parseInt(formData.device_limit) : null,
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
        description: t('lessonEditor.toasts.lessonUpdated'),
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
    return <ContentManagementSkeleton />;
  }

  if (!lesson) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">{t('lessonEditor.toasts.lessonNotFound')}</p>
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

              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('lessonEditor.header.back')}
              </Button>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
                  {t('lessonEditor.header.editLesson')}
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">{t('lessonEditor.header.customizeLessonContent')}</p>
              </div>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              variant='default'
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? t('lessonEditor.header.saving') : t('lessonEditor.header.saveChanges')}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="card border border-border bg-card p-2 overflow-x-auto">
            <TabsTrigger 
              value="details"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-500/20 data-[state=active]:to-secondary-500/20 data-[state=active]:text-primary-300 data-[state=active]:border data-[state=active]:border-primary-500/30 transition-all duration-300"
            >
              <FileText className="h-4 w-4 mr-2" />
              {t('lessonEditor.tabs.lessonDetails')}
            </TabsTrigger>
            <TabsTrigger 
              value="content"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary-500/20 data-[state=active]:to-accent-500/20 data-[state=active]:text-secondary-300 data-[state=active]:border data-[state=active]:border-secondary-500/30 transition-all duration-300"
            >
              <Brain className="h-4 w-4 mr-2" />
              {t('lessonEditor.tabs.aiContent')}
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-300 data-[state=active]:border data-[state=active]:border-purple-500/30 transition-all duration-300"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {t('lessonEditor.tabs.analytics')}
            </TabsTrigger>
            <TabsTrigger 
              value="preview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent-500/20 data-[state=active]:to-primary-500/20 data-[state=active]:text-accent-300 data-[state=active]:border data-[state=active]:border-accent-500/30 transition-all duration-300"
            >
              <Video className="h-4 w-4 mr-2" />
              {t('lessonEditor.tabs.preview')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card className="card border border-border bg-card">
              <CardHeader className="pb-4 p-4 sm:p-6">
                <CardTitle className="text-xl text-primary-300 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-black" />
                  </div>
                  {t('lessonEditor.lessonDetails.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-4 sm:p-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-primary-300">{t('lessonEditor.lessonDetails.titleLabel')}</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-background/50 border-primary-500/30 focus:border-primary-500/50 text-primary-100 placeholder:text-primary-300/50"
                    placeholder={t('lessonEditor.lessonDetails.titlePlaceholder')}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-primary-300">{t('lessonEditor.lessonDetails.descriptionLabel')}</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-background/50 border-primary-500/30 focus:border-primary-500/50 text-primary-100 placeholder:text-primary-300/50 min-h-[100px]"
                    placeholder={t('lessonEditor.lessonDetails.descriptionPlaceholder')}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-primary-300">{t('lessonEditor.lessonDetails.videoUrlLabel')}</label>
                  <Input
                    value={formData.video_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                    className="bg-background/50 border-primary-500/30 focus:border-primary-500/50 text-primary-100 placeholder:text-primary-300/50"
                    placeholder={t('lessonEditor.lessonDetails.videoUrlPlaceholder')}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-primary-300">{t('lessonEditor.lessonDetails.deviceLimit')}</label>
                    <Input
                      value={formData.device_limit}
                      onChange={(e) => setFormData(prev => ({ ...prev, device_limit: e.target.value }))}
                      className="bg-background/50 border-primary-500/30 focus:border-primary-500/50 text-primary-100 placeholder:text-primary-300/50"
                      placeholder={t('lessonEditor.lessonDetails.enterDeviceLimit')}
                      type="number"
                      min="0"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-primary-300">{t('lessonEditor.lessonDetails.viewLimitLabel')}</label>
                    <Input
                      value={formData.view_limit}
                      onChange={(e) => setFormData(prev => ({ ...prev, view_limit: e.target.value }))}
                      className="bg-background/50 border-primary-500/30 focus:border-primary-500/50 text-primary-100 placeholder:text-primary-300/50"
                      placeholder={t('lessonEditor.lessonDetails.viewLimitPlaceholder')}
                      type="number"
                      min="0"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-primary-300">{t('lessonEditor.lessonDetails.durationLabel')}</label>
                    <Input
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: e.target.value.replace(/[^0-9]/g, '') }))}
                      className="bg-background/50 border-primary-500/30 focus:border-primary-500/50 text-primary-100 placeholder:text-primary-300/50"
                      placeholder={t('lessonEditor.lessonDetails.durationPlaceholder')}
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
                <CardTitle className="text-xl text-secondary-300 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-lg flex items-center justify-center">
                    <Brain className="h-4 w-4 text-black" />
                  </div>
                  {t('lessonEditor.aiContent.title')}
                  <Badge className="bg-gradient-to-r from-secondary-500 to-accent-500 text-black font-medium">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {t('lessonEditor.aiContent.aiPowered')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-4 sm:p-6">
                <div className="space-y-4 p-6 rounded-lg border-2 border-dashed border-secondary-500/30 bg-secondary-500/5 text-center">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-secondary-500/20 to-accent-500/20 rounded-2xl flex items-center justify-center border border-secondary-500/30">
                    <Brain className="h-8 w-8 text-secondary-300" />
                  </div>
                  <h4 className="text-lg font-semibold text-secondary-300">{t('lessonEditor.aiContent.aiAssistantDataSource')}</h4>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {t('lessonEditor.aiContent.aiAssistantDescription')}
                  </p>
                  <div className="relative inline-flex items-center justify-center">
                    <Button 
                      variant="outline" 
                      className="cursor-pointer bg-background/50 border-secondary-500/30 hover:bg-secondary-500/10 hover:border-secondary-500/50 text-secondary-300"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={aiLoading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {aiLoading ? t('lessonEditor.aiContent.processing') : t('lessonEditor.aiContent.uploadPdf')}
                    </Button>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleSlidesPdfUpload}
                      disabled={aiLoading}
                      className="sr-only"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-secondary-300">{t('lessonEditor.aiContent.transcriptionLabel')}</label>
                  <Textarea
                    value={contentData.transcription}
                    onChange={(e) => setContentData(prev => ({ ...prev, transcription: e.target.value }))}
                    className="bg-background/50 border-secondary-500/30 focus:border-secondary-500/50 text-secondary-100 placeholder:text-secondary-300/50 min-h-[200px]"
                    placeholder={t('lessonEditor.aiContent.transcriptionPlaceholder')}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-secondary-300">{t('lessonEditor.aiContent.summaryLabel')}</label>
                  <Textarea
                    value={contentData.summary}
                    onChange={(e) => setContentData(prev => ({ ...prev, summary: e.target.value }))}
                    className="bg-background/50 border-secondary-500/30 focus:border-secondary-500/50 text-secondary-100 placeholder:text-secondary-300/50 min-h-[150px]"
                    placeholder={t('lessonEditor.aiContent.summaryPlaceholder')}
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
                  <CardTitle className="text-sm font-medium text-purple-300">{t('lessonEditor.analytics.totalViews')}</CardTitle>
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
                  <CardTitle className="text-sm font-medium text-primary-300">{t('lessonEditor.analytics.completed')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                      <Target className="h-5 w-5 text-black" />
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                      {lessonViews.filter(v => v.completed).length}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card border border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-accent-300">{t('lessonEditor.analytics.avgDuration')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-primary-500 rounded-xl flex items-center justify-center">
                      <Clock className="h-5 w-5 text-black" />
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent">
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
                  <CardTitle className="text-primary-300 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {t('lessonEditor.analytics.viewsOverTime')}
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
                  <CardTitle className="text-secondary-300 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {t('lessonEditor.analytics.completionRate')}
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
                  {t('lessonEditor.analytics.studentViews')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-purple-500/20">
                        <TableHead className="text-purple-300">{t('quizEditor.attempts.student')}</TableHead>
                        <TableHead className="text-purple-300">{t('quizEditor.attempts.email')}</TableHead>
                        <TableHead className="text-purple-300">{t('lessonEditor.analytics.viewedAt')}</TableHead>
                        <TableHead className="text-purple-300">{t('lessonEditor.analytics.duration')}</TableHead>
                        <TableHead className="text-purple-300">{t('lessonEditor.analytics.deviceInfo')}</TableHead>
                        <TableHead className="text-purple-300">{t('lessonEditor.analytics.status')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lessonViews.map((view) => (
                        <TableRow key={view.id} className="border-b border-purple-500/10 hover:bg-purple-500/5">
                          <TableCell className="text-purple-200">
                            <Link to={`/teacher/students/${view.student_id}`}>{view.student_name}</Link>
                          </TableCell>
                          <TableCell className="text-purple-200">
                            {view.student_email}
                          </TableCell>
                          <TableCell className="text-purple-200">
                            {new Date(view.viewed_at).toLocaleString()}
                          </TableCell>
                                                                                <TableCell className="text-purple-200">
                            {view.view_duration} {t('lessonEditor.analytics.minutes')}
                          </TableCell>
                          <TableCell className="text-purple-200">
                            <DeviceInfoDisplay deviceType={view.device_type} />
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={view.completed 
                                ? "bg-primary-500/20 text-primary-300 border-primary-500/40" 
                                : "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
                              }
                            >
                              {view.completed ? t('lessonEditor.analytics.completed') : t('lessonEditor.analytics.inProgress')}
                            </Badge>
                          </TableCell>
                          </TableRow>
                        ))}
                        {lessonViews.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              {t('lessonEditor.analytics.noViewsRecorded')}
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
                <CardTitle className="text-xl text-accent-300 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-primary-500 rounded-lg flex items-center justify-center">
                    <Video className="h-4 w-4 text-black" />
                  </div>
                  {t('lessonEditor.preview.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-4 sm:p-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-accent-300">{formData.title}</h2>
                  {formData.description && (
                    <p className="text-muted-foreground leading-relaxed">{formData.description}</p>
                  )}
                  {formData.view_limit && (
                    <Badge className="bg-accent-500/20 text-accent-300 border-accent-500/40">
                      <Eye className="h-3 w-3 mr-1" />
                      {t('lessonEditor.preview.viewLimit', { limit: formData.view_limit })}
                    </Badge>
                  )}
                </div>
                
                {youtubeId ? (
                  <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl shadow-accent-500/20">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      title={formData.title}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-gradient-to-br from-accent-500/10 to-primary-500/10 rounded-xl flex items-center justify-center border border-accent-500/20">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-accent-500/20 to-primary-500/20 rounded-2xl flex items-center justify-center mx-auto">
                        <Video className="h-8 w-8 text-accent-400" />
                      </div>
                      <div>
                        <p className="text-accent-300 font-medium">{t('lessonEditor.preview.noVideoUrl')}</p>
                        <p className="text-sm text-muted-foreground">{t('lessonEditor.preview.addVideoUrlToSeePreview')}</p>
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
