
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';
import { WalletCodesManager } from '@/components/wallet/WalletCodesManager';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const TeacherCodesPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Wallet Codes</h2>
          <p className="text-muted-foreground mt-1">Create codes for students to redeem credits</p>
        </div>
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-emerald-400" />
              Code Management
            </CardTitle>
            <CardDescription>
              Generate wallet codes that students can redeem for credits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WalletCodesManager />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
