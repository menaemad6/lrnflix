import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProfileStatsSkeleton } from '@/components/student/skeletons/ProfileStatsSkeleton';
import { AiAdviceCardSkeleton } from '@/components/student/skeletons/AiAdviceCardSkeleton';
import { ContinueLearningSkeleton } from '@/components/student/skeletons/ContinueLearningSkeleton';
import { WalletCardSkeleton } from '@/components/student/skeletons/WalletCardSkeleton';
import { StudentGoalsSkeleton } from '@/components/student/skeletons/StudentGoalsSkeleton';
import { StudentAchievementsSkeleton } from '@/components/student/skeletons/StudentAchievementsSkeleton';
import { StudentActivitySkeleton } from '@/components/student/skeletons/StudentActivitySkeleton';
import { QuickActionsSkeleton } from '@/components/student/skeletons/QuickActionsSkeleton';

export const StudentDashboardSkeleton = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <ProfileStatsSkeleton />
        <AiAdviceCardSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ContinueLearningSkeleton />
            <div className="block lg:hidden">
              <WalletCardSkeleton />
            </div>
            <StudentGoalsSkeleton />
            <div className="grid grid-cols-1 gap-6">
              <div className="block lg:hidden">
                <StudentActivitySkeleton />
              </div>
              <StudentAchievementsSkeleton />
            </div>
          </div>
          <div className="space-y-6 hidden lg:block">
            <WalletCardSkeleton />
            <QuickActionsSkeleton />
            <StudentActivitySkeleton />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
