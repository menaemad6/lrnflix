
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback from URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth/login');
          return;
        }

        if (data.session?.user) {
          console.log('Auth callback successful for user:', data.session.user.id);
          
          // Get user profile to determine redirect
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', data.session.user.id)
              .maybeSingle();

            if (profile) {
              const redirectPath = profile.role === 'teacher' || profile.role === 'admin' 
                ? '/teacher/dashboard' 
                : '/student/dashboard';
              navigate(redirectPath, { replace: true });
            } else {
              // Default to student dashboard if profile not found
              navigate('/student/dashboard', { replace: true });
            }
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
            // Default to student dashboard on profile fetch error
            navigate('/student/dashboard', { replace: true });
          }
        } else {
          console.log('No session found in auth callback');
          navigate('/auth/login', { replace: true });
        }
      } catch (error) {
        console.error('Critical error in auth callback:', error);
        navigate('/auth/login', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
};
