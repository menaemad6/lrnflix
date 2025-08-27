import { Skeleton } from "@/components/ui/skeleton";

export function TransactionCardSkeleton() {
  return (
    <div className="glass-card border-0 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 mb-2 min-w-0">
      <Skeleton className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl" />
      <div className="flex-1">
        <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 mb-2" />
        <Skeleton className="h-2.5 sm:h-3 w-16 sm:w-20" />
      </div>
      <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
      <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
    </div>
  );
} 