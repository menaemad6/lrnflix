import { Skeleton } from "@/components/ui/skeleton";

export function CourseCardSkeleton() {
  return (
    <div className="glass-card border-0 p-6 flex flex-col gap-4">
      <Skeleton className="h-40 w-full rounded-xl mb-2" />
      <Skeleton className="h-6 w-3/4 mb-1" />
      <Skeleton className="h-4 w-1/2 mb-2" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-24 mt-2" />
    </div>
  );
} 