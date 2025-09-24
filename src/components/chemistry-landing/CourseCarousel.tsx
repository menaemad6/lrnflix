import React from 'react';
import { motion } from 'framer-motion';
import { PremiumCarousel } from '@/components/ui/premium-carousel';
import { PremiumCourseCard } from '@/components/courses/PremiumCourseCard';

export interface Course {
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
  avatar_url?: string;
}

export interface CourseCarouselProps {
  courses: Course[];
  className?: string;
  showArrows?: boolean;
  showDots?: boolean;
  autoPlay?: boolean;
  itemsPerView?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  onCourseClick?: (course: Course) => void;
}

const CourseCard: React.FC<{ course: Course; onCourseClick?: (course: Course) => void }> = ({ 
  course, 
  onCourseClick 
}) => {
  return (
    <PremiumCourseCard
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
      onPreview={() => onCourseClick?.(course)}
      onEnroll={() => onCourseClick?.(course)}
      onContinue={() => onCourseClick?.(course)}
    />
  );
};

export const CourseCarousel: React.FC<CourseCarouselProps> = ({
  courses,
  className,
  showArrows = true,
  showDots = true,
  autoPlay = true,
  itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 3
  },
  onCourseClick
}) => {
  return (
    <div className={className}>
      <PremiumCarousel
        showArrows={showArrows}
        showDots={showDots}
        autoPlay={autoPlay}
        autoPlayInterval={6000}
        pauseOnHover={true}
        itemsPerView={itemsPerView}
        spacing={32}
        overlayPosition="right"
        overlayColor="primary"
        overlayOpacity={0.15}
        showPlayPause={true}
        className="w-full"
      >
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onCourseClick={onCourseClick}
          />
        ))}
      </PremiumCarousel>
    </div>
  );
};
