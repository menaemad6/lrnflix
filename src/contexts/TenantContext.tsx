import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export interface TenantInfo {
  slug: string;
  teacher?: Database['public']['Tables']['teachers']['Row'] | null;
  loading: boolean;
}

interface TenantContextType extends TenantInfo {
  setTenant: (info: TenantInfo) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const [tenant, setTenant] = useState<TenantInfo>({ slug: '', teacher: null, loading: true });

  useEffect(() => {
    const hostname = window.location.hostname;
    // e.g. john.platform.com or www.platform.com
    const parts = hostname.split('.');
    let subdomain = '';
    if (parts.length > 2) {
      subdomain = parts[0];
    } else if (parts.length === 2 && parts[0] !== 'localhost') {
      // e.g. john.localhost
      subdomain = parts[0];
    }
    setTenant((prev) => ({ ...prev, slug: subdomain, loading: true }));
    if (subdomain && subdomain !== 'platform' && subdomain !== 'www') {
      // Check for teacher in supabase
      supabase
        .from('teachers')
        .select('*')
        .eq('slug', subdomain)
        .maybeSingle()
        .then(({ data, error }) => {
          setTenant({ slug: subdomain, teacher: data || null, loading: false });
        });
    } else {
      setTenant({ slug: subdomain, teacher: null, loading: false });
    }
  }, []);

  return (
    <TenantContext.Provider value={{ ...tenant, setTenant }}>
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