import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Trophy, Play, Sparkles } from 'lucide-react';
import type { RootState } from '@/store/store';
import { useTenant } from '@/contexts/TenantContext';
import DashboardModernHeader from '@/components/ui/DashboardModernHeader';

interface EnrolledChapter {
  id: string;
  chapter: {
    id: string;
    title: string;
    description: string;
    price: number;
  };
  enrolled_at: string;
  progress?: number;
  totalCourses?: number;
  enrolledCourses?: number;
  chapterCourses?: any[];
}

export const StudentChaptersPage = () => {
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const { teacher } = useTenant();
  const [enrolledChapters, setEnrolledChapters] = useState<EnrolledChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnrolledChapters();
  }, []);

  const fetchChapterCourses = async (chapterId: string) => {
    let query = supabase
      .from('chapter_objects')
      .select('*, course:courses!object_id(*)')
      .eq('chapter_id', chapterId)
      .eq('object_type', 'course');
    if (teacher) {
      query = query.eq('course.instructor_id', teacher.user_id);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };

  const fetchEnrolledChapters = async () => {
    try {
      if (!user) throw new Error('Not authenticated');
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('chapter_enrollments')
        .select(`
          id,
          enrolled_at,
          chapter:chapters (
            id,
            title,
            description,
            price
          )
        `)
        .eq('student_id', user.id)
        .order('enrolled_at', { ascending: false });
      if (enrollmentsError) throw enrollmentsError;
      const chaptersWithProgress = await Promise.all(
        (enrollmentsData || []).map(async (enrollment: any) => {
          // Fetch courses for this chapter using chapter_objects
          const chapterCourses = await fetchChapterCourses(enrollment.chapter.id);
          const courseIds = chapterCourses.map((obj: any) => obj.course?.id).filter(Boolean);
          const totalCourses = courseIds.length;
          let enrolledCourses = 0;
          if (courseIds.length > 0) {
            const { count } = await supabase
              .from('enrollments')
              .select('*', { count: 'exact', head: true })
              .eq('student_id', user.id)
              .in('course_id', courseIds);
            enrolledCourses = count || 0;
          }
          const progress = totalCourses ? Math.round((enrolledCourses / totalCourses) * 100) : 0;
          return {
            ...enrollment,
            progress,
            totalCourses,
            enrolledCourses,
            chapterCourses
          };
        })
      );
      setEnrolledChapters(chaptersWithProgress);
    } catch (error: any) {
      console.error('Error fetching chapters:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chapters',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardModernHeader
        title="My Chapters"
        subtitle="Track your progress through comprehensive learning paths"
        buttonText="Explore Chapters"
        onButtonClick={() => navigate('/chapters')}
      />
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : enrolledChapters.length === 0 ? (
          <Card className="glass-card border-0 hover-glow">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
                <BookOpen className="h-10 w-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 gradient-text">Start Your Chapter Journey</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Unlock comprehensive learning paths with curated course collections designed to accelerate your growth.
              </p>
              <Link to="/chapters">
                <Button className="btn-primary">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Browse Chapters
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {enrolledChapters.map((enrollment) => (
              <Card key={enrollment.id} className="glass-card border-0 hover-glow group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold group-hover:text-emerald-400 transition-colors">
                            {enrollment.chapter.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                              Chapter
                            </Badge>
                            {enrollment.progress === 100 && (
                              <Badge className="bg-emerald-500 text-black">
                                <Trophy className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {enrollment.chapter.description && (
                        <p className="text-muted-foreground mb-4">
                          {enrollment.chapter.description}
                        </p>
                      )}
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-emerald-400">
                            Progress: {enrollment.enrolledCourses}/{enrollment.totalCourses} courses enrolled
                          </span>
                          <span className="font-medium">{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="ml-6">
                      <Link to={`/chapters/${enrollment.chapter.id}`}>
                        <Button className="btn-primary group-hover:scale-105 transition-transform">
                          <Play className="h-4 w-4 mr-2" />
                          Continue
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="space-y-3 mt-4">
                    {enrollment.chapterCourses && enrollment.chapterCourses.length > 0 ? (
                      enrollment.chapterCourses.map((obj: any) => (
                        <Card key={obj.id} className="border border-white/10">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                                <BookOpen className="h-4 w-4 text-primary-foreground" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{obj.course?.title || obj.title || 'Unknown Course'}</h4>
                                <p className="text-sm text-muted-foreground">{obj.course?.description || obj.description || ''}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={obj.course?.status === 'published' ? 'default' : 'secondary'}>
                                    {obj.course?.status || 'unknown'}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {obj.course?.price ? `${obj.course.price} credits` : ''}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-muted-foreground">No courses in this chapter yet.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};