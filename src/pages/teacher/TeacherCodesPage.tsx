
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';
const WalletCodesManager = React.lazy(() => import('@/components/wallet/WalletCodesManager').then(m => ({ default: m.WalletCodesManager })));
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export const TeacherCodesPage = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  const handleCreateCode = () => setShowCreateForm((v) => !v);
  const handleCloseCreateForm = () => setShowCreateForm(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <TeacherPageHeader
          title="Wallet Codes"
          subtitle="Create codes for students to redeem credits"
          actionLabel="Generate Code"
          onAction={handleCreateCode}
          actionIcon={<Gift className="w-4 h-4 mr-2" />}
        />
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary-400" />
              Code Management
            </CardTitle>
            <CardDescription>
              Generate wallet codes that students can redeem for credits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <React.Suspense fallback={
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2 p-4 border rounded-xl bg-muted/30">
                    <Skeleton className="h-6 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/3 mb-1" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                ))}
              </div>
            }>
              <WalletCodesManager
                searchTerm={searchTerm}
                onCreateCode={handleCreateCode}
                showCreateForm={showCreateForm}
              />
            </React.Suspense>
          </CardContent>
        </Card>
        {/* Show create form modal if needed (optional, if you want to keep modal logic here) */}
      </div>
    </DashboardLayout>
  );
};
