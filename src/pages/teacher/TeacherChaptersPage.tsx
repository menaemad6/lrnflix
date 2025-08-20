import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CreateChapterModal } from '@/components/chapters/CreateChapterModal';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { Input } from '@/components/ui/input';
import { useTeacherChapters } from '@/lib/queries';

interface Chapter {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number;
  created_at: string;
  course_count?: number;
  enrollment_count?: number;
  cover_image_url?: string;
}

const ChapterCardSkeleton = React.lazy(() => import('@/components/student/skeletons/ChapterCardSkeleton').then(m => ({ default: m.ChapterCardSkeleton })));

export const TeacherChaptersPage = () => {
  const { data: chapters = [], isLoading, refetch } = useTeacherChapters();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleChapterCreated = () => {
    refetch();
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
        {isLoading ? (
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
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
                <Sparkles className="h-10 w-10 text-primary-400" />
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
                <CardHeader className="p-0">
                  {/* Thumbnail Image */}
                  <div className="w-full h-48 overflow-hidden rounded-t-xl">
                    {chapter.cover_image_url ? (
                      <img
                        src={chapter.cover_image_url}
                        alt={chapter.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                        <Sparkles className="h-16 w-16 text-primary-400/60" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-primary-400 transition-colors">
                          {chapter.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={chapter.status === 'published' ? 'default' : 'outline'} 
                                 className={chapter.status === 'published' ? 'bg-primary-500 text-black' : ''}>
                            {chapter.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {chapter.enrollment_count || 0} students
                          </span>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-sm">{chapter.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-primary">{chapter.price} credits</span>
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