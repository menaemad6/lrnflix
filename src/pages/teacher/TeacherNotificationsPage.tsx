
import React from 'react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SEOHead } from '@/components/seo';

export const TeacherNotificationsPage = () => {
  return (
    <>
      <SEOHead />
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold gradient-text">Notifications</h2>
            <p className="text-muted-foreground mt-1">Stay updated with your teaching activities</p>
          </div>
          <NotificationCenter />
        </div>
      </DashboardLayout>
    </>
  );
};
