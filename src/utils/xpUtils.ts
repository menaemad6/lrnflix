import { supabase } from '@/integrations/supabase/client';

export interface XPUpdate {
  category: string;
  amount: number;
}

/**
 * Update XP for a user in a specific category
 */
export const updateUserXP = async (userId: string, category: string, amount: number) => {
  try {
    // Get current XP data
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('total_xp')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching user XP:', fetchError);
      return { error: fetchError };
    }

    // Get current XP or initialize empty object
    const currentXP = profile?.total_xp || {};
    
    // Update XP for the category
    const updatedXP = {
      ...currentXP,
      [category]: (currentXP[category] || 0) + amount
    };

    // Update the profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ total_xp: updatedXP })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user XP:', updateError);
      return { error: updateError };
    }

    return { success: true, newTotal: updatedXP[category] };
  } catch (error) {
    console.error('Error in updateUserXP:', error);
    return { error };
  }
};

/**
 * Get total XP for a user across all categories
 */
export const getTotalXP = (xpData: { [key: string]: number } | null): number => {
  if (!xpData || typeof xpData !== 'object') return 0;
  return Object.values(xpData).reduce((sum, xp) => sum + xp, 0);
};

/**
 * Get XP for a specific category
 */
export const getCategoryXP = (xpData: { [key: string]: number } | null, category: string): number => {
  if (!xpData || typeof xpData !== 'object') return 0;
  return xpData[category] || 0;
};

/**
 * Calculate total XP for a user based on tenant categories
 * If tenant exists, only count XP from instructor's categories
 * If no tenant, count all XP from all categories
 */
export const calculateTenantFilteredXP = (
  xpData: { [key: string]: number } | null,
  tenantCategories: string[] | null
): number => {
  if (!xpData || typeof xpData !== 'object') return 0;
  
  // If no tenant categories, return total XP from all categories
  if (!tenantCategories || tenantCategories.length === 0) {
    return getTotalXP(xpData);
  }
  
  // If tenant exists, only count XP from instructor's categories
  return tenantCategories.reduce((sum, category) => {
    return sum + (xpData[category] || 0);
  }, 0);
};
