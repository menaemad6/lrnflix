
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LiveLecture {
  id: string;
  course_id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  start_time: string;
  duration_minutes: number;
  google_event_id: string | null;
  meet_link: string | null;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  created_at: string;
  updated_at: string;
}

interface UseLiveLecturesReturn {
  lectures: LiveLecture[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useLiveLectures = (courseId: string): UseLiveLecturesReturn => {
  const [lectures, setLectures] = useState<LiveLecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLectures = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('live_lectures')
        .select('*')
        .eq('course_id', courseId)
        .gte('start_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Show lectures from last 24 hours
        .order('start_time', { ascending: true });

      if (error) throw error;
      
      // Cast the data to match our interface, ensuring status is properly typed
      const typedData = (data || []).map(lecture => ({
        ...lecture,
        status: lecture.status as 'scheduled' | 'live' | 'ended' | 'cancelled'
      }));
      
      setLectures(typedData);
    } catch (err: any) {
      console.error('Error fetching live lectures:', err);
      setError(err.message || 'Failed to fetch live lectures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchLectures();
    }
  }, [courseId]);

  return {
    lectures,
    loading,
    error,
    refetch: fetchLectures
  };
}; 
