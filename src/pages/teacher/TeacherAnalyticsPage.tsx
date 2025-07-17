
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const TeacherAnalyticsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Analytics & Insights</h2>
          <p className="text-muted-foreground mt-1">Track your teaching performance and student engagement</p>
        </div>
        <Card className="glass-card border-0">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
              <BarChart3 className="h-10 w-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 gradient-text">Advanced Analytics Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Get detailed insights into student progress, course performance, and engagement metrics.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
