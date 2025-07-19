import { Skeleton } from "@/components/ui/skeleton";

export function ProfileStatsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Profile Header Skeleton */}
      <div className="glass-card border-0 relative overflow-hidden p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative flex-shrink-0">
          <Skeleton className="w-32 h-32 rounded-full" />
        </div>
        <div className="flex-1 flex flex-col items-center sm:items-start gap-2">
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-32 mb-2" />
          <div className="flex gap-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
        <div className="flex flex-col items-center min-w-[120px]">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card border-0 p-4">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
} 