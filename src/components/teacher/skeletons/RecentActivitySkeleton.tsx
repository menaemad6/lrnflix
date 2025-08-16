import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function RecentActivitySkeleton() {
  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
