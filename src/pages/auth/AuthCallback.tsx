
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/seo';
import { getIntendedDestination } from '@/utils/authRedirect';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth/login');
          return;
        }

        if (data.session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.session.user.id)
            .single();

          if (profile) {
            // Get the next parameter from URL
            const nextParam = searchParams.get('next');

            // Create a user object for the utility function
            const user = {
              id: data.session.user.id,
              email: data.session.user.email || '',
              full_name: data.session.user.user_metadata?.full_name || null,
              role: profile.role,
              avatar_url: null,
              wallet: 0,
              minutes: 0,
              daily_free_minutes_used: 0,
              last_free_minutes_reset: null,
            };

            // Redirect to intended destination if next parameter exists, otherwise use default role-based redirect
            const redirectPath = getIntendedDestination(nextParam, user);
            navigate(redirectPath);
          } else {
            navigate('/student/dashboard');
          }
        } else {
          navigate('/auth/login');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate('/auth/login');
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <>
      <SEOHead />
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    </>
  );
};
