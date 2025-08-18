
import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, GraduationCap, BookOpen } from 'lucide-react';
import type { RootState } from '@/store/store';
import { AuthHero } from "@/components/auth/AuthHero";
import { AuthFooter } from "@/components/auth/AuthFooter";

// More glassy/floating backgrounds + stunning premium theme
export const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'student' as 'student' | 'teacher'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role,
          },
        },
      });

      if (error) throw error;

      setSuccess('Account created successfully! Please check your email to verify your account.');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && user) {
    const redirectPath = user.role === 'teacher' ? '/teacher/dashboard' : 
                        user.role === 'admin' ? '/admin/dashboard' : 
                        '/student/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary-950 via-secondary-950 to-accent-950 dark:from-primary-950 dark:via-secondary-950 dark:to-accent-950 overflow-hidden relative animate-fade-in">
      {/* Floating gradient blobs/glass and particles - premium */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute left-8 top-24 w-80 h-80 bg-primary-600/20 blur-3xl rounded-full animate-float" />
        <div className="absolute right-24 bottom-12 w-96 h-96 bg-accent-400/12 rounded-full blur-3xl animate-float" style={{ animationDelay: "2.2s" }} />
        <div className="absolute left-1/3 top-1/2 w-48 h-48 bg-secondary-400/15 blur-2xl rounded-full animate-pulse" />
        <div className="absolute left-20 bottom-1/3 w-32 h-32 bg-primary-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: "1.7s" }} />
        <div className="absolute right-48 top-12 w-40 h-40 bg-accent-700/20 rounded-full blur-3xl animate-float" style={{ animationDelay: ".9s" }} />
        {/* Glass slice */}
        <div className="absolute top-40 right-64 w-48 h-20 bg-white/7 rounded-3xl blur-2xl rotate-6 animate-float" style={{ animationDelay: "3s" }} />
      </div>
      {/* Left - Hero Panel */}
      <AuthHero 
        title="Join the Premium"
        highlight="Elite Learner's Community"
        subtitle="Create your account and unlock premium resources, mentorship, and more."
      />
      {/* Right - Signup Form - modern glass look */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-8 z-10 relative">
        <div className="absolute top-0 right-0 w-60 h-60 bg-secondary-700/20 rounded-full blur-2xl animate-float pointer-events-none" style={{ animationDuration: "7s" }} />
        <Card className="w-full max-w-md glass-card border border-primary-500/10 shadow-accent-900/40 bg-slate-950/90 backdrop-blur-2xl animate-fade-in">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-secondary-500 via-primary-500 to-accent-500 rounded-3xl flex items-center justify-center shadow-xl animate-glow-pulse border border-primary/20">
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-black gradient-text tracking-wide drop-shadow-lg">Get Started</CardTitle>
            <CardDescription className="text-slate-400 text-lg mt-3">
              Create your premium account now
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pb-2 animate-fade-in" style={{ animationDelay: ".2s" }}>
            {error && (
              <Alert variant="destructive" className="border-red-500/30 bg-red-900/20 animate-fade-in">
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-primary-500/40 bg-primary-900/20 animate-fade-in">
                <AlertDescription className="text-primary-200">{success}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Full name"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                    className="pl-12 h-14 bg-slate-950 border-slate-800 rounded-xl text-primary-100 placeholder:text-slate-500 focus:border-primary-400 focus:ring-primary-700/40 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 w-5 h-5" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="pl-12 h-14 bg-slate-950 border-slate-800 rounded-xl text-primary-100 placeholder:text-slate-500 focus:border-primary-400 focus:ring-primary-700/40 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 w-5 h-5" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    className="pl-12 pr-12 h-14 bg-slate-950 border-slate-800 rounded-xl text-primary-100 placeholder:text-slate-500 focus:border-primary-400 focus:ring-primary-700/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="toggle password visibility"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Select
                  value={formData.role}
                  onValueChange={
                    (value: "student" | "teacher") =>
                      setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger className="h-14 bg-slate-950 border-slate-800 text-primary-100 focus:border-primary-400 focus:ring-primary-700/40 rounded-xl transition-all flex items-center">
                    <div className="flex items-center space-x-2">
                      {formData.role === "teacher" ? (
                        <GraduationCap className="w-5 h-5 text-primary-400" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-primary-400" />
                      )}
                      <SelectValue placeholder="Choose role" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="glass-card border-primary-500/30 bg-slate-950/90">
                    <SelectItem
                      value="student"
                      className="hover:bg-primary-800/20 focus:bg-primary-800/20 text-primary-100 rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4" />
                        <span>Student</span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="teacher"
                      className="hover:bg-secondary-800/20 focus:bg-secondary-800/20 text-primary-100 rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4" />
                        <span>Teacher</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full h-14 btn-primary bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 shadow-xl font-bold rounded-xl text-lg tracking-wide animate-glow-pulse"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
            <AuthFooter mode="signup" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
