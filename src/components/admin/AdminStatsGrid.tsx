import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, BookOpen, GraduationCap, DollarSign, UserCheck, TrendingUp, Target, Zap } from 'lucide-react';
import { AdminStats } from '@/lib/adminQueries';

interface AdminStatsGridProps {
  stats: Partial<AdminStats>;
}

export const AdminStatsGrid: React.FC<AdminStatsGridProps> = ({ stats }) => {
  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: Users,
      color: 'blue',
      description: `${stats.totalTeachers || 0} teachers, ${stats.totalStudents || 0} students`
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses || 0,
      icon: BookOpen,
      color: 'emerald',
      description: `${stats.totalEnrollments || 0} total enrollments`
    },
    {
      title: 'Active Users',
      value: (stats.activeTeachers || 0) + (stats.activeStudents || 0),
      icon: UserCheck,
      color: 'purple',
      description: `${stats.activeTeachers || 0} teachers, ${stats.activeStudents || 0} students`
    },
    {
      title: 'Total Revenue',
      value: `$${(stats.totalRevenue || 0).toFixed(0)}`,
      icon: DollarSign,
      color: 'amber',
      description: `$${(stats.monthlyRevenue || 0).toFixed(0)} this month`
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      emerald: 'bg-emerald-100 text-emerald-600',
      purple: 'bg-purple-100 text-purple-600',
      amber: 'bg-amber-100 text-amber-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </div>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getColorClasses(stat.color)}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};