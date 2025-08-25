
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import type { RootState } from '@/store/store';
import { buildLoginUrl } from '@/utils/authRedirect';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: ('admin' | 'teacher' | 'student')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isLoading, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    // Get the next parameter from URL or use current location
    const nextParam = searchParams.get('next');
    const intendedDestination = nextParam || location.pathname + location.search;
    
    return <Navigate to={buildLoginUrl(intendedDestination)} state={{ from: location }} replace />;
  }

  // Check role permissions if specified
  if (requiredRole && requiredRole.length > 0 && !requiredRole.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
