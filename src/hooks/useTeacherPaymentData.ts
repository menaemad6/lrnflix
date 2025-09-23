import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PaymentData } from '@/types/payment';

export const useTeacherPaymentData = (instructorId: string | undefined) => {
  return useQuery({
    queryKey: ['teacher-payment-data', instructorId],
    queryFn: async (): Promise<PaymentData | null> => {
      if (!instructorId) return null;

      const { data, error } = await supabase
        .from('teachers')
        .select('payment_data')
        .eq('user_id', instructorId)
        .single();

      if (error) {
        console.error('Error fetching teacher payment data:', error);
        return null;
      }

      return data?.payment_data || {};
    },
    enabled: !!instructorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
