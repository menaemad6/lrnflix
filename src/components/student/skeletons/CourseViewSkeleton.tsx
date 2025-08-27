import { Skeleton } from '@/components/ui/skeleton';

export const CourseViewSkeleton = () => {
  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden pt-16 sm:pt-20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5"></div>
        <div className="relative container mx-auto px-4 sm:px-6 py-8 sm:py-16">
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <Skeleton className="h-6 w-20 sm:h-8 sm:w-24" />
                  <Skeleton className="h-5 w-14 sm:h-6 sm:w-16" />
                </div>
                <Skeleton className="h-12 w-full sm:h-16 sm:w-3/4" />
                <Skeleton className="h-5 w-full sm:h-6" />
                <Skeleton className="h-5 w-2/3 sm:h-6" />
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
                  <Skeleton className="h-4 w-32 sm:h-5 sm:w-48" />
                  <Skeleton className="h-4 w-32 sm:h-5 sm:w-48" />
                  <Skeleton className="h-4 w-20 sm:h-5 sm:w-24" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Skeleton className="h-20 w-full sm:h-24" />
                  <Skeleton className="h-20 w-full sm:h-24" />
                  <Skeleton className="h-20 w-full sm:h-24 sm:col-span-2 lg:col-span-1" />
                </div>
              </div>
              <Skeleton className="h-36 w-full sm:h-48" />
              <Skeleton className="h-72 w-full sm:h-96" />
              <Skeleton className="h-36 w-full sm:h-48" />
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <Skeleton className="h-[400px] w-full sm:h-[500px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
