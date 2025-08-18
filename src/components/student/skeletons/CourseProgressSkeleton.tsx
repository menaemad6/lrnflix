import { Skeleton } from '@/components/ui/skeleton';

export const CourseProgressSkeleton = () => {
  return (
    <div className="min-h-screen bg-background flex pt-20">
      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <Skeleton className="h-8 w-8 rounded-full mx-auto" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
      
      {/* Right Sidebar */}
      <div className="w-80 border-l bg-card/50 backdrop-blur-sm relative">
        {/* Collapse/Expand Button */}
        <div className="absolute -left-4 top-8 z-50 h-8 w-8 rounded-full bg-background border border-border shadow-lg" />
        
        <div className="p-6 space-y-6">
          {/* Course Header */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
          </div>
          
          {/* Progress Section */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
          
          {/* Lessons Section */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-20" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg border">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Quizzes Section */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-16" />
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg border">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Course Stats */}
          <div className="space-y-3 pt-4 border-t">
            <Skeleton className="h-5 w-28" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
