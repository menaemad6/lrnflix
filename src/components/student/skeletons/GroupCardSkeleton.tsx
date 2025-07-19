import { Skeleton } from "@/components/ui/skeleton";

export function GroupCardSkeleton() {
  return (
    <div className="glass-card border-0 p-6 flex flex-col gap-4 min-w-0">
      <div className="flex items-center gap-4 mb-2">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-6 w-32 mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-2" />
      <div className="flex gap-2 mt-auto">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
} 