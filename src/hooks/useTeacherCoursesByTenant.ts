import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type CourseWithCount = Database['public']['Tables']['courses']['Row'] & { 
  enrollment_count: number;
};

interface UseTeacherCoursesByTenantOptions {
  instructorId?: string;
  limit?: number;
  includeEnrollmentCount?: boolean;
}

interface UseTeacherCoursesByTenantReturn {
  courses: CourseWithCount[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTeacherCoursesByTenant = ({
  instructorId,
  limit,
  includeEnrollmentCount = true
}: UseTeacherCoursesByTenantOptions = {}): UseTeacherCoursesByTenantReturn => {
  const [courses, setCourses] = useState<CourseWithCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    if (!instructorId) {
      setCourses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch courses for the specific instructor
      let coursesQuery = supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', instructorId)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (limit) {
        coursesQuery = coursesQuery.limit(limit);
      }

      const { data: coursesData, error: coursesError } = await coursesQuery;

      if (coursesError) {
        throw coursesError;
      }

      if (!coursesData || coursesData.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }

      if (includeEnrollmentCount) {
        // Get enrollment counts for each course
        const coursesWithCounts = await Promise.all(
          coursesData.map(async (course) => {
            const { count } = await supabase
              .from('enrollments')
              .select('*', { count: 'exact', head: true })
              .eq('course_id', course.id);
            return { ...course, enrollment_count: count || 0 };
          })
        );
        setCourses(coursesWithCounts);
      } else {
        // Set courses without enrollment counts
        const coursesWithoutCounts = coursesData.map(course => ({
          ...course,
          enrollment_count: 0
        }));
        setCourses(coursesWithoutCounts);
      }
    } catch (err) {
      console.error('Error fetching teacher courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [instructorId, limit, includeEnrollmentCount]);

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses
  };
};
