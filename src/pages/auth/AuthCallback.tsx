
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const AuthCallback = () => {
  const navigate = useNavigate();

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
            const redirectPath = profile.role === 'teacher' ? '/teacher/dashboard' : 
                               profile.role === 'admin' ? '/admin/dashboard' : 
                               '/student/dashboard';
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
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  );
};
