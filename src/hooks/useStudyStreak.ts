import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { calculateStudyStreak, getStudyStreak, hasActivityToday } from '@/utils/streakCalculator';
import { supabase } from '@/integrations/supabase/supabase';

export interface UseStudyStreakOptions {
  userId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useStudyStreak = ({ 
  userId, 
  autoRefresh = true, 
  refreshInterval = 30000 
}: UseStudyStreakOptions) => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [hasActivityToday, setHasActivityToday] = useState(false);

  // Query for detailed streak data
  const { data: streakData, isLoading, error, refetch } = useQuery({
    queryKey: ['studyStreak', userId],
    queryFn: () => calculateStudyStreak(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Query for today's activity status
  const { data: todayActivity } = useQuery({
    queryKey: ['todayActivity', userId],
    queryFn: () => hasActivityToday(userId),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update local state when data changes
  useEffect(() => {
    if (streakData) {
      setCurrentStreak(streakData.currentStreak);
    }
  }, [streakData]);

  useEffect(() => {
    if (todayActivity !== undefined) {
      setHasActivityToday(todayActivity);
    }
  }, [todayActivity]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !userId) return;

    const interval = setInterval(() => {
      refetch();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refetch, userId]);

  // Function to manually refresh streak data
  const refreshStreak = async () => {
    await refetch();
  };

  // Function to check if user can maintain streak today
  const canMaintainStreakToday = () => {
    if (!hasActivityToday) {
      return true; // User hasn't done anything today, can still maintain streak
    }
    return false; // User already has activity today
  };

  // Function to get streak motivation message
  const getStreakMotivation = () => {
    if (currentStreak === 0) {
      return "Start your learning journey today!";
    } else if (currentStreak < 7) {
      return "Great start! Keep going to build momentum.";
    } else if (currentStreak < 30) {
      return "Excellent consistency! You're building great habits.";
    } else if (currentStreak < 100) {
      return "Incredible dedication! You're unstoppable!";
    } else {
      return "Legendary status! You're an inspiration to all learners!";
    }
  };

  return {
    // Data
    currentStreak: streakData?.currentStreak || 0,
    longestStreak: streakData?.longestStreak || 0,
    lastActivityDate: streakData?.lastActivityDate,
    activityDates: streakData?.activityDates || [],
    hasActivityToday,
    
    // State
    isLoading,
    error,
    
    // Functions
    refreshStreak,
    canMaintainStreakToday,
    getStreakMotivation,
    
    // Computed values
    isOnFire: currentStreak >= 7,
    isConsistent: currentStreak >= 30,
    isLegendary: currentStreak >= 100,
  };
};

// Simplified hook for just getting the streak number
export const useSimpleStreak = (userId: string) => {
  return useQuery({
    queryKey: ['simpleStreak', userId],
    queryFn: () => getStudyStreak(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
