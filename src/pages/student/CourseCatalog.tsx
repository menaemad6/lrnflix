
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor_id: string;
  enrollment_code: string;
}

export const CourseCatalog = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollmentCode, setEnrollmentCode] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchPublishedCourses();
  }, []);

  const fetchPublishedCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
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

  const handleEnrollWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrolling(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to enroll');
      }

      // Find course by enrollment code
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('enrollment_code', enrollmentCode.toUpperCase())
        .single();

      if (courseError) {
        throw new Error('Invalid enrollment code');
      }

      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', user.id)
        .eq('course_id', course.id)
        .single();

      if (existingEnrollment) {
        throw new Error('You are already enrolled in this course');
      }

      // Enroll student
      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          student_id: user.id,
          course_id: course.id
        });

      if (enrollmentError) throw enrollmentError;

      toast({
        title: 'Success',
        description: `Successfully enrolled in ${course.title}!`,
      });
      
      setEnrollmentCode('');
      navigate('/student/dashboard');
    } catch (error: any) {
      console.error('Error enrolling:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setEnrolling(false);
    }
  };

  const handleEnrollInCourse = async (courseId: string, courseTitle: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to enroll');
      }

      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (existingEnrollment) {
        toast({
          title: 'Already Enrolled',
          description: 'You are already enrolled in this course',
        });
        return;
      }

      // Enroll student
      const { error } = await supabase
        .from('enrollments')
        .insert({
          student_id: user.id,
          course_id: courseId
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Successfully enrolled in ${courseTitle}!`,
      });
    } catch (error: any) {
      console.error('Error enrolling:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Catalog</CardTitle>
            <CardDescription>
              Discover and enroll in courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEnrollWithCode} className="flex gap-2">
              <Input
                placeholder="Enter enrollment code"
                value={enrollmentCode}
                onChange={(e) => setEnrollmentCode(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={enrolling || !enrollmentCode}>
                {enrolling ? 'Enrolling...' : 'Enroll'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {course.title}
                </CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {course.category && (
                    <Badge variant="outline">{course.category}</Badge>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleEnrollInCourse(course.id, course.title)}
                      className="flex-1"
                    >
                      Enroll Now
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No published courses available yet.
          </div>
        )}
      </div>
    </div>
  );
};
