import { Skeleton } from "@/components/ui/skeleton";

export function TeacherCardSkeleton() {
  return (
    <div className="h-full rounded-3xl border-0 glass-card shadow-xl bg-background/80 overflow-hidden flex flex-col">
      <div className="relative h-32 sm:h-36 bg-gradient-to-r from-primary to-primary-400">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="flex flex-col items-center -mt-10 px-6">
        <Skeleton className="w-20 h-20 rounded-full border-4 border-background shadow-lg bg-white -mt-10" />
        <Skeleton className="h-6 w-32 mt-3 mb-1" />
        <Skeleton className="h-4 w-20 mb-2" />
        <div className="flex items-center gap-4 mt-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <div className="px-6 mt-4 flex-1">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
} 