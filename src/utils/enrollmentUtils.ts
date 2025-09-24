import { supabase } from '@/integrations/supabase/client';
import { EnrollmentResult, EnrollmentSource } from '@/types/enrollment';

/**
 * Automatically enrolls a student in a course when their invoice is confirmed
 */
export const enrollStudentInCourse = async (
  studentId: string,
  courseId: string,
  source: EnrollmentSource = 'invoice'
): Promise<EnrollmentResult> => {
  try {
    console.log('enrollStudentInCourse called with:', { studentId, courseId });
    
    // Check if student is already enrolled
    const { data: existingEnrollment, error: checkError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', courseId)
      .eq('student_id', studentId)
      .single();

    console.log('Check existing enrollment result:', { existingEnrollment, checkError });

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is expected if not enrolled
      console.error('Error checking existing enrollment:', checkError);
      return {
        success: false,
        message: 'Failed to check existing enrollment',
        error: checkError.message
      };
    }

    // If already enrolled, return success
    if (existingEnrollment) {
      console.log('Student already enrolled, returning success');
      return {
        success: true,
        message: 'Student already enrolled in this course',
        enrollmentId: existingEnrollment.id
      };
    }

    console.log('Creating new enrollment...');
    
    // Create new enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .insert({
        course_id: courseId,
        student_id: studentId,
        enrolled_at: new Date().toISOString(),
        source: source
      })
      .select()
      .single();

    console.log('Create enrollment result:', { enrollment, enrollmentError });

    if (enrollmentError) {
      console.error('Error creating enrollment:', enrollmentError);
      return {
        success: false,
        message: 'Failed to create enrollment',
        error: enrollmentError.message
      };
    }

    console.log('Enrollment created successfully:', enrollment);
    
    return {
      success: true,
      message: 'Student successfully enrolled in course',
      enrollmentId: enrollment.id
    };
  } catch (error) {
    console.error('Error in enrollStudentInCourse:', error);
    return {
      success: false,
      message: 'Unexpected error during enrollment',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Automatically enrolls a student in a chapter when their invoice is confirmed
 */
export const enrollStudentInChapter = async (
  studentId: string,
  chapterId: string,
  source: EnrollmentSource = 'invoice'
): Promise<EnrollmentResult> => {
  try {
    console.log('enrollStudentInChapter called with:', { studentId, chapterId });
    
    // Check if student is already enrolled
    const { data: existingEnrollment, error: checkError } = await supabase
      .from('chapter_enrollments')
      .select('id')
      .eq('chapter_id', chapterId)
      .eq('student_id', studentId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is expected if not enrolled
      console.error('Error checking existing chapter enrollment:', checkError);
      return {
        success: false,
        message: 'Failed to check existing chapter enrollment',
        error: checkError.message
      };
    }

    // If already enrolled, return success
    if (existingEnrollment) {
      console.log('Student already enrolled in chapter, returning success');
      return {
        success: true,
        message: 'Student already enrolled in this chapter',
        enrollmentId: existingEnrollment.id
      };
    }

    console.log('Creating new chapter enrollment...');
    
    // Create new chapter enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('chapter_enrollments')
      .insert({
        chapter_id: chapterId,
        student_id: studentId,
        enrolled_at: new Date().toISOString()
      })
      .select()
      .single();

    if (enrollmentError) {
      console.error('Error creating chapter enrollment:', enrollmentError);
      return {
        success: false,
        message: 'Failed to create chapter enrollment',
        error: enrollmentError.message
      };
    }

    console.log('Chapter enrollment created successfully, now enrolling in chapter courses...');

    // Now enroll the student in all courses within this chapter
    // First, get courses that have this chapter_id directly
    const { data: directCourses, error: directCoursesError } = await supabase
      .from('courses')
      .select('id')
      .eq('chapter_id', chapterId)
      .eq('status', 'published');

    if (directCoursesError) {
      console.error('Error fetching direct chapter courses:', directCoursesError);
      // Don't fail the entire enrollment, just log the error
    } else if (directCourses && directCourses.length > 0) {
      console.log(`Found ${directCourses.length} direct courses in chapter`);
      
      for (const course of directCourses) {
        try {
          // Check if already enrolled in this course
          const { data: existingCourseEnrollment } = await supabase
            .from('enrollments')
            .select('id')
            .eq('course_id', course.id)
            .eq('student_id', studentId)
            .single();

          if (!existingCourseEnrollment) {
            // Enroll in the course
            const { error: courseEnrollmentError } = await supabase
              .from('enrollments')
              .insert({
                course_id: course.id,
                student_id: studentId,
                enrolled_at: new Date().toISOString(),
                source: source
              });

            if (courseEnrollmentError) {
              console.error(`Error enrolling in course ${course.id}:`, courseEnrollmentError);
            } else {
              console.log(`Successfully enrolled in course ${course.id}`);
            }
          } else {
            console.log(`Already enrolled in course ${course.id}`);
          }
        } catch (courseError) {
          console.error(`Error processing course ${course.id}:`, courseError);
        }
      }
    } else {
      console.log('No direct courses found in chapter, this is normal for new chapters');
    }

    // Also enroll in courses from chapter_objects (if object_type is 'course')
    const { data: chapterObjects, error: chapterObjectsError } = await supabase
      .from('chapter_objects')
      .select('object_id')
      .eq('chapter_id', chapterId)
      .eq('object_type', 'course')
      .not('object_id', 'is', null);

    if (chapterObjectsError) {
      console.error('Error fetching chapter object courses:', chapterObjectsError);
      // Don't fail the entire enrollment, just log the error
    } else if (chapterObjects && chapterObjects.length > 0) {
      console.log(`Found ${chapterObjects.length} courses in chapter_objects`);
      
      for (const obj of chapterObjects) {
        if (obj.object_id) {
          try {
            // Check if course exists and is published
            const { data: course, error: courseCheckError } = await supabase
              .from('courses')
              .select('id')
              .eq('id', obj.object_id)
              .eq('status', 'published')
              .single();

            if (courseCheckError || !course) {
              console.log(`Course ${obj.object_id} not found or not published, skipping`);
              continue;
            }

            // Check if already enrolled in this course
            const { data: existingCourseEnrollment } = await supabase
              .from('enrollments')
              .select('id')
              .eq('course_id', obj.object_id)
              .eq('student_id', studentId)
              .single();

            if (!existingCourseEnrollment) {
              // Enroll in the course
              const { error: courseEnrollmentError } = await supabase
                .from('enrollments')
                .insert({
                  course_id: obj.object_id,
                  student_id: studentId,
                  enrolled_at: new Date().toISOString(),
                  source: 'chapter_purchase'
                });

              if (courseEnrollmentError) {
                console.error(`Error enrolling in course ${obj.object_id}:`, courseEnrollmentError);
              } else {
                console.log(`Successfully enrolled in course ${obj.object_id}`);
              }
            } else {
              console.log(`Already enrolled in course ${obj.object_id}`);
            }
          } catch (courseError) {
            console.error(`Error processing course ${obj.object_id}:`, courseError);
          }
        }
      }
    } else {
      console.log('No courses found in chapter_objects, this is normal for new chapters');
    }

    console.log('Chapter enrollment and course enrollment completed successfully');
    
    return {
      success: true,
      message: 'Student successfully enrolled in chapter and all chapter courses',
      enrollmentId: enrollment.id
    };
  } catch (error) {
    console.error('Error in enrollStudentInChapter:', error);
    return {
      success: false,
      message: 'Unexpected error during chapter enrollment',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Automatically enrolls a student in an item based on the invoice type
 */
export const enrollStudentFromInvoice = async (
  studentId: string,
  itemId: string,
  itemType: 'course' | 'chapter' | 'lesson' | 'quiz',
  source: EnrollmentSource = 'invoice'
): Promise<EnrollmentResult> => {
  try {
    console.log('enrollStudentFromInvoice called with:', { studentId, itemId, itemType });
    
    switch (itemType) {
      case 'course':
        console.log('Processing course enrollment...');
        return await enrollStudentInCourse(studentId, itemId, source);
      
      case 'chapter':
        console.log('Processing chapter enrollment...');
        return await enrollStudentInChapter(studentId, itemId, source);
      
      case 'lesson': {
        console.log('Processing lesson enrollment...');
        // For lessons, we need to get the course ID first
        const { data: lesson, error: lessonError } = await supabase
          .from('lessons')
          .select('course_id')
          .eq('id', itemId)
          .single();

        if (lessonError) {
          console.error('Error fetching lesson course:', lessonError);
          return {
            success: false,
            message: 'Failed to fetch lesson information',
            error: lessonError.message
          };
        }

        if (lesson?.course_id) {
          console.log('Lesson course_id found:', lesson.course_id);
          return await enrollStudentInCourse(studentId, lesson.course_id, source);
        } else {
          console.log('No course_id found for lesson');
          return {
            success: false,
            message: 'Lesson not associated with a course',
            error: 'No course_id found for lesson'
          };
        }
      }
      
      case 'quiz': {
        console.log('Processing quiz enrollment...');
        // For quizzes, we need to get the course ID first
        const { data: quiz, error: quizError } = await supabase
          .from('quizzes')
          .select('course_id')
          .eq('id', itemId)
          .single();

        if (quizError) {
          console.error('Error fetching quiz course:', quizError);
          return {
            success: false,
            message: 'Failed to fetch quiz information',
            error: quizError.message
          };
        }

        if (quiz?.course_id) {
          console.log('Quiz course_id found:', quiz.course_id);
          return await enrollStudentInCourse(studentId, quiz.course_id, source);
        } else {
          console.log('No course_id found for quiz');
          return {
            success: false,
            message: 'Quiz not associated with a course',
            error: 'No course_id found for quiz'
          };
        }
      }
      
      default:
        console.log('Unsupported item type:', itemType);
        return {
          success: false,
          message: 'Unsupported item type for enrollment',
          error: `Item type '${itemType}' is not supported`
        };
    }
  } catch (error) {
    console.error('Error in enrollStudentFromInvoice:', error);
    return {
      success: false,
      message: 'Unexpected error during enrollment',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Syncs course enrollments for a student who is already enrolled in a chapter
 * This is useful when courses are added to a chapter after the student's initial enrollment
 */
export const syncChapterCourseEnrollments = async (
  studentId: string,
  chapterId: string,
  source: EnrollmentSource = 'chapter_purchase'
): Promise<EnrollmentResult> => {
  try {
    console.log('syncChapterCourseEnrollments called with:', { studentId, chapterId });
    
    // Check if student is enrolled in the chapter
    const { data: chapterEnrollment, error: chapterCheckError } = await supabase
      .from('chapter_enrollments')
      .select('id')
      .eq('chapter_id', chapterId)
      .eq('student_id', studentId)
      .single();

    if (chapterCheckError) {
      console.error('Error checking chapter enrollment:', chapterCheckError);
      return {
        success: false,
        message: 'Student not enrolled in this chapter',
        error: chapterCheckError.message
      };
    }

    if (!chapterEnrollment) {
      return {
        success: false,
        message: 'Student not enrolled in this chapter',
        error: 'No chapter enrollment found'
      };
    }

    console.log('Student is enrolled in chapter, syncing course enrollments...');

    let totalCoursesEnrolled = 0;
    let totalCoursesSkipped = 0;

    // Enroll in courses that have this chapter_id directly
    const { data: directCourses, error: directCoursesError } = await supabase
      .from('courses')
      .select('id')
      .eq('chapter_id', chapterId)
      .eq('status', 'published');

    if (directCoursesError) {
      console.error('Error fetching direct chapter courses:', directCoursesError);
    } else if (directCourses && directCourses.length > 0) {
      console.log(`Found ${directCourses.length} direct courses in chapter`);
      
      for (const course of directCourses) {
        try {
          // Check if already enrolled in this course
          const { data: existingCourseEnrollment } = await supabase
            .from('enrollments')
            .select('id')
            .eq('course_id', course.id)
            .eq('student_id', studentId)
            .single();

          if (!existingCourseEnrollment) {
            // Enroll in the course
            const { error: courseEnrollmentError } = await supabase
              .from('enrollments')
              .insert({
                course_id: course.id,
                student_id: studentId,
                enrolled_at: new Date().toISOString(),
                source: source
              });

            if (courseEnrollmentError) {
              console.error(`Error enrolling in course ${course.id}:`, courseEnrollmentError);
            } else {
              console.log(`Successfully enrolled in course ${course.id}`);
              totalCoursesEnrolled++;
            }
          } else {
            console.log(`Already enrolled in course ${course.id}`);
            totalCoursesSkipped++;
          }
        } catch (courseError) {
          console.error(`Error processing course ${course.id}:`, courseError);
        }
      }
    } else {
      console.log('No direct courses found in chapter during sync, this is normal for new chapters');
    }

    // Also enroll in courses from chapter_objects (if object_type is 'course')
    const { data: chapterObjects, error: chapterObjectsError } = await supabase
      .from('chapter_objects')
      .select('object_id')
      .eq('chapter_id', chapterId)
      .eq('object_type', 'course')
      .not('object_id', 'is', null);

    if (chapterObjectsError) {
      console.error('Error fetching chapter object courses:', chapterObjectsError);
    } else if (chapterObjects && chapterObjects.length > 0) {
      console.log(`Found ${chapterObjects.length} courses in chapter_objects`);
      
      for (const obj of chapterObjects) {
        if (obj.object_id) {
          try {
            // Check if course exists and is published
            const { data: course, error: courseCheckError } = await supabase
              .from('courses')
              .select('id')
              .eq('id', obj.object_id)
              .eq('status', 'published')
              .single();

            if (courseCheckError || !course) {
              console.log(`Course ${obj.object_id} not found or not published, skipping`);
              continue;
            }

            // Check if already enrolled in this course
            const { data: existingCourseEnrollment } = await supabase
              .from('enrollments')
              .select('id')
              .eq('course_id', obj.object_id)
              .eq('student_id', studentId)
              .single();

            if (!existingCourseEnrollment) {
              // Enroll in the course
              const { error: courseEnrollmentError } = await supabase
                .from('enrollments')
                .insert({
                  course_id: obj.object_id,
                  student_id: studentId,
                  enrolled_at: new Date().toISOString(),
                  source: source
                });

              if (courseEnrollmentError) {
                console.error(`Error enrolling in course ${obj.object_id}:`, courseEnrollmentError);
              } else {
                console.log(`Successfully enrolled in course ${obj.object_id}`);
                totalCoursesEnrolled++;
              }
            } else {
              console.log(`Already enrolled in course ${obj.object_id}`);
              totalCoursesSkipped++;
            }
          } catch (courseError) {
            console.error(`Error processing course ${obj.object_id}:`, courseError);
          }
        }
      }
    } else {
      console.log('No courses found in chapter_objects during sync, this is normal for new chapters');
    }

    console.log(`Course enrollment sync completed. Enrolled in ${totalCoursesEnrolled} new courses, skipped ${totalCoursesSkipped} already enrolled courses.`);
    
    return {
      success: true,
      message: `Successfully synced course enrollments. Enrolled in ${totalCoursesEnrolled} new courses.`,
      enrollmentId: chapterEnrollment.id
    };
  } catch (error) {
    console.error('Error in syncChapterCourseEnrollments:', error);
    return {
      success: false,
      message: 'Unexpected error during course enrollment sync',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Enrolls a student in a course with proper validation and payment handling
 */
export const enrollInCourseWithValidation = async (
  courseId: string,
  source: EnrollmentSource = 'direct',
  discountCode?: string
): Promise<EnrollmentResult> => {
  try {
    console.log('enrollInCourseWithValidation called with:', { courseId, source, discountCode });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        message: 'You must be logged in to enroll in courses',
        error: 'Authentication required'
      };
    }

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, price, status')
      .eq('id', courseId)
      .eq('status', 'published')
      .single();

    if (courseError || !course) {
      return {
        success: false,
        message: 'The course you are trying to enroll in does not exist or is not available',
        error: courseError?.message || 'Course not found'
      };
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', user.id)
      .eq('course_id', courseId)
      .single();

    if (existingEnrollment) {
      return {
        success: false,
        message: 'You are already enrolled in this course',
        error: 'Already enrolled'
      };
    }

    // Handle different enrollment sources
    switch (source) {
      case 'wallet':
        return await enrollWithWalletPayment(courseId, course, user.id, discountCode);
      
      case 'enrollment_code':
        return await enrollWithCode(courseId, course, user.id);
      
      case 'direct':
        // For free courses (price = 0)
        if (course.price === 0) {
          return await enrollDirectly(courseId, course, user.id);
        } else {
          return {
            success: false,
            message: 'This course requires payment. Please use wallet payment or contact the instructor.',
            error: 'Payment required'
          };
        }
      
      default:
        return {
          success: false,
          message: 'The selected enrollment method is not supported',
          error: 'Invalid enrollment method'
        };
    }
  } catch (error) {
    console.error('Error in enrollInCourseWithValidation:', error);
    return {
      success: false,
      message: 'An unexpected error occurred during enrollment',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Enrolls a student in a chapter with proper validation and payment handling
 */
export const enrollInChapterWithValidation = async (
  chapterId: string,
  source: EnrollmentSource = 'direct'
): Promise<EnrollmentResult> => {
  try {
    console.log('enrollInChapterWithValidation called with:', { chapterId, source });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        message: 'You must be logged in to enroll in chapters',
        error: 'Authentication required'
      };
    }

    // Get chapter details
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('id, title, price, status')
      .eq('id', chapterId)
      .eq('status', 'published')
      .single();

    if (chapterError || !chapter) {
      return {
        success: false,
        message: 'The chapter you are trying to enroll in does not exist or is not available',
        error: chapterError?.message || 'Chapter not found'
      };
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('chapter_enrollments')
      .select('id')
      .eq('student_id', user.id)
      .eq('chapter_id', chapterId)
      .single();

    if (existingEnrollment) {
      return {
        success: false,
        message: 'You are already enrolled in this chapter',
        error: 'Already enrolled'
      };
    }

    // Handle different enrollment sources
    switch (source) {
      case 'wallet':
        return await enrollChapterWithWalletPayment(chapterId, chapter, user.id);
      
      case 'direct':
        // For free chapters (price = 0)
        if (chapter.price === 0) {
          return await enrollChapterDirectly(chapterId, chapter, user.id);
        } else {
          return {
            success: false,
            message: 'This chapter requires payment. Please use wallet payment or contact the instructor.',
            error: 'Payment required'
          };
        }
      
      default:
        return {
          success: false,
          message: 'The selected enrollment method is not supported for chapters',
          error: 'Invalid enrollment method'
        };
    }
  } catch (error) {
    console.error('Error in enrollInChapterWithValidation:', error);
    return {
      success: false,
      message: 'An unexpected error occurred during enrollment',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Helper functions for different enrollment methods
const enrollWithWalletPayment = async (courseId: string, course: { id: string; title: string; price: number; status: string }, userId: string, discountCode?: string): Promise<EnrollmentResult> => {
  const { data, error } = await supabase.rpc('enroll_with_payment', {
    p_course_id: courseId,
    p_discount_code: discountCode?.trim() || null
  });

  if (error) {
    return {
      success: false,
      message: error.message,
      error: error.message
    };
  }

  if (data && typeof data === 'object' && 'success' in data) {
    const result = data as { success: boolean; message?: string; error?: string };
    if (result.success) {
      return {
        success: true,
        message: result.message || `Successfully enrolled in ${course.title}`,
        enrollmentId: courseId
      };
    } else {
      return {
        success: false,
        message: result.error || 'Enrollment failed',
        error: result.error || 'Enrollment failed'
      };
    }
  }

  return {
    success: false,
    message: 'Invalid response from enrollment service',
    error: 'Invalid response'
  };
};

const enrollChapterWithWalletPayment = async (chapterId: string, chapter: { id: string; title: string; price: number; status: string }, userId: string): Promise<EnrollmentResult> => {
  const { data, error } = await supabase.rpc('enroll_chapter_with_payment', {
    p_chapter_id: chapterId
  });

  if (error) {
    return {
      success: false,
      message: error.message,
      error: error.message
    };
  }

  if (data && typeof data === 'object' && 'success' in data) {
    const result = data as { success: boolean; message?: string; error?: string };
    if (result.success) {
      return {
        success: true,
        message: result.message || `Successfully enrolled in ${chapter.title}`,
        enrollmentId: chapterId
      };
    } else {
      return {
        success: false,
        message: result.error || 'Enrollment failed',
        error: result.error || 'Enrollment failed'
      };
    }
  }

  return {
    success: false,
    message: 'Invalid response from enrollment service',
    error: 'Invalid response'
  };
};

const enrollWithCode = async (courseId: string, course: { id: string; title: string; price: number; status: string }, userId: string): Promise<EnrollmentResult> => {
  const { error } = await supabase
    .from('enrollments')
    .insert({
      student_id: userId,
      course_id: courseId,
      source: 'enrollment_code'
    });

  if (error) {
    return {
      success: false,
      message: error.message,
      error: error.message
    };
  }

  return {
    success: true,
    message: `Successfully enrolled in ${course.title} using enrollment code`,
    enrollmentId: courseId
  };
};

const enrollDirectly = async (courseId: string, course: { id: string; title: string; price: number; status: string }, userId: string): Promise<EnrollmentResult> => {
  const { error } = await supabase
    .from('enrollments')
    .insert({
      student_id: userId,
      course_id: courseId,
      source: 'direct'
    });

  if (error) {
    return {
      success: false,
      message: error.message,
      error: error.message
    };
  }

  return {
    success: true,
    message: `Successfully enrolled in ${course.title}`,
    enrollmentId: courseId
  };
};

const enrollChapterDirectly = async (chapterId: string, chapter: { id: string; title: string; price: number; status: string }, userId: string): Promise<EnrollmentResult> => {
  // First enroll in the chapter
  const { error: chapterError } = await supabase
    .from('chapter_enrollments')
    .insert({
      student_id: userId,
      chapter_id: chapterId
    });

  if (chapterError) {
    return {
      success: false,
      message: chapterError.message,
      error: chapterError.message
    };
  }

  // Then enroll in all courses within the chapter
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('id')
    .eq('chapter_id', chapterId)
    .eq('status', 'published');

  if (coursesError) {
    console.error('Error fetching chapter courses:', coursesError);
    // Don't fail the enrollment, just log the error
  } else if (courses && courses.length > 0) {
    // Enroll in all courses within the chapter
    for (const course of courses) {
      try {
        const { error: courseEnrollmentError } = await supabase
          .from('enrollments')
          .insert({
            student_id: userId,
            course_id: course.id,
            source: 'direct'
          });

        if (courseEnrollmentError) {
          console.error(`Error enrolling in course ${course.id}:`, courseEnrollmentError);
        }
      } catch (courseError) {
        console.error(`Error processing course ${course.id}:`, courseError);
      }
    }
  }

  return {
    success: true,
    message: `Successfully enrolled in ${chapter.title}`,
    enrollmentId: chapterId
  };
};
