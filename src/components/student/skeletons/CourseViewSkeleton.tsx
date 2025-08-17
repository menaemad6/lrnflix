import { Skeleton } from '@/components/ui/skeleton';

export const CourseViewSkeleton = () => {
  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5"></div>
        <div className="relative container mx-auto px-6 py-16 ">
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-16 w-3/4" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-2/3" />
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <Skeleton className="h-[500px] w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
