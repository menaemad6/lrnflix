import { Skeleton } from "@/components/ui/skeleton";

export function RecentCoursesSkeleton() {
  return (
    <div className="glass-card border-0 lg:col-span-2">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-6 w-20 px-3 py-1 rounded-full" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-white/5">
              <Skeleton className="w-14 h-14 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-5 w-48 mb-2" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="w-8 h-8 rounded" />
            </div>
          ))}
        </div>
        <div className="pt-4">
          <Skeleton className="w-full h-10 rounded" />
        </div>
      </div>
    </div>
  );
}
