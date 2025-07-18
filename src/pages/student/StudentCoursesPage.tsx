
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PremiumCourseCard } from '@/components/courses/PremiumCourseCard';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Trophy, Play, Sparkles } from 'lucide-react';
import type { RootState } from '@/store/store';
import { useTenant } from '@/contexts/TenantContext';
import DashboardModernHeader from '@/components/ui/DashboardModernHeader';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { useCourseProgress } from '@/hooks/useCourseProgress';

interface EnrolledCourse {
  id: string;
  course: {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    instructor_name?: string;
    cover_image_url?: string;
    enrollment_code?: string;
    created_at: string;
    instructor_id?: string;
    profiles?: { full_name?: string };
    avatar_url?: string; // NEW
  };
  enrolled_at: string;
  progress?: number;
  totalLessons?: number;
  completedLessons?: number;
  enrollment_count?: number;
}

export const StudentCoursesPage = () => {
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const { teacher } = useTenant();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const [instructorAvatars, setInstructorAvatars] = useState<Record<string, string | undefined>>({});

  // Dynamically get unique categories from enrolledCourses
  const courseCategories = Array.from(new Set(enrolledCourses.map(e => e.course.category).filter(Boolean)));
  const categories = ['All', ...courseCategories];

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      if (!user) throw new Error('Not authenticated');

      let enrollmentsQuery = supabase
        .from('enrollments')
        .select(`
          id,
          enrolled_at,
          course:courses (
            id,
            title,
            description,
            category,
            price,
            cover_image_url,
            enrollment_code,
            created_at,
            instructor_id,
            profiles!courses_instructor_id_fkey(full_name)
          )
        `)
        .eq('student_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (teacher) {
        enrollmentsQuery = enrollmentsQuery.filter('course.instructor_id', 'eq', teacher.user_id);
      }

      const { data: enrollmentsData, error: enrollmentsError } = await enrollmentsQuery;

      if (enrollmentsError) throw enrollmentsError;

      // Fetch all unique instructor_ids
      const instructorIds = Array.from(new Set((enrollmentsData as EnrolledCourse[] || [])
        .map(e => e.course?.instructor_id)
        .filter(Boolean)));
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

      const coursesWithProgress = await Promise.all(
        (enrollmentsData as EnrolledCourse[] || [])
          .filter((enrollment) => enrollment.course && enrollment.course.id)
          .map(async (enrollment) => {
            // Only count lessons for progress calculation
            const { count: totalLessons } = await supabase
              .from('lessons')
              .select('*', { count: 'exact', head: true })
              .eq('course_id', enrollment.course.id);

            // Get all lesson IDs for this course
            const { data: lessonsData } = await supabase
              .from('lessons')
              .select('id')
              .eq('course_id', enrollment.course.id);

            const lessonIds = lessonsData?.map(l => l.id) || [];

            // Count completed lessons
            const { count: completedLessons } = await supabase
              .from('lesson_progress')
              .select('*', { count: 'exact', head: true })
              .eq('student_id', user.id)
              .in('lesson_id', lessonIds);

            // Get enrollment count for this course
            const { count: enrollmentCount } = await supabase
              .from('enrollments')
              .select('*', { count: 'exact', head: true })
              .eq('course_id', enrollment.course.id);

            const progress = totalLessons ? Math.round((completedLessons || 0) / totalLessons * 100) : 0;

            return {
              ...enrollment,
              course: {
                ...enrollment.course,
                instructor_name: enrollment.course.profiles?.full_name || "Course Instructor",
                avatar_url: avatars[enrollment.course.instructor_id] // NEW
              },
              progress,
              totalLessons: totalLessons || 0,
              completedLessons: completedLessons || 0,
              enrollment_count: enrollmentCount || 0
            };
          })
      );

      setEnrolledCourses(coursesWithProgress);
    } catch (error: unknown) {
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

  // Filter logic for search and category
  const filteredCourses = enrolledCourses.filter((enrollment) => {
    const course = enrollment.course;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.enrollment_code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Child component to show course card with real progress
  const StudentCourseCardWithProgress = ({ enrollment, userId }: { enrollment: EnrolledCourse, userId: string }) => {
    const progress = useCourseProgress(enrollment.course.id, userId);
    return (
      <PremiumCourseCard
        key={enrollment.id}
        id={enrollment.course.id}
        title={enrollment.course.title}
        description={enrollment.course.description}
        category={enrollment.course.category}
        status="Active"
        instructor_name={enrollment.course.instructor_name}
        enrollment_count={enrollment.enrollment_count || 0}
        is_enrolled={true}
        enrollment_code={enrollment.course.enrollment_code || ""}
        cover_image_url={enrollment.course.cover_image_url}
        created_at={enrollment.course.created_at}
        price={enrollment.course.price}
        progress={progress.progressPercentage}
        isHovering={true}
        avatar_url={enrollment.course.avatar_url}
        onPreview={() => {}}
        onEnroll={() => {}}
        onContinue={() => {
          navigate(`/courses/${enrollment.course.id}`);
        }}
      />
    );
  };

  return (
    <DashboardLayout>
      <DashboardModernHeader
        title="My Learning Journey"
        subtitle="Continue your progress and discover new skills"
        buttonText="Explore Courses"
        onButtonClick={() => navigate('/courses')}
      />
      <div className="space-y-6">
        {/* Search and Filters as a row with dropdown */}
        <Card className="glass-card w-full max-w-full">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-row gap-4 w-full items-center">
              {/* Search input */}
              <div className="flex-1 min-w-0 w-full">
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by course name or description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 glass"
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                  />
                </div>
              </div>
              {/* Dropdown for categories */}
              <div className={`${searchFocused ? 'hidden sm:block' : ''}`}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 min-w-[140px] justify-between"
                    >
                      <span>{selectedCategory}</span>
                      <ChevronDown className="h-4 w-4 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {categories.map((category) => (
                      <DropdownMenuItem
                        key={category}
                        onSelect={() => setSelectedCategory(category)}
                        className={
                          selectedCategory === category
                            ? 'bg-emerald-500 text-white font-semibold'
                            : ''
                        }
                      >
                        {category}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <Card className="glass-card border-0 hover-glow">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
                <BookOpen className="h-10 w-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 gradient-text">No courses found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Try adjusting your search criteria or explore different categories.
              </p>
              <Link to="/courses">
                <Button className="btn-primary">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((enrollment) => (
              <StudentCourseCardWithProgress key={enrollment.id} enrollment={enrollment} userId={user?.id} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
