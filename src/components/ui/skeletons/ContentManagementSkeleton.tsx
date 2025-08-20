import { Skeleton } from "@/components/ui/skeleton";

export function ContentManagementSkeleton() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="space-y-6 sm:space-y-8 relative z-10 p-4 sm:p-8">
        {/* Header Skeleton */}
        <div className="card p-4 sm:p-8 border border-border bg-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-6">
              <Skeleton className="h-10 w-32" />
              <div className="space-y-1 sm:space-y-2">
                <Skeleton className="h-8 w-48 sm:w-64 lg:w-80" />
                <Skeleton className="h-4 w-64 sm:w-80 lg:w-96" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid gap-4 sm:gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="card border border-border bg-card group">
              <div className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-xl" />
                      <Skeleton className="h-6 w-48" />
                    </div>
                    <Skeleton className="h-4 w-96" />
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
                <div className="flex gap-2 sm:gap-3 flex-wrap mt-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
