import { supabase } from '@/integrations/supabase/client';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  activityDates: string[];
}

/**
 * Calculate the current study streak based on user's learning activities
 * A day counts towards the streak if the user:
 * - Completed a lesson
 * - Attempted a quiz
 * - Viewed a lesson
 * - Had an AI call
 * - Enrolled in a course
 */
export const calculateStudyStreak = async (userId: string): Promise<StreakData> => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Get all activity dates from various learning activities
    const activityDates = new Set<string>();
    
    // 1. Lesson completions
    const { data: lessonProgress } = await supabase
      .from('lesson_progress')
      .select('completed_at')
      .eq('student_id', userId)
      .not('completed_at', 'is', null);
    
    if (lessonProgress) {
      lessonProgress.forEach(progress => {
        if (progress.completed_at) {
          const date = new Date(progress.completed_at).toISOString().split('T')[0];
          activityDates.add(date);
        }
      });
    }
    
    // 2. Quiz attempts
    const { data: quizAttempts } = await supabase
      .from('quiz_attempts')
      .select('started_at, submitted_at')
      .eq('student_id', userId);
    
    if (quizAttempts) {
      quizAttempts.forEach(attempt => {
        // Use submitted_at if available, otherwise started_at
        const activityDate = attempt.submitted_at || attempt.started_at;
        if (activityDate) {
          const date = new Date(activityDate).toISOString().split('T')[0];
          activityDates.add(date);
        }
      });
    }
    
    // 3. Lesson views
    const { data: lessonViews } = await supabase
      .from('lesson_views')
      .select('viewed_at')
      .eq('student_id', userId);
    
    if (lessonViews) {
      lessonViews.forEach(view => {
        if (view.viewed_at) {
          const date = new Date(view.viewed_at).toISOString().split('T')[0];
          activityDates.add(date);
        }
      });
    }
    
    // 4. AI calls
    const { data: aiCalls } = await supabase
      .from('student_call_history')
      .select('call_started_at')
      .eq('student_id', userId);
    
    if (aiCalls) {
      aiCalls.forEach(call => {
        if (call.call_started_at) {
          const date = new Date(call.call_started_at).toISOString().split('T')[0];
          activityDates.add(date);
        }
      });
    }
    
    // 5. Course enrollments
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('enrolled_at')
      .eq('student_id', userId);
    
    if (enrollments) {
      enrollments.forEach(enrollment => {
        if (enrollment.enrolled_at) {
          const date = new Date(enrollment.enrolled_at).toISOString().split('T')[0];
          activityDates.add(date);
        }
      });
    }
    
    // Convert to array and sort dates
    const sortedDates = Array.from(activityDates).sort((a, b) => b.localeCompare(a));
    
    if (sortedDates.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        activityDates: []
      };
    }
    
    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastActivityDate = sortedDates[0];
    
    // Check if today has activity
    const hasTodayActivity = sortedDates.includes(todayStr);
    
    // Start from yesterday if no activity today, otherwise start from today
    let currentDate = hasTodayActivity ? today : new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    // Calculate current streak
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      if (sortedDates.includes(dateStr)) {
        currentStreak++;
        tempStreak++;
        currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    let previousDate: Date | null = null;
    tempStreak = 0;
    
    for (const dateStr of sortedDates) {
      const currentDate = new Date(dateStr);
      
      if (previousDate) {
        const daysDiff = Math.floor((previousDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000));
        
        if (daysDiff === 1) {
          // Consecutive day
          tempStreak++;
        } else {
          // Break in streak
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      
      previousDate = currentDate;
    }
    
    // Don't forget the last streak
    longestStreak = Math.max(longestStreak, tempStreak);
    
    return {
      currentStreak,
      longestStreak,
      lastActivityDate,
      activityDates: sortedDates
    };
    
  } catch (error) {
    console.error('Error calculating study streak:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      activityDates: []
    };
  }
};

/**
 * Get a simple streak number for backward compatibility
 */
export const getStudyStreak = async (userId: string): Promise<number> => {
  const streakData = await calculateStudyStreak(userId);
  return streakData.currentStreak;
};

/**
 * Check if user has activity today
 */
export const hasActivityToday = async (userId: string): Promise<boolean> => {
  const today = new Date().toISOString().split('T')[0];
  
  // Check lesson progress
  const { data: lessonProgress } = await supabase
    .from('lesson_progress')
    .select('completed_at')
    .eq('student_id', userId)
    .gte('completed_at', today + 'T00:00:00')
    .lte('completed_at', today + 'T23:59:59');
  
  if (lessonProgress && lessonProgress.length > 0) return true;
  
  // Check quiz attempts
  const { data: quizAttempts } = await supabase
    .from('quiz_attempts')
    .select('started_at')
    .eq('student_id', userId)
    .gte('started_at', today + 'T00:00:00')
    .lte('started_at', today + 'T23:59:59');
  
  if (quizAttempts && quizAttempts.length > 0) return true;
  
  // Check lesson views
  const { data: lessonViews } = await supabase
    .from('lesson_views')
    .select('viewed_at')
    .eq('student_id', userId)
    .gte('viewed_at', today + 'T00:00:00')
    .lte('viewed_at', today + 'T23:59:59');
  
  if (lessonViews && lessonViews.length > 0) return true;
  
  return false;
};
