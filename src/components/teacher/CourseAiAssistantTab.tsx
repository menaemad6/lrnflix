import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Bot, 
  Clock, 
  Users, 
  TrendingUp, 
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface StudentCallHistory {
  id: string;
  student_id: string;
  lesson_id: string | null;
  call_duration_minutes: number;
  call_started_at: string;
  call_ended_at: string | null;
  call_date: string;
  created_at: string;
  student?: {
    id: string;
    full_name: string;
    email: string;
  };
  lesson?: {
    id: string;
    title: string;
  };
}

interface AiAssistantStats {
  totalCalls: number;
  totalMinutes: number;
  uniqueStudents: number;
  averageCallDuration: number;
  mostActiveLesson: string | null;
  callsThisWeek: number;
  callsThisMonth: number;
}

interface CourseAiAssistantTabProps {
  courseId: string;
}

export const CourseAiAssistantTab: React.FC<CourseAiAssistantTabProps> = ({ courseId }) => {
  const { t } = useTranslation('courses');
  const [callHistory, setCallHistory] = useState<StudentCallHistory[]>([]);
  const [stats, setStats] = useState<AiAssistantStats>({
    totalCalls: 0,
    totalMinutes: 0,
    uniqueStudents: 0,
    averageCallDuration: 0,
    mostActiveLesson: null,
    callsThisWeek: 0,
    callsThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [lessonFilter, setLessonFilter] = useState('all');
  const [lessons, setLessons] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    fetchData();
  }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch lessons for this course
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, title')
        .eq('course_id', courseId)
        .order('order_index');

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      // Fetch call history with student and lesson details
      const { data: callHistoryData, error: callHistoryError } = await supabase
        .from('student_call_history')
        .select(`
          id,
          student_id,
          lesson_id,
          call_duration_minutes,
          call_started_at,
          call_ended_at,
          call_date,
          created_at,
          student:profiles!student_call_history_student_id_fkey(
            id,
            full_name,
            email
          ),
          lesson:lessons!student_call_history_lesson_id_fkey(
            id,
            title
          )
        `)
        .in('lesson_id', lessonsData?.map(l => l.id) || [])
        .order('call_started_at', { ascending: false });

      if (callHistoryError) throw callHistoryError;
      setCallHistory(callHistoryData || []);

      // Calculate stats
      calculateStats(callHistoryData || []);

    } catch (error) {
      console.error('Error fetching AI assistant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: StudentCallHistory[]) => {
    const totalCalls = data.length;
    const totalMinutes = data.reduce((sum, call) => sum + call.call_duration_minutes, 0);
    const uniqueStudents = new Set(data.map(call => call.student_id)).size;
    const averageCallDuration = totalCalls > 0 ? totalMinutes / totalCalls : 0;

    // Find most active lesson
    const lessonUsage = data.reduce((acc, call) => {
      if (call.lesson?.title) {
        acc[call.lesson.title] = (acc[call.lesson.title] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const mostActiveLesson = Object.keys(lessonUsage).reduce((a, b) => 
      lessonUsage[a] > lessonUsage[b] ? a : b, null
    );

    // Calculate weekly and monthly calls
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const callsThisWeek = data.filter(call => 
      new Date(call.call_started_at) >= weekAgo
    ).length;

    const callsThisMonth = data.filter(call => 
      new Date(call.call_started_at) >= monthAgo
    ).length;

    setStats({
      totalCalls,
      totalMinutes,
      uniqueStudents,
      averageCallDuration,
      mostActiveLesson,
      callsThisWeek,
      callsThisMonth,
    });
  };

  const filteredCallHistory = callHistory.filter(call => {
    const matchesSearch = !searchTerm || 
      call.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.lesson?.title?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = dateFilter === 'all' || (() => {
      const callDate = new Date(call.call_date);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          return callDate.toDateString() === now.toDateString();
        case 'week':
          return callDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case 'month':
          return callDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        default:
          return true;
      }
    })();

    const matchesLesson = lessonFilter === 'all' || call.lesson_id === lessonFilter;

    return matchesSearch && matchesDate && matchesLesson;
  });

  const exportData = () => {
    const csvContent = [
      ['Student Name', 'Student Email', 'Lesson', 'Call Duration (min)', 'Call Date', 'Started At', 'Ended At'],
      ...filteredCallHistory.map(call => [
        call.student?.full_name || 'Unknown',
        call.student?.email || 'Unknown',
        call.lesson?.title || 'General',
        call.call_duration_minutes.toString(),
        call.call_date,
        format(new Date(call.call_started_at), 'yyyy-MM-dd HH:mm:ss'),
        call.call_ended_at ? format(new Date(call.call_ended_at), 'yyyy-MM-dd HH:mm:ss') : 'Ongoing'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-assistant-calls-${courseId}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="glass-card border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="glass-card border-white/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-48" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="rounded-lg border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <div className="grid grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="grid grid-cols-6 gap-4">
                      {[...Array(6)].map((_, j) => (
                        <Skeleton key={j} className="h-4 w-full" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-white/10 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{t('aiAssistant.totalCalls')}</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.totalCalls}</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Bot className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">{t('aiAssistant.totalMinutes')}</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.totalMinutes}</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Clock className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">{t('aiAssistant.activeStudents')}</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.uniqueStudents}</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">{t('aiAssistant.avgDuration')}</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {Math.round(stats.averageCallDuration)}{t('aiAssistant.minutes')}
                </p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <TrendingUp className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">{t('aiAssistant.thisWeek')}</p>
                <p className="text-lg font-bold">{stats.callsThisWeek} {t('aiAssistant.calls')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">{t('aiAssistant.thisMonth')}</p>
                <p className="text-lg font-bold">{stats.callsThisMonth} {t('aiAssistant.calls')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">{t('aiAssistant.mostActiveLesson')}</p>
                <p className="text-lg font-bold truncate">
                  {stats.mostActiveLesson || t('common.none')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {t('aiAssistant.callHistory')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('aiAssistant.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t('aiAssistant.filterByDate')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('aiAssistant.allTime')}</SelectItem>
                <SelectItem value="today">{t('aiAssistant.today')}</SelectItem>
                <SelectItem value="week">{t('aiAssistant.thisWeek')}</SelectItem>
                <SelectItem value="month">{t('aiAssistant.thisMonth')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={lessonFilter} onValueChange={setLessonFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t('aiAssistant.filterByLesson')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('aiAssistant.allLessons')}</SelectItem>
                {lessons.map(lesson => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={exportData} variant="outline" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              {t('aiAssistant.exportCsv')}
            </Button>
          </div>

          {/* Call History Table */}
          <div className="rounded-lg border border-white/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead>{t('aiAssistant.student')}</TableHead>
                  <TableHead>{t('aiAssistant.lesson')}</TableHead>
                  <TableHead>{t('aiAssistant.duration')}</TableHead>
                  <TableHead>{t('aiAssistant.date')}</TableHead>
                  <TableHead>{t('aiAssistant.time')}</TableHead>
                  <TableHead>{t('aiAssistant.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCallHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t('aiAssistant.noCallsFound')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCallHistory.map((call) => (
                    <TableRow key={call.id} className="border-white/10">
                      <TableCell>
                        <div>
                          <p className="font-medium">{call.student?.full_name || t('aiAssistant.unknownStudent')}</p>
                          <p className="text-sm text-muted-foreground">{call.student?.email || t('aiAssistant.noEmail')}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {call.lesson?.title || t('aiAssistant.general')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {call.call_duration_minutes}{t('aiAssistant.minutes')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(call.call_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(call.call_started_at), 'HH:mm')} - {' '}
                        {call.call_ended_at ? format(new Date(call.call_ended_at), 'HH:mm') : t('aiAssistant.ongoing')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={call.call_ended_at ? 'default' : 'secondary'}>
                          {call.call_ended_at ? t('aiAssistant.completed') : t('aiAssistant.ongoing')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
