import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CreateChapterModal } from '@/components/chapters/CreateChapterModal';

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

export const TeacherChaptersPage = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold gradient-text">Chapter Management</h2>
            <p className="text-muted-foreground mt-1">Create and manage your educational chapters</p>
          </div>
          <Button 
            className="btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chapter
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : chapters.length === 0 ? (
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
            {chapters.map((chapter) => (
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