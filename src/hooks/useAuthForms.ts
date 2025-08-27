import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useLocation, Navigate, useSearchParams } from 'react-router-dom';
import { buildOAuthCallbackUrl } from '@/utils/authRedirect';

// Login form logic
export function useLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Get the next parameter to preserve it in OAuth flow
      const nextParam = searchParams.get('next');
      const redirectTo = buildOAuthCallbackUrl(nextParam);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
        }
      });
      if (error) throw error;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
    }
  };

  return {
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    loading, error,
    isAuthenticated, user, isLoading, location,
    handleLogin, handleGoogleLogin,
  };
}

// Signup form logic
export function useSignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'student' as 'student' | 'teacher',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const handleSignup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role,
            phone: formData.phone,
          },
        },
      });
      if (error) throw error;
      
      // Manually create profile since database trigger might not be working
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: formData.email,
              full_name: formData.fullName,
              role: formData.role,
              phone_number: formData.phone,
            });
          
          if (profileError) {
            console.warn('Profile creation warning:', profileError);
            // Don't fail the signup if profile creation fails
          }
        } catch (profileError: unknown) {
          const errorMessage = profileError instanceof Error ? profileError.message : 'Profile creation failed';
          console.warn('Profile creation error:', errorMessage);
          // Don't fail the signup if profile creation fails
        }
      }
      
      setSuccess('Account created successfully! Please check your email to verify your account.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData, setFormData,
    showPassword, setShowPassword,
    loading, error, success,
    isAuthenticated, user,
    handleSignup,
  };
} 