import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTenant } from '@/contexts/TenantContext';
import { useStudentDashboardData } from '@/lib/queries';
import { StudentDashboardSkeleton } from './StudentDashboardSkeleton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RootState } from '@/store/store';
import { StudentProfileStats } from '@/components/student/StudentProfileStats';
import { AiAdviceCard } from '@/components/student/AiAdviceCard';
import { ContinueLearningSection } from '@/components/student/ContinueLearningSection';
import { WalletCard } from '@/components/wallet/WalletCard';
import { StudentGoals } from '@/components/student/StudentGoals';
import { StudentActivity } from '@/components/student/StudentActivity';
import { StudentAchievements } from '@/components/student/StudentAchievements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Zap, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo/SEOHead';

interface EnrolledCourse {
    id: string;
    course: {
        id: string;
        title: string;
        description: string;
        category: string;
        price: number;
        instructor_id: string;
        instructor_name?: string;
        enrollment_code?: string;
        cover_image_url?: string;
        created_at?: string;
        avatar_url?: string;
    };
    enrolled_at: string;
    progress?: number;
    totalLessons?: number;
    completedLessons?: number;
    enrollment_count?: number;
}

interface Stats {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalCreditsSpent: number;
    studyStreak: number;
    avgQuizScore: number;
    totalStudyTime: number;
}

export const StudentDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { teacher } = useTenant();
  const { data, isLoading } = useStudentDashboardData(user, teacher);
  const navigate = useNavigate();
  const { t } = useTranslation('dashboard');

  if (isLoading) {
    return <StudentDashboardSkeleton />;
  }
  
  const { enrolledCourses, stats } = data || { enrolledCourses: [], stats: {
      totalCourses: 0,
      completedCourses: 0,
      inProgressCourses: 0,
      totalCreditsSpent: 0,
      studyStreak: 0,
      avgQuizScore: 0,
      totalStudyTime: 0
  } };

  return (
    <>
      <SEOHead />
      <DashboardLayout>
        <div className="space-y-8">
        <StudentProfileStats stats={stats} user={user!} />
        <AiAdviceCard />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            <ContinueLearningSection
              enrolledCourses={enrolledCourses}
              onContinue={(courseId) => navigate(`/courses/${courseId}`)}
            />
            <div className="block lg:hidden">
              <WalletCard />
            </div>
            <StudentGoals stats={stats} />
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div className="block lg:hidden">
                <StudentActivity stats={stats} />
              </div>
              <StudentAchievements stats={stats} />
            </div>
          </div>
          <div className="space-y-4 sm:space-y-6 hidden lg:block">
            <WalletCard />
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="gradient-text">{t('quick_actions')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/student/store">
                    <div className="p-4 rounded-xl hover:bg-white/5 transition-colors border border-white/10 group cursor-pointer">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Zap className="h-5 w-5 text-purple-400" />
                      </div>
                      <h3 className="font-medium mb-1">{t('buy_credits')}</h3>
                      <p className="text-xs text-muted-foreground">{t('purchase_credits')}</p>
                    </div>
                  </Link>
                  <Link to="/student/groups">
                    <div className="p-4 rounded-xl hover:bg-white/5 transition-colors border border-white/10 group cursor-pointer">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-accent-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Users className="h-5 w-5 text-blue-400" />
                      </div>
                      <h3 className="font-medium mb-1">{t('study_groups')}</h3>
                      <p className="text-xs text-muted-foreground">{t('join_or_create_groups')}</p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
            <StudentActivity stats={stats} />
          </div>
        </div>
      </div>
    </DashboardLayout>
    </>
  );
};
