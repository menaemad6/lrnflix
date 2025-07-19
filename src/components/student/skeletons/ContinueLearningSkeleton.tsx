import { Skeleton } from "@/components/ui/skeleton";

export function ContinueLearningSkeleton() {
  return (
    <div className="glass-card border-0 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <div className="flex-1">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-24 ml-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
      <div className="flex justify-center mt-4">
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
} 