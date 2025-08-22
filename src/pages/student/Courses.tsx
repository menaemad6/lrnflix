import React, { useState, useEffect, useCallback } from 'react';
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
import WavesHeroHeader from '@/components/ui/WavesHeroHeader';
import { useTenant } from '@/contexts/TenantContext';
import { CourseCardSkeleton } from '@/components/student/skeletons/CourseCardSkeleton';
import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo/SEOHead';

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
  instructor_id?: string;
  avatar_url?: string; // NEW
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
  const { t } = useTranslation('dashboard');
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const bgClass = useRandomBackground();
  const { teacher } = useTenant();
  const [instructorAvatars, setInstructorAvatars] = useState<Record<string, string | undefined>>({});

  // Dynamic categories from course data
  const courseCategories = Array.from(new Set(courses.map(c => c.category).filter(Boolean)));
  const categories = ['All', ...courseCategories];

  const fetchCourses = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

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

      // Get all unique instructor_ids
      const instructorIds = Array.from(new Set((coursesData || []).map((c: RawCourse) => c.instructor_id).filter(Boolean)));
      // Fetch all avatars in one go
      const avatars: Record<string, string | undefined> = {};
      if (instructorIds.length > 0) {
        const { data: teachersData } = await supabase
          .from('teachers')
          .select('user_id, profile_image_url')
          .in('user_id', instructorIds);
        if (teachersData) {
          (teachersData as Array<{ user_id: string; profile_image_url?: string }>).forEach((t) => {
            avatars[t.user_id] = t.profile_image_url;
          });
        }
      }
      setInstructorAvatars(avatars);

      // Get user's enrollments
      let enrolledCourseIds: string[] = [];
      if (user) {
        const { data: enrollments, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('student_id', user.id);
        if (enrollmentError) throw enrollmentError;
        enrolledCourseIds = enrollments?.map((e: { course_id: string }) => e.course_id) || [];
      }

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
            avatar_url: avatars[course.instructor_id] // NEW
          };
        })
      );

      setCourses(coursesWithDetails);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error fetching courses:', err);
      toast({
        title: t('courses.error'),
        description: t('courses.failedToLoadCourses'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [teacher, toast]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const enrollInCourse = async (courseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { error } = await supabase
        .from('enrollments')
        .insert({
          student_id: user.id,
          course_id: courseId
        });

      if (error) throw error;

      toast({
        title: t('courses.success'),
        description: t('courses.enrolledSuccessfully'),
      });

      fetchCourses();
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error enrolling in course:', err);
      toast({
        title: t('courses.error'),
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

  return (
    <>
      <SEOHead />
      <div className={bgClass + " min-h-screen bg-gradient-to-br from-background via-background to-primary/5 "}>
        {/* Header - full width, top of page */}
        <WavesHeroHeader
          title={<span className='text-primary'>{t('courses.title')}</span>}
          description={t('courses.subtitle')}
        />
      <div className="container mx-auto px-2 sm:px-4 space-y-8">
        {/* Filters - overlap header */}
        <Card className="glass-card w-full max-w-full -mt-12">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('courses.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 glass"
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full md:w-auto ${
                      selectedCategory === category
                        ? 'bg-primary text-white font-bold border-2 border-primary shadow-lg px-5 py-2 rounded-full transition-all duration-200 hover:bg-primary/80 hover:text-white'
                        : 'bg-background text-foreground border border-border hover:bg-primary/10 hover:text-primary px-5 py-2 rounded-full transition-all duration-200'
                    }`}
                    variant="ghost"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid or Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full">
            {[...Array(6)].map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : (
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
                avatar_url={course.avatar_url}
                onPreview={() => navigate(`/courses/${course.id}`)}
                onEnroll={() => enrollInCourse(course.id)}
                onContinue={() => navigate(`/courses/${course.id}`)}
              />
            ))}
          </div>
        )}

        {!loading && filteredCourses.length === 0 && (
          <Card className="glass-card w-full max-w-full">
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('courses.noCoursesFound')}</h3>
              <p className="text-muted-foreground">
                {t('courses.tryAdjustingSearchCriteria')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </>
  );
};
