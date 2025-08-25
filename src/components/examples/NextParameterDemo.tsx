import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Shield, ArrowRight } from 'lucide-react';

/**
 * Demo component showing how the next parameter works
 * This component demonstrates how to create links that will redirect users
 * to their intended destination after authentication
 */
export const NextParameterDemo: React.FC = () => {
  // Example protected routes that users might want to access
  const protectedRoutes = [
    {
      path: '/teacher/dashboard',
      title: 'Teacher Dashboard',
      description: 'Access your teaching analytics and course management tools',
      icon: Shield,
    },
    {
      path: '/student/courses',
      title: 'Student Courses',
      description: 'Browse and enroll in available courses',
      icon: ExternalLink,
    },
    {
      path: '/courses/123/progress',
      title: 'Course Progress',
      description: 'Continue learning where you left off',
      icon: ArrowRight,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Next Parameter Demo</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          This demo shows how the authentication system handles the <code>next</code> parameter 
          to redirect users to their intended destination after login.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            When a user tries to access a protected route without being authenticated, 
            they are redirected to the login page with a <code>next</code> parameter 
            containing their intended destination.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">1. User clicks protected link</h4>
              <p className="text-sm text-muted-foreground">
                User tries to access a route that requires authentication
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">2. Redirected to login</h4>
              <p className="text-sm text-muted-foreground">
                URL becomes: <code>/auth/login?next=/protected/route</code>
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">3. User authenticates</h4>
              <p className="text-sm text-muted-foreground">
                User successfully logs in or signs up
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">4. Redirected to destination</h4>
              <p className="text-sm text-muted-foreground">
                User is automatically taken to their intended route
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Try It Out</CardTitle>
          <CardDescription>
            Click on any of these protected routes to see the next parameter in action. 
            You'll be redirected to login, and after authentication, you'll be taken to your intended destination.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {protectedRoutes.map((route) => {
              const Icon = route.icon;
              return (
                <Link
                  key={route.path}
                  to={route.path}
                  className="block group"
                >
                  <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Icon className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {route.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {route.description}
                      </p>
                      <div className="mt-3 text-xs text-primary font-mono">
                        {route.path}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Testing</CardTitle>
          <CardDescription>
            You can also manually test by adding a next parameter to any URL:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <code className="text-sm">
                /auth/login?next=/teacher/dashboard
              </code>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <code className="text-sm">
                /auth/login?next=/student/courses
              </code>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <code className="text-sm">
                /auth/login?next=/courses/123/progress
              </code>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            After logging in, you'll be redirected to the specified path.
          </p>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button asChild>
          <Link to="/">
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};
