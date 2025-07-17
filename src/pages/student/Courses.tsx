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
import { PremiumCourseCard } from '@/components/courses/PremiumCourseCard';
import AuroraHeroHeader from '@/components/ui/AuroraHeroHeader';
import { useTenant } from '@/contexts/TenantContext';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  instructor_name: string;
  enrollment_count: number;
  is_enrolled: boolean;
  enrollment_code: string;
  cover_image_url?: string;
  created_at?: string;
  price?: number;
}

interface RawCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  instructor_id: string;
  enrollment_code: string;
  cover_image_url?: string;
  created_at?: string;
  price?: number;
  profiles?: { full_name?: string };
}

export const Courses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const bgClass = useRandomBackground();
  const { teacher } = useTenant();

  const categories = ['All', 'Technology', 'Business', 'Design', 'Marketing', 'Development'];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get published courses with instructor info
      let coursesQuery = supabase
        .from('courses')
        .select(`
          *,
          profiles!courses_instructor_id_fkey(full_name)
        `)
        .eq('status', 'published');

      if (teacher) {
        coursesQuery = coursesQuery.eq('instructor_id', teacher.user_id);
      }

      const { data: coursesData, error: coursesError } = await coursesQuery;

      if (coursesError) {
        console.error('Courses query error:', coursesError);
        throw coursesError;
      }

      // Get user's enrollments
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', user.id);

      if (enrollmentError) throw enrollmentError;

      const enrolledCourseIds = enrollments?.map((e: { course_id: string }) => e.course_id) || [];

      // Get enrollment counts for each course
      const coursesWithDetails = await Promise.all(
        (coursesData || []).map(async (course: RawCourse) => {
          const { count } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id);

          return {
            ...course,
            instructor_name: course.profiles?.full_name || 'Unknown',
            enrollment_count: count || 0,
            is_enrolled: enrolledCourseIds.includes(course.id),
            cover_image_url: course.cover_image_url || undefined,
            created_at: course.created_at,
            price: course.price,
          };
        })
      );

      setCourses(coursesWithDetails);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error fetching courses:', err);
      toast({
        title: 'Error',
        description: 'Failed to load courses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('enrollments')
        .insert({
          student_id: user.id,
          course_id: courseId
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Successfully enrolled in course!',
      });

      fetchCourses();
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error enrolling in course:', err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const filteredCourses = courses.filter((course: Course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.enrollment_code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
      <div className="container mx-auto px-2 sm:px-4 space-y-8  pt-[100px]">
        {/* Header */}
        <AuroraHeroHeader
          title={<span>Explore <span className="gradient-text">Courses</span></span>}
          subtitle="Discover amazing courses and expand your knowledge with expert instructors"
          
        />

        {/* Filters */}
        <Card className="glass-card w-full max-w-full">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by course name, description, or enrollment code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 glass"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className={`glass hover-glow ${
                      selectedCategory === category ? 'glow' : ''
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        <div className="w-full overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full">
            {filteredCourses.map((course: Course) => (
              <PremiumCourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                category={course.category}
                status={course.status}
                instructor_name={course.instructor_name}
                enrollment_count={course.enrollment_count}
                is_enrolled={course.is_enrolled}
                enrollment_code={course.enrollment_code}
                cover_image_url={course.cover_image_url}
                created_at={course.created_at}
                price={course.price}
                onPreview={() => navigate(`/courses/${course.id}`)}
                onEnroll={() => enrollInCourse(course.id)}
                onContinue={() => navigate(`/courses/${course.id}`)}
              />
            ))}
          </div>
        </div>

        {filteredCourses.length === 0 && (
          <Card className="glass-card w-full max-w-full">
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or explore different categories.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
