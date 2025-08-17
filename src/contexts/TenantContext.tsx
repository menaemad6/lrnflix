import React, { createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useTenantQuery } from '@/lib/queries';

export interface TenantInfo {
  slug: string;
  teacher?: Database['public']['Tables']['teachers']['Row'] | null;
  loading: boolean;
}

const TenantContext = createContext<TenantInfo | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const { data, isLoading } = useTenantQuery();

  const tenantInfo: TenantInfo = {
    slug: data?.slug || '',
    teacher: data?.teacher || null,
    loading: isLoading,
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