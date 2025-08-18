import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useTenantQuery } from '@/lib/queries';
import { updateTenantColors } from '@/utils/cssVariableInjector';
import { DEFAULT_TENANT_COLORS } from '@/data/constants';

export interface TenantColors {
  primary: string;
  secondary?: string | null;
  accent?: string | null;
}

export interface TenantInfo {
  slug: string;
  teacher?: Database['public']['Tables']['teachers']['Row'] | null;
  loading: boolean;
  colors: TenantColors;
}

const TenantContext = createContext<TenantInfo | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const { data, isLoading } = useTenantQuery();

  // Extract colors from teacher data or use defaults
  const getDefaultColors = (): TenantColors => DEFAULT_TENANT_COLORS;

  // Safely extract colors from teacher data, with proper type casting
  const extractColors = (): TenantColors => {
    if (data?.teacher?.colors && typeof data.teacher.colors === 'object' && data.teacher.colors !== null) {
      const teacherColors = data.teacher.colors as Record<string, unknown>;
      return {
        primary: (teacherColors.primary as string) || DEFAULT_TENANT_COLORS.primary,
        secondary: (teacherColors.secondary as string | null) ?? DEFAULT_TENANT_COLORS.secondary,
        accent: (teacherColors.accent as string | null) ?? DEFAULT_TENANT_COLORS.accent,
      };
    }
    return DEFAULT_TENANT_COLORS;
  };

  const colors: TenantColors = extractColors();

  // Update CSS variables when colors change
  useEffect(() => {
    if (!isLoading && colors) {
      updateTenantColors(colors);
    }
  }, [colors, isLoading]);

  const tenantInfo: TenantInfo = {
    slug: data?.slug || '',
    teacher: data?.teacher || null,
    loading: isLoading,
    colors,
  };

  return (
    <TenantContext.Provider value={tenantInfo}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}; 