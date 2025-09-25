import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import { CourseCarousel, type Course } from './CourseCarousel';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';
import { useTeacherCoursesByTenant } from '@/hooks/useTeacherCoursesByTenant';

// Fallback dummy data will be moved inside component to use translations

export const LatestCourses = () => {
  const { t } = useTranslation('landing');
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const navigate = useNavigate();
  const { teacher } = useTenant();

  // Fallback dummy data for when no real courses are available
  const fallbackCoursesData: Course[] = [
    {
      id: '1',
      title: t('courses.organicBasics'),
      description: t('courses.organicBasicsDesc'),
      category: 'كيمياء عضوية',
      status: 'published',
      instructor_name: 'د. أحمد محمد',
      enrollment_count: 156,
      is_enrolled: false,
      enrollment_code: 'CHEM101',
      cover_image_url: undefined,
      created_at: '2024-01-15T10:00:00Z',
      price: 0,
      instructor_id: 'instructor1',
      avatar_url: undefined,
    },
    {
      id: '2',
      title: t('courses.advancedReactions'),
      description: t('courses.advancedReactionsDesc'),
      category: 'كيمياء تطبيقية',
      status: 'published',
      instructor_name: 'د. فاطمة علي',
      enrollment_count: 203,
      is_enrolled: false,
      enrollment_code: 'CHEM201',
      cover_image_url: undefined,
      created_at: '2024-01-20T10:00:00Z',
      price: 199,
      instructor_id: 'instructor2',
      avatar_url: undefined,
    },
    {
      id: '3',
      title: t('courses.periodicTable'),
      description: t('courses.periodicTableDesc'),
      category: 'كيمياء أساسية',
      status: 'published',
      instructor_name: 'د. محمد حسن',
      enrollment_count: 89,
      is_enrolled: false,
      enrollment_code: 'CHEM102',
      cover_image_url: undefined,
      created_at: '2024-01-25T10:00:00Z',
      price: 149,
      instructor_id: 'instructor3',
      avatar_url: undefined,
    },
  ];

  // Fetch real courses using the hook
  const { courses: realCourses, loading: coursesLoading, error: coursesError } = useTeacherCoursesByTenant({
    instructorId: teacher?.user_id,
    limit: 6, // Limit to 6 courses for the carousel
    includeEnrollmentCount: true
  });

  // Transform real courses to match the Course interface expected by CourseCarousel
  const transformedCourses: Course[] = realCourses.map(course => ({
    id: course.id,
    title: course.title,
    description: course.description || '',
    category: course.category || '',
    status: course.status || 'published',
    instructor_name: teacher?.display_name || 'Instructor',
    enrollment_count: course.enrollment_count,
    is_enrolled: false,
    enrollment_code: course.enrollment_code || '',
    cover_image_url: course.cover_image_url || undefined,
    created_at: course.created_at,
    price: course.price || 0,
    instructor_id: course.instructor_id,
    avatar_url: teacher?.profile_image_url || undefined,
  }));

  // Use real courses if available, otherwise fallback to dummy data
  const coursesData = transformedCourses.length > 0 ? transformedCourses : fallbackCoursesData;

  const handleCourseClick = (course: Course) => {
    console.log('Course clicked:', course);
    // Navigate to course details
    navigate(`/courses/${course.id}`);
  };

  return (
    <section className="py-20 relative overflow-hidden" ref={ref}>
      <div className="container-responsive relative z-10">
        <SectionHeader
          title={t('courses.title')}
          subtitle={t('courses.subtitle')}
          variant="premium"
        />
      </div>

      {/* Full Width Course Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-12 w-full px-3 lg:px-12"
      >
        {coursesLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : coursesError ? (
          <div className="text-center text-destructive py-20">
            <p className="text-lg">Error loading courses: {coursesError}</p>
            <p className="text-sm text-muted-foreground mt-2">Showing sample courses instead</p>
          </div>
        ) : null}
        
        <CourseCarousel
          courses={coursesData}
          showArrows={true}
          showDots={true}
          autoPlay={true}
          itemsPerView={{
            mobile: 1,
            tablet: 2,
            desktop: 3
          }}
          onCourseClick={handleCourseClick}
          className="w-full"
        />
      </motion.div>

      {/* Bottom CTA */}
      <div className="container-responsive relative z-10">
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          <Button size="lg" className="btn-secondary" onClick={() => navigate('/courses')}>
            {t('courses.viewAll')}
          </Button>
        </motion.div>
      </div>
    </section>
  );
};