import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Shield, Globe, Building } from 'lucide-react';

interface AdminHeroSectionProps {
  tenantName: string | null;
}

export const AdminHeroSection: React.FC<AdminHeroSectionProps> = ({ tenantName }) => {
  return (
    <Card className="glass-card border-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  {tenantName ? `${tenantName} - Admin Dashboard` : 'Admin Dashboard'}
                </h1>
                <p className="text-muted-foreground">
                  {tenantName 
                    ? `Managing ${tenantName}'s platform data and operations`
                    : 'Managing platform-wide data and operations'
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
              {tenantName ? (
                <>
                  <Building className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium">Tenant Mode</span>
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-medium">Global Mode</span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
              <Shield className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium">Full Access</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};