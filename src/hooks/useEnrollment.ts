import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { EnrollmentSource } from '@/types/enrollment';
import { enrollInCourseWithValidation, enrollInChapterWithValidation } from '@/utils/enrollmentUtils';

interface EnrollmentOptions {
  source: EnrollmentSource;
  discountCode?: string;
}

interface UseEnrollmentReturn {
  enrollInCourse: (courseId: string, options?: EnrollmentOptions) => Promise<boolean>;
  enrollInChapter: (chapterId: string, options?: EnrollmentOptions) => Promise<boolean>;
  isEnrolling: boolean;
}

export const useEnrollment = (): UseEnrollmentReturn => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const { toast } = useToast();

  const enrollInCourse = async (courseId: string, options: EnrollmentOptions = { source: 'direct' }): Promise<boolean> => {
    try {
      setIsEnrolling(true);

      const result = await enrollInCourseWithValidation(courseId, options.source, options.discountCode);

      if (result.success) {
        toast({
          title: 'Enrollment Successful',
          description: result.message,
        });
        return true;
      } else {
        toast({
          title: 'Enrollment Failed',
          description: result.message,
          variant: 'destructive',
        });
        return false;
      }
    } catch (error: unknown) {
      console.error('Error enrolling in course:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during enrollment';
      toast({
        title: 'Enrollment Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsEnrolling(false);
    }
  };

  const enrollInChapter = async (chapterId: string, options: EnrollmentOptions = { source: 'direct' }): Promise<boolean> => {
    try {
      setIsEnrolling(true);

      const result = await enrollInChapterWithValidation(chapterId, options.source);

      if (result.success) {
        toast({
          title: 'Enrollment Successful',
          description: result.message,
        });
        return true;
      } else {
        toast({
          title: 'Enrollment Failed',
          description: result.message,
          variant: 'destructive',
        });
        return false;
      }
    } catch (error: unknown) {
      console.error('Error enrolling in chapter:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during enrollment';
      toast({
        title: 'Enrollment Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsEnrolling(false);
    }
  };

  return {
    enrollInCourse,
    enrollInChapter,
    isEnrolling,
  };
};
