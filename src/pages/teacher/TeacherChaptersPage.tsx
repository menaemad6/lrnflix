import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Sparkles, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CreateChapterModal } from '@/components/chapters/CreateChapterModal';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { Input } from '@/components/ui/input';

interface Chapter {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number;
  created_at: string;
  course_count?: number;
  enrollment_count?: number;
}

const ChapterCardSkeleton = React.lazy(() => import('@/components/student/skeletons/ChapterCardSkeleton').then(m => ({ default: m.ChapterCardSkeleton })));

export const TeacherChaptersPage = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch only chapters owned by this teacher
      const { data: chaptersData, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // For each chapter, count courses and enrollments
      const chaptersWithCounts = await Promise.all(
        (chaptersData || []).map(async (chapter) => {
          const { count: courseCount } = await supabase
            .from('courses')
            .select('*', { count: 'exact', head: true })
            .eq('chapter_id', chapter.id)
            .eq('instructor_id', user.id);

          const { count: enrollmentCount } = await supabase
            .from('chapter_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('chapter_id', chapter.id);

          return {
            ...chapter,
            course_count: courseCount || 0,
            enrollment_count: enrollmentCount || 0
          };
        })
      );

      setChapters(chaptersWithCounts);
    } catch (error: any) {
      console.error('Error fetching chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChapterCreated = () => {
    fetchChapters();
  };

  // Filter chapters by search term
  const filteredChapters = chapters.filter((chapter) =>
    chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (chapter.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <TeacherPageHeader
          title="Chapter Management"
          subtitle="Create and manage your educational chapters"
          actionLabel="New Chapter"
          onAction={() => setIsCreateModalOpen(true)}
          actionIcon={<Plus className="h-4 w-4 mr-2" />}
          actionButtonProps={{ className: 'btn-primary' }}
        />
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search chapters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Suspense fallback={<div className='glass-card border-0 p-6'><div className='h-40 w-full rounded-xl mb-2 bg-muted animate-pulse' /></div>} key={i}>
                <ChapterCardSkeleton />
              </Suspense>
            ))}
          </div>
        ) : filteredChapters.length === 0 ? (
          <Card className="glass-card border-0 hover-glow">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
                <BookOpen className="h-10 w-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 gradient-text">Create Your First Chapter</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Organize your courses into comprehensive learning paths. Build engaging chapters with our AI-powered tools.
              </p>
              <Button 
                className="btn-primary"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Start Creating
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredChapters.map((chapter) => (
              <Card key={chapter.id} className="glass-card border-0 hover-glow group">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-emerald-400 transition-colors">
                        {chapter.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={chapter.status === 'published' ? 'default' : 'secondary'} 
                               className={chapter.status === 'published' ? 'bg-emerald-500 text-black' : ''}>
                          {chapter.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {chapter.enrollment_count || 0} students
                        </span>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-sm">{chapter.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold gradient-text">{chapter.price} credits</span>
                    <span className="text-sm text-muted-foreground">
                      {chapter.course_count} courses
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">
                      Revenue: {(chapter.price * (chapter.enrollment_count || 0))} credits
                    </span>
                  </div>
                  <Link to={`/teacher/chapter/${chapter.id}`}>
                    <Button className="w-full btn-secondary group-hover:scale-105 transition-transform">
                      Manage Chapter
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateChapterModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onChapterCreated={handleChapterCreated}
      />
    </DashboardLayout>
  );
};