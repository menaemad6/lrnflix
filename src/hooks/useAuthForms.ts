
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useLocation } from 'react-router-dom';

// Login form logic
export function useLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Use window.location.origin to ensure secure redirect
      const redirectTo = `${window.location.origin}/auth/callback`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Google login error:', error);
      setError(error.message || 'An error occurred during Google login');
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
      // Validate inputs
      if (!formData.email.trim() || !formData.password || !formData.fullName.trim()) {
        throw new Error('All fields are required');
      }
      
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Use window.location.origin to ensure secure redirect
      const redirectTo = `${window.location.origin}/auth/callback`;
      
      const { error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            full_name: formData.fullName.trim(),
            role: formData.role,
          },
        },
      });
      if (error) throw error;
      setSuccess('Account created successfully! Please check your email to verify your account.');
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'An error occurred during signup');
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
