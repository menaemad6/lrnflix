import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface Chapter {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Array<{
    id: string;
    title: string;
    order_index: number;
  }>;
}

interface Lesson {
  id: string;
  title: string;
  chapter_id: string | null;
}

interface ChapterManagerProps {
  courseId: string;
}

export const ChapterManager = ({ courseId }: ChapterManagerProps) => {
  const { toast } = useToast();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewChapter, setShowNewChapter] = useState(false);
  const [newChapter, setNewChapter] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchChapters();
    fetchLessons();
  }, [courseId]);

  const fetchChapters = async () => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select(`
          *,
          lessons(id, title, order_index)
        `)
        .order('order_index');

      if (error) throw error;
      setChapters(data || []);
    } catch (error: any) {
      console.error('Error fetching chapters:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, chapter_id')
        .order('order_index');

      if (error) throw error;
      setLessons(data || []);
    } catch (error: any) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const createChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const maxOrder = Math.max(...chapters.map(c => c.order_index), -1);
      
      const { error } = await supabase
        .from('chapters')
        .insert({
          title: newChapter.title,
          description: newChapter.description,
          order_index: maxOrder + 1
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Chapter created successfully!',
      });

      setNewChapter({ title: '', description: '' });
      setShowNewChapter(false);
      fetchChapters();
    } catch (error: any) {
      console.error('Error creating chapter:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteChapter = async (chapterId: string) => {
    try {
      // First, remove chapter assignment from lessons
      await supabase
        .from('lessons')
        .update({ chapter_id: null })
        .eq('chapter_id', chapterId);

      // Then delete the chapter
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapterId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Chapter deleted successfully!',
      });

      fetchChapters();
      fetchLessons();
    } catch (error: any) {
      console.error('Error deleting chapter:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const moveChapter = async (chapterId: string, direction: 'up' | 'down') => {
    try {
      const chapter = chapters.find(c => c.id === chapterId);
      if (!chapter) return;

      const targetIndex = direction === 'up' ? chapter.order_index - 1 : chapter.order_index + 1;
      const targetChapter = chapters.find(c => c.order_index === targetIndex);
      
      if (!targetChapter) return;

      // Swap order indices
      await supabase
        .from('chapters')
        .update({ order_index: targetIndex })
        .eq('id', chapterId);

      await supabase
        .from('chapters')
        .update({ order_index: chapter.order_index })
        .eq('id', targetChapter.id);

      fetchChapters();
    } catch (error: any) {
      console.error('Error moving chapter:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const assignLessonToChapter = async (lessonId: string, chapterId: string | null) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ chapter_id: chapterId })
        .eq('id', lessonId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Lesson assignment updated!',
      });

      fetchChapters();
      fetchLessons();
    } catch (error: any) {
      console.error('Error assigning lesson:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Loading chapters...</div>;
  }

  const unassignedLessons = lessons.filter(lesson => !lesson.chapter_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Course Chapters</h2>
        <Button onClick={() => setShowNewChapter(!showNewChapter)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Chapter
        </Button>
      </div>

      {showNewChapter && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Chapter</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createChapter} className="space-y-4">
              <Input
                placeholder="Chapter title"
                value={newChapter.title}
                onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                required
              />
              <Textarea
                placeholder="Chapter description"
                value={newChapter.description}
                onChange={(e) => setNewChapter({ ...newChapter, description: e.target.value })}
                rows={3}
              />
              <div className="flex gap-2">
                <Button type="submit">Create Chapter</Button>
                <Button type="button" variant="outline" onClick={() => setShowNewChapter(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {chapters.map((chapter, index) => (
          <Card key={chapter.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5" />
                  <div>
                    <CardTitle>{chapter.title}</CardTitle>
                    {chapter.description && (
                      <p className="text-sm text-muted-foreground mt-1">{chapter.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => moveChapter(chapter.id, 'up')}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => moveChapter(chapter.id, 'down')}
                    disabled={index === chapters.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteChapter(chapter.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Lessons ({chapter.lessons?.length || 0})
                </h4>
                {chapter.lessons && chapter.lessons.length > 0 ? (
                  <div className="space-y-1">
                    {chapter.lessons
                      .sort((a, b) => a.order_index - b.order_index)
                      .map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">{lesson.title}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => assignLessonToChapter(lesson.id, null)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No lessons assigned to this chapter</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {unassignedLessons.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Unassigned Lessons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {unassignedLessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{lesson.title}</span>
                    <Select onValueChange={(chapterId) => assignLessonToChapter(lesson.id, chapterId)}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Assign to chapter" />
                      </SelectTrigger>
                      <SelectContent>
                        {chapters.map((chapter) => (
                          <SelectItem key={chapter.id} value={chapter.id}>
                            {chapter.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {chapters.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No chapters yet</h3>
              <p className="text-muted-foreground">Create chapters to organize your course content.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
