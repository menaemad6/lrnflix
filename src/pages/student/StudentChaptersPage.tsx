import React, { useState, useEffect, Suspense } from 'react';
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
import { Input } from '@/components/ui/input';
import { useStudentEnrolledChapters } from '@/lib/queries';

interface ChapterCourse {
  id: string;
  course?: {
    id?: string;
    title?: string;
    description?: string;
    price?: number;
    instructor_id?: string;
    instructor_name?: string;
    avatar_url?: string;
  };
  title?: string;
  description?: string;
}

interface EnrolledChapter {
  id: string;
  chapter: {
    id: string;
    title: string;
    description: string;
    price: number;
    cover_image_url?: string;
  };
  enrolled_at: string;
  totalCourses?: number;
  enrolledCourses?: number;
  chapterCourses?: ChapterCourse[];
}

const ChapterCardSkeleton = React.lazy(() => import('@/components/student/skeletons/ChapterCardSkeleton').then(m => ({ default: m.ChapterCardSkeleton })));

export const StudentChaptersPage = () => {
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const { teacher } = useTenant();
  const { data: enrolledChapters, isLoading, error } = useStudentEnrolledChapters(user, teacher);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (error) {
        console.error('Error fetching chapters:', error);
        toast({
            title: 'Error',
            description: 'Failed to load chapters',
            variant: 'destructive',
        });
    }
  }, [error, toast]);

  const fetchChapterCourses = async (chapterId: string): Promise<ChapterCourse[]> => {
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
    const chapterCourses = (data as ChapterCourse[]) || [];
    // Fetch all unique instructor_ids
    const instructorIds = Array.from(new Set(
      chapterCourses.map(obj => obj.course?.instructor_id).filter(Boolean)
    ));
    // Fetch all instructor names and avatars in one go
    const names: Record<string, string | undefined> = {};
    const avatars: Record<string, string | undefined> = {};
    if (instructorIds.length > 0) {
      const { data: teachersData } = await supabase
        .from('teachers')
        .select('user_id, display_name, profile_image_url')
        .in('user_id', instructorIds);
      if (teachersData) {
        (teachersData as Array<{ user_id: string; display_name?: string; profile_image_url?: string }>).forEach((t) => {
          names[t.user_id] = t.display_name;
          avatars[t.user_id] = t.profile_image_url;
        });
      }
    }
    // Attach instructor_name and avatar_url to each course
    return chapterCourses.map(obj => obj.course ? {
      ...obj,
      course: {
        ...obj.course,
        instructor_name: names[obj.course.instructor_id] || 'Course Instructor',
        avatar_url: avatars[obj.course.instructor_id] || undefined
      }
    } : obj);
  };

  // Filter logic for search
  const filteredChapters = enrolledChapters?.filter((enrollment) =>
    enrollment.chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (enrollment.chapter.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <DashboardLayout>
      <DashboardModernHeader
        title="My Chapters"
        subtitle="Track your progress through comprehensive learning paths"
        buttonText="Explore Chapters"
        onButtonClick={() => navigate('/chapters')}
      />
      <div className="space-y-6">
        {/* Search Bar */}
        <Card className="glass-card w-full max-w-full">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-row gap-4 w-full items-center">
              <div className="flex-1 min-w-0 w-full">
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by chapter name or description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 glass"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* End Search Bar */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Suspense fallback={<div className='h-64' />} key={i}>
                <ChapterCardSkeleton />
              </Suspense>
            ))}
          </div>
        ) : filteredChapters.length === 0 ? (
          <Card className="glass-card border-0 hover-glow">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
                <Sparkles className="h-10 w-10 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 gradient-text">No chapters found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Try adjusting your search criteria or explore different chapters.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChapters.map((enrollment) => (
              <Card key={enrollment.id} className="glass-card border-0 hover:shadow-xl group rounded-2xl transition-transform min-w-0">
                <CardContent className="p-0">
                  <div className="flex flex-col h-full">
                    {/* Thumbnail Image */}
                    <div className="w-full h-48 overflow-hidden rounded-t-2xl">
                      {enrollment.chapter.cover_image_url ? (
                        <img
                          src={enrollment.chapter.cover_image_url}
                          alt={enrollment.chapter.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/10 to-muted/20 flex items-center justify-center">
                          <Sparkles className="w-16 h-16 text-primary/60" />
                        </div>
                      )}
                    </div>
                    {/* Header Section */}
                    <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 p-6 pb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-extrabold gradient-text mb-1 break-words whitespace-normal leading-tight">
                          {enrollment.chapter.title}
                        </h3>
                        
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-card/70 border border-primary/20 text-primary font-bold text-lg shadow-sm">
                          {enrollment.chapter.price} <span className="text-xs font-semibold uppercase tracking-wide">credits</span>
                        </span>
                      </div>
                    </div>
                    {/* Description */}
                    {enrollment.chapter.description && (
                      <p className="text-muted-foreground text-sm px-6 pb-2 line-clamp-3">
                        {enrollment.chapter.description}
                      </p>
                    )}
                    {/* Course List */}
                    <div className="space-y-3 mt-2 px-4 pb-4">
                      {enrollment.chapterCourses && enrollment.chapterCourses.length > 0 ? (
                        enrollment.chapterCourses.map((obj: ChapterCourse) => (
                          <Card key={obj.id} className="border-0 glass-card bg-card/80 rounded-xl shadow-md">
                            <CardContent className="p-3 flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-primary-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate text-base mb-0.5">{obj.course?.title || obj.title || 'Unknown Course'}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-2">{obj.course?.description || obj.description || ''}</p>
                              </div>
                              {obj.course?.price && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs">
                                  {obj.course.price} <span className="uppercase">credits</span>
                                </span>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-muted-foreground px-2">No courses in this chapter yet.</div>
                      )}
                    </div>
                    {/* Action Button */}
                    <div className="px-6 pb-6 mt-auto">
                      <Link to={`/chapters/${enrollment.chapter.id}`}>
                        <Button className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-md h-12 text-lg group-hover:scale-105 transition-transform">
                          <Play className="h-5 w-5 mr-2" />
                          Continue
                        </Button>
                      </Link>
                    </div>
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