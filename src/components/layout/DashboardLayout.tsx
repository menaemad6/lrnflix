
import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from './DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="particle-bg">
        <div className="fixed inset-0 mesh-gradient opacity-20 pointer-events-none" />
        <SidebarProvider>
          <div className="flex min-h-[calc(100vh-4rem)] w-full">
            <DashboardSidebar />
            <SidebarInset className="flex-1 w-full pt-20">
              <div className="relative z-10 w-full">
                <main className="p-responsive space-responsive w-full">
                  {children}
                </main>
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
};
