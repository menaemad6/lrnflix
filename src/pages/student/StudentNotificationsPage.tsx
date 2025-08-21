
import React from 'react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import DashboardModernHeader from '@/components/ui/DashboardModernHeader';
import { useTranslation } from 'react-i18next';

export const StudentNotificationsPage = () => {
  const { t } = useTranslation('dashboard');

  return (
    <DashboardLayout>
      <DashboardModernHeader
        title={t('studentNotifications.title')}
        subtitle={t('studentNotifications.subtitle')}
      />
      <div className="space-y-6">
        <NotificationCenter />
      </div>
    </DashboardLayout>
  );
};
