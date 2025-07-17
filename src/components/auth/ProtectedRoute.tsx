
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import type { RootState } from '@/store/store';

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

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check role permissions if specified
  if (requiredRole && requiredRole.length > 0) {
    if (!requiredRole.includes(user.role)) {
      // Redirect to appropriate dashboard instead of unauthorized page
      const redirectPath = user.role === 'teacher' || user.role === 'admin' 
        ? '/teacher/dashboard' 
        : '/student/dashboard';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};
