
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { supabase } from '@/integrations/supabase/client';
import { setUser, setLoading } from '@/store/slices/authSlice';
import type { User } from '@/store/slices/authSlice';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            dispatch(setUser(null));
            dispatch(setLoading(false));
            setIsInitialized(true);
          }
          return;
        }

        if (session?.user && mounted) {
          console.log('Session found, setting user:', session.user.id);
          
          // Try to get profile data with wallet and minutes
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
          }

          // Set user data (with or without profile)
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: profile?.full_name || session.user.user_metadata?.full_name || null,
            role: profile?.role || 'student',
            avatar_url: profile?.avatar_url || null,
            wallet: profile?.wallet || 0,
            minutes: profile?.minutes || 0,
            daily_free_minutes_used: profile?.daily_free_minutes_used || 0,
            last_free_minutes_reset: profile?.last_free_minutes_reset || null,
          };

          dispatch(setUser(userData));
        } else if (mounted) {
          console.log('No session found');
          dispatch(setUser(null));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          dispatch(setUser(null));
        }
      } finally {
        if (mounted) {
          dispatch(setLoading(false));
          setIsInitialized(true);
          console.log('Auth initialization complete');
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted) return;
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Fetch profile data for signed in user
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()
            .then(({ data: profile, error: profileError }) => {
              if (profileError) {
                console.error('Error fetching profile on sign in:', profileError);
              }

              const userData: User = {
                id: session.user.id,
                email: session.user.email || '',
                full_name: profile?.full_name || session.user.user_metadata?.full_name || null,
                role: profile?.role || 'student',
                avatar_url: profile?.avatar_url || null,
                wallet: profile?.wallet || 0,
                minutes: profile?.minutes || 0,
                daily_free_minutes_used: profile?.daily_free_minutes_used || 0,
                last_free_minutes_reset: profile?.last_free_minutes_reset || null,
              };

              dispatch(setUser(userData));
              dispatch(setLoading(false));
            });
        } else if (event === 'SIGNED_OUT') {
          dispatch(setUser(null));
          dispatch(setLoading(false));
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Don't refetch profile on token refresh, just update the existing user
          console.log('Token refreshed for user:', session.user.id);
        }
      }
    );

    // Initialize auth only once
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [dispatch]);

  // Show loading only until we're initialized
  if (!isInitialized) {
    console.log('Auth not yet initialized, showing loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  );
};
