import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, UserPlus, Zap } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useLoginForm, useSignupForm } from '@/hooks/useAuthForms'

type LoginForm = ReturnType<typeof useLoginForm>
type SignupForm = ReturnType<typeof useSignupForm>


const AuthSection = ( { login, signup, mode, setMode }: { login: LoginForm, signup: SignupForm, mode: 'login' | 'signup', setMode: (mode: 'login' | 'signup') => void } ) => {
  const { t } = useTranslation('other')
  return (
    <div className="w-full">
    {/* Auth Form Container */}
    <div className="animate-fade-in">


      

      {/* Error/Success alerts */}
      {mode === 'login' && login.error && (
        <Alert variant="destructive" className="mb-4 border-destructive/50 bg-destructive/5 animate-fade-in">
          <AlertDescription className="text-destructive-foreground font-medium text-center text-sm">{login.error}</AlertDescription>
        </Alert>
      )}
      {mode === 'signup' && signup.error && (
        <Alert variant="destructive" className="mb-4 border-destructive/50 bg-destructive/5 animate-fade-in">
          <AlertDescription className="text-destructive-foreground font-medium text-center text-sm">{signup.error}</AlertDescription>
        </Alert>
      )}
      {mode === 'signup' && signup.success && (
        <Alert className="mb-4 border-primary/50 bg-primary/5 animate-fade-in">
          <AlertDescription className="text-primary font-medium text-center text-sm">{signup.success}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={mode === 'login' ? login.handleLogin : signup.handleSignup} className="space-y-4 w-full">
        {mode === 'signup' && (
          <Input
            type="text"
            placeholder={t('authModal.fullName')}
            value={signup.formData.fullName}
            onChange={e => signup.setFormData({ ...signup.formData, fullName: e.target.value })}
            required
            className="h-11 border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
          />
        )}
        
        <Input
          type="email"
          placeholder={t('authModal.email')}
          value={mode === 'login' ? login.email : signup.formData.email}
          onChange={e => mode === 'login' ? login.setEmail(e.target.value) : signup.setFormData({ ...signup.formData, email: e.target.value })}
          required
          className="h-11 border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
        />

        {/* Phone number input for signup */}
        {mode === 'signup' && (
          <Input
            type="tel"
            placeholder={t('authModal.phoneNumber') || 'Phone Number'}
            value={signup.formData.phone}
            onChange={e => signup.setFormData({ ...signup.formData, phone: e.target.value })}
            required
            className="h-11 border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
          />
        )}
        
        <div className="relative group">
          <Input
            type={mode === 'login' ? (login.showPassword ? 'text' : 'password') : (signup.showPassword ? 'text' : 'password')}
            placeholder={t('authModal.password')}
            value={mode === 'login' ? login.password : signup.formData.password}
            onChange={e => mode === 'login' ? login.setPassword(e.target.value) : signup.setFormData({ ...signup.formData, password: e.target.value })}
            required
            className="pr-10 h-11 border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
          />
          <button
            type="button"
            onClick={() => mode === 'login' ? login.setShowPassword(!login.showPassword) : signup.setShowPassword(!signup.showPassword)}
            aria-label={t('authModal.togglePasswordVisibility')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-200 p-1"
            tabIndex={-1}
          >
            {mode === 'login' ? (login.showPassword ? <EyeOff size={16} /> : <Eye size={16} />) : (signup.showPassword ? <EyeOff size={16} /> : <Eye size={16} />)}
          </button>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full h-11 bg-primary hover:bg-primary/90 font-semibold rounded-lg text-sm transition-all duration-200 text-primary-foreground"
          disabled={mode === 'login' ? login.loading : signup.loading}
        >
          {mode === 'login'
            ? login.loading
              ? <span className="flex items-center space-x-2"><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span><span>{t('authModal.signingIn')}</span></span>
              : <span className="flex items-center space-x-2"><Zap className="w-4 h-4" /><span>{t('authModal.signIn')}</span></span>
            : signup.loading
              ? <span className="flex items-center space-x-2"><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span><span>{t('authModal.creatingAccount')}</span></span>
              : <span className="flex items-center space-x-2"><UserPlus className="w-4 h-4" /><span>{t('authModal.createAccountButton')}</span></span>}
        </Button>
      </form>

      {/* Google login section for login mode */}
      {mode === 'login' && (
        <>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border"></span>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className=" px-3 py-1 text-muted-foreground">
                {t('authModal.orContinueWith')}
              </span>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={login.handleGoogleLogin}
            className="w-full h-11 border-border hover:bg-muted text-foreground rounded-lg font-medium transition-all duration-200"
          >
            <span className="mr-2 h-4 w-4 inline-block align-middle">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
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
        </>
      )}

      {/* Mode toggle */}
      <div className="mt-4 text-center">
        <button
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 font-medium hover:underline"
        >
          {mode === 'login' ? t('authModal.dontHaveAccount') : t('authModal.alreadyHaveAccount')}
        </button>
      </div>
    </div>
  </div>
  )
}

export default AuthSection