import React, { useEffect } from 'react';
import { useLoginForm, useSignupForm } from '@/hooks/useAuthForms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, LogIn, X, Sparkles, Shield, Zap } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getIntendedDestination } from '@/utils/authRedirect';
import { useTenant } from '@/contexts/TenantContext';

interface AuthFormProps {
  mode: 'login' | 'signup';
  setMode: (mode: 'login' | 'signup') => void;
  onClose?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, setMode, onClose }) => {
  const login = useLoginForm();
  const signup = useSignupForm();
  const { teacher, slug } = useTenant();
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation('other');

  // Get the next parameter from URL
  const nextParam = searchParams.get('next');

  useEffect(() => {
    if (isLogin && login.isAuthenticated && login.user) {
      onClose?.();
      
      // Redirect to intended destination if next parameter exists, otherwise use default role-based redirect
      const redirectPath = getIntendedDestination(nextParam, login.user);
      navigate(redirectPath);
    }
    if (!isLogin && signup.isAuthenticated && signup.user) {
      onClose?.();
      
      // Redirect to intended destination if next parameter exists, otherwise use default role-based redirect
      const redirectPath = getIntendedDestination(nextParam, signup.user);
      navigate(redirectPath);
    }
  }, [isLogin, login.isAuthenticated, login.user, signup.isAuthenticated, signup.user, navigate, onClose, nextParam]);

  // Premium glass card style with enhanced effects - full screen on mobile
  return (
    <div className="w-full h-full sm:h-auto sm:glass-card-enhanced border border-white/20 shadow-2xl bg-card/80 backdrop-blur-2xl sm:rounded-3xl p-6 sm:p-8 animate-fade-in relative overflow-hidden flex flex-col justify-center">
      {/* Animated background particles - hidden on mobile for cleaner look */}
      <div className="hidden sm:block absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-4 left-4 w-2 h-2 bg-primary/30 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-12 right-8 w-1 h-1 bg-secondary/40 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-accent/30 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-16 right-4 w-1 h-1 bg-primary/20 rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 z-10 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-200"
          aria-label={t('authModal.close')}
        >
          <X className="w-5 h-5" />
        </button>
      )}
      
      <div className="flex flex-col items-center mb-8 text-center">
        {/* Enhanced logo section */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl animate-glow-pulse bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/20">
            <img 
              src={teacher && slug ? `/${slug}/logo.png` : "/assests/logo.png"}
              alt="Logo" 
              className="w-12 h-12 object-contain"
              onError={(e) => {
                // Fallback to default logo if tenant logo doesn't exist
                if (e.currentTarget.src !== "/assests/logo.png") {
                  e.currentTarget.src = "/assests/logo.png";
                }
              }}
            />
          </div>
          {/* Floating sparkles - hidden on mobile */}
          <Sparkles className="hidden sm:block absolute -top-2 -right-2 w-6 h-6 text-primary animate-pulse" />
          <Shield className="hidden sm:block absolute -bottom-2 -left-2 w-5 h-5 text-secondary animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <h2 className="text-3xl font-black tracking-wide mb-3 text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center">
          {isLogin ? t('authModal.welcomeBack') : t('authModal.createAccount')}
        </h2>
        <div className="text-muted-foreground text-base text-center max-w-xs mx-auto">
          {isLogin ? t('authModal.signInDescription') : t('authModal.signUpDescription')}
        </div>
      </div>

      {/* Error/Success alerts with enhanced styling */}
      {isLogin && login.error && (
        <Alert variant="destructive" className="mb-6 border-destructive/30 bg-destructive/10 backdrop-blur-sm animate-fade-in">
          <AlertDescription className="text-destructive-foreground font-medium text-center">{login.error}</AlertDescription>
        </Alert>
      )}
      {!isLogin && signup.error && (
        <Alert variant="destructive" className="mb-6 border-destructive/30 bg-destructive/10 backdrop-blur-sm animate-fade-in">
          <AlertDescription className="text-destructive-foreground font-medium text-center">{signup.error}</AlertDescription>
        </Alert>
      )}
      {!isLogin && signup.success && (
        <Alert className="mb-6 border-primary/30 bg-primary/10 backdrop-blur-sm animate-fade-in">
          <AlertDescription className="text-primary font-medium text-center">{signup.success}</AlertDescription>
        </Alert>
      )}

      {/* Enhanced form */}
      <form onSubmit={isLogin ? login.handleLogin : signup.handleSignup} className="space-y-6 w-full max-w-sm mx-auto">
        {!isLogin && (
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5 group-focus-within:scale-110 transition-transform duration-200">
              <User />
            </div>
            <Input
              type="text"
              placeholder={t('authModal.fullName')}
              value={signup.formData.fullName}
              onChange={e => signup.setFormData({ ...signup.formData, fullName: e.target.value })}
              required
              className="pl-14 h-14 bg-card/50 border-white/20 rounded-2xl text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20 focus:bg-card/80 transition-all duration-300 backdrop-blur-sm"
            />
          </div>
        )}
        
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5 group-focus-within:scale-110 transition-transform duration-200">
            <Mail />
          </div>
          <Input
            type="email"
            placeholder={t('authModal.email')}
            value={isLogin ? login.email : signup.formData.email}
            onChange={e => isLogin ? login.setEmail(e.target.value) : signup.setFormData({ ...signup.formData, email: e.target.value })}
            required
            className="pl-14 h-14 bg-card/50 border-white/20 rounded-2xl text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20 focus:bg-card/80 transition-all duration-300 backdrop-blur-sm"
          />
        </div>

        {/* Phone number input for signup */}
        {!isLogin && (
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5 group-focus-within:scale-110 transition-transform duration-200">
              <User />
            </div>
            <Input
              type="tel"
              placeholder={t('authModal.phoneNumber') || 'Phone Number'}
              value={signup.formData.phone}
              onChange={e => signup.setFormData({ ...signup.formData, phone: e.target.value })}
              required
              className="pl-14 h-14 bg-card/50 border-white/20 rounded-2xl text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20 focus:bg-card/80 transition-all duration-300 backdrop-blur-sm"
            />
          </div>
        )}
        
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5 group-focus-within:scale-110 transition-transform duration-200">
            <Lock />
          </div>
          <Input
            type={isLogin ? (login.showPassword ? 'text' : 'password') : (signup.showPassword ? 'text' : 'password')}
            placeholder={t('authModal.password')}
            value={isLogin ? login.password : signup.formData.password}
            onChange={e => isLogin ? login.setPassword(e.target.value) : signup.setFormData({ ...signup.formData, password: e.target.value })}
            required
            className="pl-14 pr-14 h-14 bg-card/50 border-white/20 rounded-2xl text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20 focus:bg-card/80 transition-all duration-300 backdrop-blur-sm"
          />
          <button
            type="button"
            onClick={() => isLogin ? login.setShowPassword(!login.showPassword) : signup.setShowPassword(!signup.showPassword)}
            aria-label={t('authModal.togglePasswordVisibility')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-200 p-1 rounded-lg hover:bg-white/10"
            tabIndex={-1}
          >
            {isLogin ? (login.showPassword ? <EyeOff size={20} /> : <Eye size={20} />) : (signup.showPassword ? <EyeOff size={20} /> : <Eye size={20} />)}
          </button>
        </div>

        {/* Enhanced submit button */}
        <Button
          type="submit"
          className="w-full h-14 bg-gradient-to-r from-primary to-secondary shadow-2xl hover:from-primary/90 hover:to-secondary/90 font-bold rounded-2xl text-lg tracking-wide animate-glow-pulse transition-all duration-300 text-primary-foreground relative overflow-hidden group"
          disabled={isLogin ? login.loading : signup.loading}
        >
          {/* Button shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          {isLogin
            ? login.loading
              ? <span className="flex items-center space-x-3 relative z-10"><span className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></span><span>{t('authModal.signingIn')}</span></span>
              : <span className="flex items-center space-x-2 relative z-10"><Zap className="w-5 h-5" /><span>{t('authModal.signIn')}</span></span>
            : signup.loading
              ? <span className="flex items-center space-x-3 relative z-10"><span className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></span><span>{t('authModal.creatingAccount')}</span></span>
              : <span className="flex items-center space-x-2 relative z-10"><UserPlus className="w-5 h-5" /><span>{t('authModal.createAccountButton')}</span></span>}
        </Button>
      </form>

      {/* Enhanced Google login section */}
      {isLogin && (
        <div className="relative my-8 animate-fade-in" style={{ animationDelay: '.4s' }}>
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/20"></span>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-card/50 backdrop-blur-sm px-6 py-3 text-muted-foreground rounded-full border border-white/20 shadow-lg">
              {t('authModal.orContinueWith')}
            </span>
          </div>
        </div>
      )}
      
      {isLogin && (
        <Button
          variant="outline"
          onClick={login.handleGoogleLogin}
          className="w-full max-w-sm mx-auto h-14 border-white/20 bg-card/50 hover:bg-card/80 text-primary rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm group"
        >
          <span className="mr-3 h-6 w-6 inline-block align-middle group-hover:scale-110 transition-transform duration-200">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
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

      {/* Enhanced mode toggle */}
      <div className="mt-8 text-center">
        <button
          onClick={() => setMode(isLogin ? 'signup' : 'login')}
          className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 font-medium hover:underline"
        >
          {isLogin ? t('authModal.dontHaveAccount') : t('authModal.alreadyHaveAccount')}
        </button>
      </div>
    </div>
  );
};

export default AuthForm; 