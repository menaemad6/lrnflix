import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Search, Star, Users, Clock, CheckCircle } from 'lucide-react';
import { useRandomBackground } from "../../hooks/useRandomBackground";
import { useTenant } from '@/contexts/TenantContext';

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

      // Get course counts for each chapter
      const chaptersWithDetails = await Promise.all(
        (chaptersData || []).map(async (chapter) => {
          const { count } = await supabase
            .from('courses')
            .select('*', { count: 'exact', head: true })
            .eq('chapter_id', chapter.id)
            .eq('status', 'published');

          return {
            ...chapter,
            course_count: count || 0,
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

      const response = result.data as any;
      if (response?.success) {
        toast({
          title: 'Success',
          description: response.message,
        });
        fetchChapters();
      } else {
        toast({
          title: 'Error',
          description: response?.error || 'Failed to enroll',
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={bgClass + " min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-2 sm:p-4 "}>
      <div className="container mx-auto px-2 sm:px-4 space-y-8 pt-[100px]">
        {/* Header */}
        <div className="text-center space-y-4 px-2">
          <h1 className="text-4xl md:text-5xl font-bold">
            Explore <span className="gradient-text">Chapters</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover comprehensive learning paths with curated course collections
          </p>
        </div>

        {/* Search */}
        <Card className="glass-card w-full max-w-full">
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

        {/* Chapters Grid */}
        <div className="w-full overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full">
            {filteredChapters.map((chapter) => (
              <Card key={chapter.id} className="glass-card hover-glow group cursor-pointer w-full max-w-full min-w-0">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2 gap-2 flex-wrap min-w-0">
                    <div className="flex gap-2">
                      <Badge variant={chapter.status === 'published' ? 'default' : 'secondary'}>
                        {chapter.status}
                      </Badge>
                    </div>
                    {chapter.is_enrolled && (
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Enrolled
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {chapter.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {chapter.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-muted-foreground gap-2 sm:gap-0">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{chapter.course_count} courses</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span>4.8</span>
                      </div>
                    </div>
                    
                    <div className="text-lg font-semibold gradient-text">
                      {chapter.price} credits
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    {chapter.is_enrolled ? (
                      <Button 
                        className="flex-1 hover-glow min-w-0 mt-4"
                        onClick={() => navigate(`/chapters/${chapter.id}`)}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Chapter
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          className="flex-1 glass hover-glow min-w-0 mt-4"
                          onClick={() => navigate(`/chapters/${chapter.id}`)}
                        >
                          Preview
                        </Button>
                        <Button 
                          className="flex-1 hover-glow min-w-0 mt-4"
                          onClick={() => enrollInChapter(chapter.id)}
                        >
                          Enroll Now
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {filteredChapters.length === 0 && (
          <Card className="glass-card w-full max-w-full">
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No chapters found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};