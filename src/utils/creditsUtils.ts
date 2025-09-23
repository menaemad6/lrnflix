import { supabase } from '@/integrations/supabase/client';

export interface CreditsUpdateResult {
  success: boolean;
  message: string;
  newBalance?: number;
}

/**
 * Add credits to a student's wallet
 */
export const addCreditsToStudent = async (
  studentId: string,
  creditsAmount: number
): Promise<CreditsUpdateResult> => {
  try {
    if (!studentId || !creditsAmount || creditsAmount <= 0) {
      return {
        success: false,
        message: 'Invalid student ID or credits amount'
      };
    }

    // Get current wallet balance
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('wallet')
      .eq('id', studentId)
      .single();

    if (fetchError) {
      console.error('Error fetching current wallet balance:', fetchError);
      return {
        success: false,
        message: `Failed to fetch current wallet balance: ${fetchError.message}`
      };
    }

    if (!currentProfile) {
      return {
        success: false,
        message: 'Student profile not found'
      };
    }

    const currentBalance = currentProfile.wallet || 0;
    const newBalance = currentBalance + creditsAmount;

    // Update the wallet balance
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        wallet: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', studentId)
      .select('wallet')
      .single();

    if (updateError) {
      console.error('Error updating wallet balance:', updateError);
      return {
        success: false,
        message: `Failed to update wallet balance: ${updateError.message}`
      };
    }

    return {
      success: true,
      message: `Successfully added ${creditsAmount} credits to student's wallet`,
      newBalance: data.wallet
    };

  } catch (error) {
    console.error('Unexpected error in addCreditsToStudent:', error);
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Add AI minutes to a student's account
 */
export const addMinutesToStudent = async (
  studentId: string,
  minutesAmount: number
): Promise<CreditsUpdateResult> => {
  try {
    if (!studentId || !minutesAmount || minutesAmount <= 0) {
      return {
        success: false,
        message: 'Invalid student ID or minutes amount'
      };
    }

    // Get current minutes balance
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('minutes')
      .eq('id', studentId)
      .single();

    if (fetchError) {
      console.error('Error fetching current minutes balance:', fetchError);
      return {
        success: false,
        message: `Failed to fetch current minutes balance: ${fetchError.message}`
      };
    }

    if (!currentProfile) {
      return {
        success: false,
        message: 'Student profile not found'
      };
    }

    const currentBalance = currentProfile.minutes || 0;
    const newBalance = currentBalance + minutesAmount;

    // Update the minutes balance
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        minutes: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', studentId)
      .select('minutes')
      .single();

    if (updateError) {
      console.error('Error updating minutes balance:', updateError);
      return {
        success: false,
        message: `Failed to update minutes balance: ${updateError.message}`
      };
    }

    return {
      success: true,
      message: `Successfully added ${minutesAmount} AI minutes to student's account`,
      newBalance: data.minutes
    };

  } catch (error) {
    console.error('Unexpected error in addMinutesToStudent:', error);
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Handle credits or minutes purchase confirmation
 */
export const handleCreditsOrMinutesPurchase = async (
  studentId: string,
  itemType: 'credits' | 'ai_minutes',
  amount: number
): Promise<CreditsUpdateResult> => {
  if (itemType === 'credits') {
    return await addCreditsToStudent(studentId, amount);
  } else if (itemType === 'ai_minutes') {
    return await addMinutesToStudent(studentId, amount);
  } else {
    return {
      success: false,
      message: 'Invalid item type for credits/minutes purchase'
    };
  }
};
