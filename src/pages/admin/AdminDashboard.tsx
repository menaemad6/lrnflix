import React, { Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { AdminHeroSection } from '@/components/admin/AdminHeroSection';
import { AdminStatsGrid } from '@/components/admin/AdminStatsGrid';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { AdminRecentActivity } from '@/components/admin/AdminRecentActivity';
import { AdminSystemOverview } from '@/components/admin/AdminSystemOverview';
import { AdminQuickActions } from '@/components/admin/AdminQuickActions';
import { useAdminDashboardData } from '@/lib/adminQueries';
import { useTenant } from '@/contexts/TenantContext';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const AdminDashboardSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-32 w-full" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-96 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  </div>
);

export const AdminDashboard = () => {
  const { teacher } = useTenant();
  const { data, isLoading } = useAdminDashboardData(teacher?.id || null);

  if (isLoading) {
    return (
      <DashboardLayout>
        <AdminDashboardSkeleton />
      </DashboardLayout>
    );
  }

  const {
    stats = {},
    analytics = {},
    recentActivity = [],
    systemOverview = {}
  } = data || {};

  return (
    <>
      <SEOHead />
      <DashboardLayout>
        <div className="space-y-6">
          {/* Hero Section */}
          <Suspense fallback={<Skeleton className="h-32 w-full" />}>
            <AdminHeroSection tenantName={teacher?.display_name || null} />
          </Suspense>

          {/* Stats Grid */}
          <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>}>
            <AdminStatsGrid stats={stats} />
          </Suspense>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Analytics Section */}
              <Suspense fallback={<Skeleton className="h-96" />}>
                <AdminAnalytics analytics={analytics} />
              </Suspense>

              {/* Recent Activity */}
              <Suspense fallback={<Skeleton className="h-80" />}>
                <AdminRecentActivity activities={recentActivity} />
              </Suspense>
            </div>

            <div className="space-y-6">
              {/* Quick Actions */}
              <Suspense fallback={<Skeleton className="h-64" />}>
                <AdminQuickActions />
              </Suspense>

              {/* System Overview */}
              <Suspense fallback={<Skeleton className="h-80" />}>
                <AdminSystemOverview overview={systemOverview} />
              </Suspense>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};