import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Search, Plus } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number;
  chapter_id: string | null;
}

interface AddCourseToChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterId: string;
  onCourseAdded: () => void;
}

export const AddCourseToChapterModal = ({ isOpen, onClose, chapterId, onCourseAdded }: AddCourseToChapterModalProps) => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableCourses();
    }
  }, [isOpen]);

  const fetchAvailableCourses = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get teacher's courses that are not in any chapter or not in this chapter
      const { data: coursesData, error } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', user.id)
        .is('chapter_id', null);

      if (error) throw error;
      setCourses(coursesData || []);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load courses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (courseId: string) => {
    try {
      setAdding(courseId);
      const course = courses.find(c => c.id === courseId);
      if (!course) throw new Error('Course not found');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');
      // Create chapter_object for the course
      const { error: objectError } = await supabase.from('chapter_objects').insert({
        chapter_id: chapterId,
        object_type: 'course',
        object_id: course.id,
        shared_by: user.id,
      });
      if (objectError) throw objectError;
      // Enroll all students in the chapter who are not already enrolled in the course
      const { data: chapterEnrollments, error: enrollmentsError } = await supabase
        .from('chapter_enrollments')
        .select('student_id')
        .eq('chapter_id', chapterId);
      if (enrollmentsError) throw enrollmentsError;
      const { data: courseEnrollments, error: courseEnrollmentsError } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('course_id', course.id);
      if (courseEnrollmentsError) throw courseEnrollmentsError;
      const alreadyEnrolled = new Set((courseEnrollments || []).map(e => e.student_id));
      const toEnroll = (chapterEnrollments || [])
        .map(e => e.student_id)
        .filter(studentId => !alreadyEnrolled.has(studentId));
      if (toEnroll.length > 0) {
        const { error: enrollError } = await supabase
          .from('enrollments')
          .upsert(
            toEnroll.map(studentId => ({ course_id: course.id, student_id: studentId , source: 'chapter_purchase' })),
            { onConflict: 'course_id,student_id' }
          );
        if (enrollError) throw enrollError;
      }
      toast({
        title: 'Success',
        description: 'Course added to chapter successfully',
      });
      setCourses(courses.filter(course => course.id !== courseId));
      onCourseAdded();
    } catch (error: any) {
      console.error('Error adding course:', error);
      toast({
        title: 'Error',
        description: 'Failed to add course to chapter',
        variant: 'destructive',
      });
    } finally {
      setAdding(null);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary">Add Course to Chapter</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass"
            />
          </div>

          {/* Courses List */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Available Courses</h3>
                <p className="text-muted-foreground">
                  {courses.length === 0 
                    ? "All your courses are already in chapters or you haven't created any courses yet."
                    : "No courses match your search criteria."
                  }
                </p>
              </div>
            ) : (
              filteredCourses.map((course) => (
                <div key={course.id} className="border border-white/10 rounded-lg p-4 glass-card">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{course.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                              {course.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {course.price} credits
                            </span>
                          </div>
                        </div>
                      </div>
                      {course.description && (
                        <p className="text-sm text-muted-foreground ml-11">
                          {course.description}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleAddCourse(course.id)}
                      disabled={adding === course.id}
                      className=" ml-4"
                      variant="default"
                    >
                      {adding === course.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose} className="glass">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};