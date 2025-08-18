import { Skeleton } from "@/components/ui/skeleton";

export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="glass-card border-0 hover-glow group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-accent-500/5" />
          <div className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="w-12 h-12 rounded-xl" />
          </div>
          <div className="relative z-10 px-6 pb-6">
            <Skeleton className="h-8 w-16 mb-2" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
