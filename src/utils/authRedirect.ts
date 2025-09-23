import { User } from '@/store/slices/authSlice';

/**
 * Get the default redirect path based on user role
 */
export function getDefaultRedirectPath(user: User): string {
  if (user.role === 'teacher') {
    return '/teacher/dashboard';
  }
  if (user.role === 'admin') {
    return '/admin/dashboard';
  }
  return '/student/dashboard';
}

/**
 * Get the intended destination from URL parameters or fallback to default
 */
export function getIntendedDestination(
  nextParam: string | null, 
  user: User, 
  fallbackPath?: string
): string {
  if (nextParam) {
    try {
      const decoded = decodeURIComponent(nextParam);
      // Basic validation - ensure it's a relative path and doesn't contain malicious redirects
      if (decoded.startsWith('/') && !decoded.includes('://')) {
        return decoded;
      }
    } catch (error) {
      console.warn('Invalid next parameter:', nextParam);
    }
  }
  
  return fallbackPath || getDefaultRedirectPath(user);
}

/**
 * Build login URL with next parameter
 */
export function buildLoginUrl(intendedDestination: string): string {
  return `/auth/login?next=${encodeURIComponent(intendedDestination)}`;
}

/**
 * Build OAuth callback URL with next parameter
 */
export function buildOAuthCallbackUrl(nextParam: string | null): string {
  const baseUrl = `${window.location.origin}/auth/callback`;
  if (nextParam) {
    return `${baseUrl}?next=${encodeURIComponent(nextParam)}`;
  }
  return baseUrl;
}
