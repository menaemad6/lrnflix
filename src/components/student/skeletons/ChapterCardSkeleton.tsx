import { Skeleton } from "@/components/ui/skeleton";

export function ChapterCardSkeleton() {
  return (
    <div className="glass-card border-0 p-0 flex flex-col min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 pb-3">
        <Skeleton className="w-14 h-14 rounded-2xl" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-8 w-40 mb-2" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <Skeleton className="h-4 w-3/4 mx-6 mb-2" />
      <div className="space-y-3 mt-2 px-4 pb-4">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
      <div className="px-6 pb-6 mt-auto">
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
} 