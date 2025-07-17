
import React from 'react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import DashboardModernHeader from '@/components/ui/DashboardModernHeader';

export const StudentNotificationsPage = () => {
  return (
    <DashboardLayout>
      <DashboardModernHeader
        title="Notifications"
        subtitle="Stay updated with your learning progress"
      />
      <div className="space-y-6">
        <NotificationCenter />
      </div>
    </DashboardLayout>
  );
};
