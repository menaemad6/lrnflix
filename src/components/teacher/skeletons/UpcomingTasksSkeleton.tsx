import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function UpcomingTasksSkeleton() {
  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
