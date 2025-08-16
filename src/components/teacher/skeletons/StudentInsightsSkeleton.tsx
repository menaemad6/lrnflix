import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function StudentInsightsSkeleton() {
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
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-48" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="flex gap-4">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-3 w-12" />
                  ))}
                </div>
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
