import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CourseProgress {
  completedLessonIds: string[];
  completedQuizIds: string[];
  totalLessons: number;
  totalQuizzes: number;
  completedLessons: number;
  completedQuizzes: number;
  progressPercentage: number;
}

export function useCourseProgress(courseId: string | undefined, userId: string | undefined): CourseProgress {
  const [progress, setProgress] = useState<CourseProgress>({
    completedLessonIds: [],
    completedQuizIds: [],
    totalLessons: 0,
    totalQuizzes: 0,
    completedLessons: 0,
    completedQuizzes: 0,
    progressPercentage: 0,
  });

  useEffect(() => {
    if (!courseId || !userId) return;
    let isMounted = true;

    async function fetchProgress() {
      // Fetch all lessons for the course
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', courseId);
      const lessonIds = lessonsData?.map(l => l.id) || [];

      // Fetch all quizzes for the course
      const { data: quizzesData } = await supabase
        .from('quizzes')
        .select('id')
        .eq('course_id', courseId);
      const quizIds = quizzesData?.map(q => q.id) || [];

      // Fetch completed lessons
      const { data: lessonProgressData } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('student_id', userId)
        .in('lesson_id', lessonIds);
      const completedLessonIds = Array.from(new Set((lessonProgressData || []).map(p => p.lesson_id)));

      // Fetch quiz attempts
      const { data: quizAttemptsData } = await supabase
        .from('quiz_attempts')
        .select('quiz_id')
        .eq('student_id', userId)
        .not('submitted_at', 'is', null)
        .in('quiz_id', quizIds);
      // Mark a quiz as completed if there is at least one attempt
      const completedQuizIds = Array.from(new Set((quizAttemptsData || []).map(a => a.quiz_id)));

      const totalLessons = lessonIds.length;
      const totalQuizzes = quizIds.length;
      const completedLessons = completedLessonIds.length;
      const completedQuizzes = completedQuizIds.length;
      const totalItems = totalLessons + totalQuizzes;
      const completedItems = completedLessons + completedQuizzes;
      const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

      if (isMounted) {
        setProgress({
          completedLessonIds,
          completedQuizIds,
          totalLessons,
          totalQuizzes,
          completedLessons,
          completedQuizzes,
          progressPercentage,
        });
      }
    }

    fetchProgress();
    return () => { isMounted = false; };
  }, [courseId, userId]);

  return progress;
} 