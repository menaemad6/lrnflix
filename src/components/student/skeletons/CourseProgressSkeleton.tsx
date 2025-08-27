import { Skeleton } from '@/components/ui/skeleton';

export const CourseProgressSkeleton = () => {
  return (
    <div className="min-h-screen bg-background flex pt-20">
      {/* Main Content Area */}
      <div className="flex-1 min-w-0 px-1 sm:px-4">
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-3 sm:space-y-4 px-4">
            <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-full mx-auto" />
            <Skeleton className="h-4 w-32 sm:w-40 md:w-48 lg:w-56 mx-auto" />
            <Skeleton className="h-3 w-48 sm:w-56 md:w-64 lg:w-72 mx-auto" />
          </div>
        </div>
      </div>
      
      {/* Right Sidebar - Hidden on mobile, visible on sm and up */}
      <div className="hidden sm:block w-64 sm:w-72 md:w-80 border-l bg-card/50 backdrop-blur-sm relative">
        {/* Collapse/Expand Button */}
        <div className="absolute -left-4 top-8 z-50 h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-background border border-border shadow-lg" />
        
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          {/* Course Header */}
          <div className="space-y-3 sm:space-y-4">
            <Skeleton className="h-6 w-24 sm:w-28 md:w-32" />
            <Skeleton className="h-3 w-36 sm:w-40 md:w-48" />
            <Skeleton className="h-3 w-28 sm:w-32 md:w-40" />
          </div>
          
          {/* Progress Section */}
          <div className="space-y-2 sm:space-y-3">
            <Skeleton className="h-4 w-20 sm:w-24" />
            <div className="space-y-2">
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-3/4" />
            </div>
          </div>
          
          {/* Lessons Section */}
          <div className="space-y-2 sm:space-y-3">
            <Skeleton className="h-4 w-16 sm:w-20" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg border">
                  <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded-full" />
                  <Skeleton className="h-3 sm:h-4 flex-1" />
                  <Skeleton className="h-2 w-8 sm:w-12" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Quizzes Section */}
          <div className="space-y-2 sm:space-y-3">
            <Skeleton className="h-4 w-14 sm:w-16" />
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg border">
                  <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded-full" />
                  <Skeleton className="h-3 sm:h-4 flex-1" />
                  <Skeleton className="h-2 w-12 sm:w-16" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Course Stats */}
          <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t">
            <Skeleton className="h-4 w-24 sm:w-28" />
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Skeleton className="h-12 w-full sm:h-14 md:h-16 rounded-lg" />
              <Skeleton className="h-12 w-full sm:h-14 md:h-16 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
