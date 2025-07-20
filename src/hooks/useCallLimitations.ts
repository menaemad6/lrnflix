import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CallLimitationData {
  dailyMinutesLimit: number;
  minutesUsedToday: number;
  remainingMinutes: number;
  purchasedMinutes: number;
  totalAvailableMinutes: number;
  canStartCall: boolean;
  loading: boolean;
}

export const useCallLimitations = (lessonId: string) => {
  const { toast } = useToast();
  const [data, setData] = useState<CallLimitationData>({
    dailyMinutesLimit: 30,
    minutesUsedToday: 0,
    remainingMinutes: 30,
    purchasedMinutes: 0,
    totalAvailableMinutes: 30,
    canStartCall: true,
    loading: true
  });

  useEffect(() => {
    fetchCallLimitations();
  }, [lessonId]);

  const fetchCallLimitations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setData(prev => ({ ...prev, loading: false, canStartCall: false }));
        return;
      }

      // Fetch user profile to get purchased minutes
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('minutes')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      const purchasedMinutes = profileData?.minutes || 0;

      // Fetch daily minutes limit from settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('ai_assistant_settings')
        .select('setting_value')
        .eq('setting_key', 'daily_minutes_limit')
        .maybeSingle();

      if (settingsError) {
        console.error('Error fetching settings:', settingsError);
      }

      const dailyLimit = settingsData ? parseInt(settingsData.setting_value) : 30;

      // Fetch today's call history
      const today = new Date().toISOString().split('T')[0];
      const { data: callHistory, error: historyError } = await supabase
        .from('student_call_history')
        .select('call_duration_minutes')
        .eq('student_id', user.id)
        .eq('call_date', today);

      if (historyError) {
        console.error('Error fetching call history:', historyError);
        setData(prev => ({ ...prev, loading: false }));
        return;
      }

      const minutesUsedToday = callHistory?.reduce((total, call) => total + call.call_duration_minutes, 0) || 0;
      const remainingFreeMinutes = Math.max(0, dailyLimit - minutesUsedToday);
      const totalAvailableMinutes = remainingFreeMinutes + purchasedMinutes;
      const canStartCall = totalAvailableMinutes > 0;

      setData({
        dailyMinutesLimit: dailyLimit,
        minutesUsedToday,
        remainingMinutes: remainingFreeMinutes,
        purchasedMinutes,
        totalAvailableMinutes,
        canStartCall,
        loading: false
      });

    } catch (error) {
      console.error('Error in fetchCallLimitations:', error);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  const recordCallStart = async (lessonId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Check if the lessonId exists in the lessons table
      const { data: lessonExists } = await supabase
        .from('lessons')
        .select('id')
        .eq('id', lessonId)
        .maybeSingle();

      // Prepare insert data
      const insertData: any = {
        student_id: user.id,
        call_started_at: new Date().toISOString(),
        call_date: new Date().toISOString().split('T')[0]
      };

      // Only include lesson_id if it exists in the lessons table
      if (lessonExists) {
        insertData.lesson_id = lessonId;
      }
      // If lesson doesn't exist, omit lesson_id (will be null)

      const { data, error } = await supabase
        .from('student_call_history')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error recording call start:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error in recordCallStart:', error);
      return null;
    }
  };

  const recordCallEnd = async (callId: string, durationMinutes: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Update call history
      const { error: historyError } = await supabase
        .from('student_call_history')
        .update({
          call_ended_at: new Date().toISOString(),
          call_duration_minutes: durationMinutes
        })
        .eq('id', callId);

      if (historyError) {
        console.error('Error recording call end:', historyError);
        return false;
      }

      // Determine if we need to consume purchased minutes
      const { data: profileData } = await supabase
        .from('profiles')
        .select('minutes')
        .eq('id', user.id)
        .single();

      const currentPurchasedMinutes = profileData?.minutes || 0;
      
      // Check if we're using purchased minutes (when free minutes are exhausted)
      const today = new Date().toISOString().split('T')[0];
      const { data: todayCalls } = await supabase
        .from('student_call_history')
        .select('call_duration_minutes')
        .eq('student_id', user.id)
        .eq('call_date', today);

      const totalUsedToday = todayCalls?.reduce((total, call) => total + call.call_duration_minutes, 0) || 0;
      const remainingFreeMinutes = Math.max(0, data.dailyMinutesLimit - (totalUsedToday - durationMinutes));
      
      // If we have no free minutes remaining, consume purchased minutes
      if (remainingFreeMinutes === 0 && currentPurchasedMinutes > 0) {
        const minutesToConsume = Math.min(durationMinutes, currentPurchasedMinutes);
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            minutes: Math.max(0, currentPurchasedMinutes - minutesToConsume) 
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating purchased minutes:', updateError);
          return false;
        }
      }

      // Refresh limitations after call ends
      await fetchCallLimitations();
      return true;
    } catch (error) {
      console.error('Error in recordCallEnd:', error);
      return false;
    }
  };

  const updateCallDuration = async (callId: string, durationMinutes: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('student_call_history')
        .update({
          call_duration_minutes: durationMinutes
        })
        .eq('id', callId);

      if (error) {
        console.error('Error updating call duration:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in updateCallDuration:', error);
      return false;
    }
  };

  const getMaxCallDuration = (requestedMinutes: number): number => {
    return Math.min(requestedMinutes, data.totalAvailableMinutes);
  };

  return {
    ...data,
    recordCallStart,
    recordCallEnd,
    updateCallDuration,
    getMaxCallDuration,
    refreshLimitations: fetchCallLimitations
  };
};
