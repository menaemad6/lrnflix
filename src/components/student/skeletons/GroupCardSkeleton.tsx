import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function GroupCardSkeleton() {
  return (
    <Card className="glass-card border-l-8 border-primary-500 rounded-2xl shadow-lg w-full">
      {/* Thumbnail skeleton */}
      <div className="relative">
        <Skeleton className="w-full h-48 rounded-t-2xl" />
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16 rounded-lg" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Skeleton className="h-10 flex-1 min-w-[100px] rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
} 