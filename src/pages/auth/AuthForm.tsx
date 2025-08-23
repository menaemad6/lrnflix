import React, { useEffect } from 'react';
import { useLoginForm, useSignupForm } from '@/hooks/useAuthForms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, GraduationCap, BookOpen, LogIn, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface AuthFormProps {
  mode: 'login' | 'signup';
  setMode: (mode: 'login' | 'signup') => void;
  onClose?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, setMode, onClose }) => {
  const login = useLoginForm();
  const signup = useSignupForm();
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const { t } = useTranslation('other');

  useEffect(() => {
    if (isLogin && login.isAuthenticated && login.user) {
      onClose?.();
      if (login.user.role === 'teacher' || login.user.role === 'admin') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    }
    if (!isLogin && signup.isAuthenticated && signup.user) {
      onClose?.();
      if (signup.user.role === 'teacher' || signup.user.role === 'admin') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    }
  }, [isLogin, login.isAuthenticated, login.user, signup.isAuthenticated, signup.user, navigate, onClose]);

  // Glassy card style
  return (
    <div className="w-full glass-card border border-border shadow-lg bg-card backdrop-blur-2xl rounded-3xl p-8 animate-fade-in relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary z-10 bg-transparent"
          aria-label={t('authModal.close')}
        >
          <X className="w-5 h-5" />
        </button>
      )}
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-primary shadow-xl animate-glow-pulse border border-primary/20 mb-2">
          {isLogin ? <LogIn className="w-8 h-8 text-primary-foreground" /> : <UserPlus className="w-8 h-8 text-primary-foreground" />}
        </div>
        <h2 className="text-2xl font-black tracking-wide mb-1 text-foreground">
          {isLogin ? t('authModal.welcomeBack') : t('authModal.createAccount')}
        </h2>
        <div className="text-muted-foreground text-base">
          {isLogin ? t('authModal.signInDescription') : t('authModal.signUpDescription')}
        </div>
      </div>
      {/* Error/Success */}
      {isLogin && login.error && (
        <Alert variant="destructive" className="mb-4 border-destructive bg-destructive/10 animate-fade-in">
          <AlertDescription className="text-destructive-foreground">{login.error}</AlertDescription>
        </Alert>
      )}
      {!isLogin && signup.error && (
        <Alert variant="destructive" className="mb-4 border-destructive bg-destructive/10 animate-fade-in">
          <AlertDescription className="text-destructive-foreground">{signup.error}</AlertDescription>
        </Alert>
      )}
      {!isLogin && signup.success && (
        <Alert className="mb-4 border-primary bg-primary/10 animate-fade-in">
          <AlertDescription className="text-primary">{signup.success}</AlertDescription>
        </Alert>
      )}
      {/* Form */}
      <form onSubmit={isLogin ? login.handleLogin : signup.handleSignup} className="space-y-5">
        {!isLogin && (
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
            <Input
              type="text"
              placeholder={t('authModal.fullName')}
              value={signup.formData.fullName}
              onChange={e => signup.setFormData({ ...signup.formData, fullName: e.target.value })}
              required
              className="pl-12 h-12 bg-card border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/30 transition-all"
            />
          </div>
        )}
        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
          <Input
            type="email"
            placeholder={t('authModal.email')}
            value={isLogin ? login.email : signup.formData.email}
            onChange={e => isLogin ? login.setEmail(e.target.value) : signup.setFormData({ ...signup.formData, email: e.target.value })}
            required
            className="pl-12 h-12 bg-card border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/30 transition-all"
          />
        </div>
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
          <Input
            type={isLogin ? (login.showPassword ? 'text' : 'password') : (signup.showPassword ? 'text' : 'password')}
            placeholder={t('authModal.password')}
            value={isLogin ? login.password : signup.formData.password}
            onChange={e => isLogin ? login.setPassword(e.target.value) : signup.setFormData({ ...signup.formData, password: e.target.value })}
            required
            className="pl-12 pr-12 h-12 bg-card border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/30 transition-all"
          />
          <button
            type="button"
            onClick={() => isLogin ? login.setShowPassword(!login.showPassword) : signup.setShowPassword(!signup.showPassword)}
            aria-label={t('authModal.togglePasswordVisibility')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
            tabIndex={-1}
          >
            {isLogin ? (login.showPassword ? <EyeOff size={20} /> : <Eye size={20} />) : (signup.showPassword ? <EyeOff size={20} /> : <Eye size={20} />)}
          </button>
        </div>
        {/* Role select for signup */}
        {!isLogin && (
          <div className="space-y-2">
            <Select
              value={signup.formData.role}
              onValueChange={value => signup.setFormData({ ...signup.formData, role: value as 'student' | 'teacher' })}
            >
              <SelectTrigger className="h-12 bg-card border-border text-foreground focus:border-primary focus:ring-primary/40 rounded-xl transition-all flex items-center">
                <div className="flex items-center space-x-2">
                  {signup.formData.role === 'teacher' ? (
                    <GraduationCap className="w-5 h-5 text-primary" />
                  ) : (
                    <BookOpen className="w-5 h-5 text-primary" />
                  )}
                  <SelectValue placeholder={t('authModal.chooseRole')} />
                </div>
              </SelectTrigger>
              <SelectContent >
                <SelectItem value="student" >
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{t('authModal.student')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="teacher" >
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>{t('authModal.teacher')}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <Button
          type="submit"
          className="w-full h-12 bg-primary shadow-xl hover:bg-primary/80 font-bold rounded-xl text-lg tracking-wide animate-glow-pulse transition-all text-primary-foreground"
          disabled={isLogin ? login.loading : signup.loading}
        >
          {isLogin
            ? login.loading
              ? <span className="flex items-center space-x-2"><span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span><span>{t('authModal.signingIn')}</span></span>
              : t('authModal.signIn')
            : signup.loading
              ? <span className="flex items-center space-x-2"><span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span><span>{t('authModal.creatingAccount')}</span></span>
              : t('authModal.createAccountButton')}
        </Button>
      </form>
      {/* Google login for login mode */}
      {isLogin && (
        <div className="relative my-8 animate-fade-in" style={{ animationDelay: '.4s' }}>
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border"></span>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-card px-4 py-2 text-muted-foreground rounded-full border border-border shadow-sm">
              {t('authModal.orContinueWith')}
            </span>
          </div>
        </div>
      )}
      {isLogin && (
        <Button
          variant="outline"
          onClick={login.handleGoogleLogin}
          className="w-full h-12 border-border bg-card hover:bg-muted text-primary rounded-xl font-medium transition-all shadow animate-fade-in"
        >
          <span className="mr-3 h-5 w-5 inline-block align-middle">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <g>
                <path d="M21.805 12.082c0-.638-.057-1.252-.163-1.837H12v3.478h5.548a4.74 4.74 0 0 1-2.06 3.11v2.58h3.33c1.95-1.8 3.087-4.45 3.087-7.331z" fill="#4285F4"/>
                <path d="M12 22c2.7 0 4.97-.89 6.627-2.41l-3.33-2.58c-.92.62-2.09.99-3.297.99-2.534 0-4.68-1.71-5.44-4.01H3.13v2.62A9.997 9.997 0 0 0 12 22z" fill="#34A853"/>
                <path d="M6.56 13.99A5.99 5.99 0 0 1 6.13 12c0-.69.12-1.36.33-1.99V7.39H3.13A9.997 9.997 0 0 0 2 12c0 1.64.39 3.19 1.13 4.61l3.43-2.62z" fill="#FBBC05"/>
                <path d="M12 6.58c1.47 0 2.78.51 3.81 1.51l2.85-2.85C16.97 3.89 14.7 3 12 3A9.997 9.997 0 0 0 3.13 7.39l3.43 2.62C7.32 8.29 9.47 6.58 12 6.58z" fill="#EA4335"/>
              </g>
            </svg>
          </span>
          {t('authModal.signInWithGoogle')}
        </Button>
      )}
      <div className="mt-6 text-center">
        <button
          onClick={() => setMode(isLogin ? 'signup' : 'login')}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {isLogin ? t('authModal.dontHaveAccount') : t('authModal.alreadyHaveAccount')}
        </button>
      </div>
    </div>
  );
};

export default AuthForm; 