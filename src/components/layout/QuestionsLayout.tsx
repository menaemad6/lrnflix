import React from 'react';
import { ModernScrollbar } from '@/components/ui/modern-scrollbar';
import { useRandomBackground } from '@/hooks/useRandomBackground';

interface QuestionsLayoutProps {
  children: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

export const QuestionsLayout = ({ children, leftSidebar, rightSidebar }: QuestionsLayoutProps) => {
  const bgClass = useRandomBackground();

  return (
    <div className={`${bgClass} min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-10 md:pt-16 lg:pt-20`}>
      <div className="w-full px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-none">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            {leftSidebar && (
              <div className="sticky top-8">
                <ModernScrollbar 
                  className="h-[calc(100vh-4rem)] pr-2"
                  maxHeight="calc(100vh - 4rem)"
                >
                  <div className="space-y-4">
                    {leftSidebar}
                  </div>
                </ModernScrollbar>
              </div>
            )}
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            {children}
          </div>
          
          {/* Right Sidebar */}
          <div className="lg:col-span-3 order-3">
            {rightSidebar && (
              <div className="sticky top-8">
                <ModernScrollbar 
                  className="h-[calc(100vh-4rem)] pr-2"
                  maxHeight="calc(100vh - 4rem)"
                >
                  <div className="space-y-4">
                    {rightSidebar}
                  </div>
                </ModernScrollbar>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
