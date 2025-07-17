import React, { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, LogIn, BookOpen, Users, Award, TrendingUp } from 'lucide-react';
import type { RootState } from '@/store/store';
import { AuthHero } from "@/components/auth/AuthHero";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { useRandomBackground } from "../../hooks/useRandomBackground";

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const bgClass = useRandomBackground();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('Login successful, session created');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (isLoading) {
    console.log('Auth is loading, showing spinner...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="glass-card p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-500 border-t-transparent mx-auto"></div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    console.log('User is authenticated, redirecting...');
    const from = location.state?.from?.pathname;
    if (from && from !== '/auth/login') {
      return <Navigate to={from} replace />;
    }
    
    const redirectPath = user.role === 'teacher' || user.role === 'admin' ? '/teacher/dashboard' : '/student/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950 overflow-hidden relative animate-fade-in">
      {/* Floating blurred gradients like dashboard */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/12 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 w-[32rem] h-72 bg-cyan-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: "1.2s" }}/>
        <div className="absolute top-1/2 left-56 w-80 h-40 bg-teal-500/13 rounded-full blur-2xl animate-float" style={{ animationDelay: "2.2s" }}/>
        <div className="absolute top-36 right-32 w-40 h-40 bg-emerald-700/17 rounded-full blur-2xl animate-float" style={{ animationDelay: "3.3s" }}/>
        <div className="absolute left-1/2 top-14 w-24 h-60 bg-cyan-600/13 rounded-full blur-2xl animate-float" style={{ animationDelay: ".9s" }}/>
        {/* Glass slice effect */}
        <div className="absolute top-32 right-80 w-44 h-14 bg-white/8 rounded-2xl blur-2xl rotate-6 animate-float" style={{ animationDelay: "2.7s" }} />
      </div>
      {/* Left Hero */}
      <AuthHero
        title="Welcome to"
        highlight="Your Next-Gen Study Hub"
        subtitle="Sign in and elevate your learning with our seamless, premium experience."
      />
      {/* Right Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10 bg-transparent overflow-hidden min-h-screen">
        {/* Animate extra glass background */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-teal-700/17 rounded-full blur-2xl animate-float pointer-events-none" style={{ animationDuration: "7s" }} />
        <Card className="w-full max-w-md glass-card border border-emerald-500/10 shadow-emerald-900/40 bg-slate-950/90 backdrop-blur-2xl animate-fade-in">
          <CardHeader className="space-y-4 text-center pb-7">
            <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-xl animate-glow-pulse border border-primary/20">
              <LogIn className="w-10 h-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-black gradient-text tracking-wide">Welcome Back</CardTitle>
              <CardDescription className="text-slate-400 text-lg mt-3">
                Sign in to access your premium learning portal
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-7 pb-2 animate-fade-in" style={{ animationDelay: ".2s" }}>
            {error && (
              <Alert
                variant="destructive"
                className="border-red-500/30 bg-red-900/20 animate-fade-in"
              >
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-300 w-5 h-5 transition-colors" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 h-14 bg-slate-950 border-slate-800 rounded-xl text-emerald-100 placeholder:text-slate-500 focus:border-emerald-400 focus:ring-emerald-700/30 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-300 w-5 h-5 transition-colors" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 pr-12 h-14 bg-slate-950 border-slate-800 rounded-xl text-emerald-100 placeholder:text-slate-500 focus:border-emerald-400 focus:ring-emerald-700/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="toggle password visibility"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-14 btn-primary bg-gradient-to-tr from-emerald-600 to-teal-600 shadow-xl hover:from-emerald-500 hover:to-teal-500 font-bold rounded-xl text-lg tracking-wide animate-glow-pulse"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
            <div className="relative my-8 animate-fade-in" style={{ animationDelay: ".4s" }}>
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-800"></span>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-slate-950 px-4 py-2 text-slate-500 rounded-full border border-slate-800 shadow-sm">
                  Or continue with
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full h-14 border-slate-800 bg-slate-950 hover:bg-slate-900 text-emerald-100 rounded-xl font-medium transition-all shadow animate-fade-in"
            >
              <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                {/* gray Google icon (not blue, no yellow) */}
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#34d399"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#06b6d4"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#10b981"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#64748b"
                />
              </svg>
              Sign in with Google
            </Button>
            <AuthFooter mode="login" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
