import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Search, Star, Users, Clock, CheckCircle, Sparkles } from 'lucide-react';
import { useRandomBackground } from "../../hooks/useRandomBackground";
import { useTenant } from '@/contexts/TenantContext';
import WavesHeroHeader from '@/components/ui/WavesHeroHeader';
import ChapterCard from '@/components/chapters/ChapterCard';
import { ChapterCardSkeleton } from '@/components/student/skeletons/ChapterCardSkeleton';

interface Chapter {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number;
  course_count: number;
  is_enrolled: boolean;
  cover_image_url?: string;
}

export const ChaptersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const bgClass = useRandomBackground();
  const { teacher } = useTenant();

  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      // Get published chapters
      let chaptersQuery = supabase
        .from('chapters')
        .select('*')
        .eq('status', 'published');
      if (teacher) {
        chaptersQuery = chaptersQuery.eq('instructor_id', teacher.user_id);
      }
      const { data: chaptersData, error: chaptersError } = await chaptersQuery;
      if (chaptersError) throw chaptersError;
      // Get user's chapter enrollments
      let enrolledChapterIds: string[] = [];
      if (user) {
        const { data: enrollments, error: enrollmentError } = await supabase
          .from('chapter_enrollments')
          .select('chapter_id')
          .eq('student_id', user.id);
        if (enrollmentError) throw enrollmentError;
        enrolledChapterIds = enrollments?.map((e) => e.chapter_id) || [];
      }
      // Get course counts for each chapter using chapter_objects
      const chaptersWithDetails = await Promise.all(
        (chaptersData || []).map(async (chapter) => {
          // Count published courses linked via chapter_objects
          const { count: objectsCount, error: objectsError } = await supabase
            .from('chapter_objects')
            .select('object_id', { count: 'exact', head: true })
            .eq('chapter_id', chapter.id)
            .eq('object_type', 'course')
            .not('object_id', 'is', null);
          if (objectsError) throw objectsError;
          // Optionally, also count direct courses with chapter_id (legacy)
          // const { count: directCount } = await supabase
          //   .from('courses')
          //   .select('*', { count: 'exact', head: true })
          //   .eq('chapter_id', chapter.id)
          //   .eq('status', 'published');
          return {
            ...chapter,
            course_count: objectsCount || 0,
            is_enrolled: enrolledChapterIds.includes(chapter.id)
          };
        })
      );
      setChapters(chaptersWithDetails);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error fetching chapters:', err);
      toast({
        title: 'Error',
        description: 'Failed to load chapters',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const enrollInChapter = async (chapterId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const result = await supabase.rpc('enroll_chapter_with_payment', {
        p_chapter_id: chapterId
      });

      if (result.error) throw result.error;

      const response = result.data as unknown;
      if (
        response &&
        typeof response === 'object' &&
        'success' in response &&
        (response as { success: boolean }).success
      ) {
        toast({
          title: 'Success',
          description: (response as { message?: string }).message,
        });
        fetchChapters();
      } else {
        toast({
          title: 'Error',
          description: (response && typeof response === 'object' && 'error' in response) ? (response as { error?: string }).error : 'Failed to enroll',
          variant: 'destructive',
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error enrolling in chapter:', err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const filteredChapters = chapters.filter((chapter) => {
    const matchesSearch = chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (chapter.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className={bgClass + " min-h-screen bg-gradient-to-br from-background via-background to-primary/5 "}>
      {/* Modern Premium Header - full width */}
      <WavesHeroHeader
        title={<span>Explore <span className="text-primary">Chapters</span></span>}
        description="Discover comprehensive learning paths with curated course collections. Unlock premium chapters and accelerate your growth!"
      />
      <div className="container mx-auto px-2 sm:px-4 space-y-8">
        {/* Search */}
        <Card className="glass-card w-full max-w-full -mt-12">
          <CardContent className="p-4 sm:p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chapters by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass"
              />
            </div>
          </CardContent>
        </Card>
        {/* Chapters Grid or Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-full">
            {[...Array(6)].map((_, i) => (
              <ChapterCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-full">
              {filteredChapters.map((chapter) => (
                <ChapterCard
                  key={chapter.id}
                  id={chapter.id}
                  title={chapter.title}
                  description={chapter.description}
                  price={chapter.price}
                  courseCount={chapter.course_count}
                  isEnrolled={chapter.is_enrolled}
                  coverImageUrl={chapter.cover_image_url}
                  onPreview={() => navigate(`/chapters/${chapter.id}`)}
                  onEnroll={() => enrollInChapter(chapter.id)}
                  onContinue={() => navigate(`/chapters/${chapter.id}`)}
                />
              ))}
            </div>
          </div>
        )}
        {filteredChapters.length === 0 && (
          <Card className="glass-card w-full max-w-full">
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No chapters found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or explore different chapters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};