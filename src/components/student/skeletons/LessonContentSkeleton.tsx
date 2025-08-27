import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const LessonContentSkeleton = ({ onBackToCourse }: { onBackToCourse: () => void }) => {
  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6">


      {/* Lesson Content */}
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Lesson Title and Description */}
        <div className="space-y-3 sm:space-y-4">
          <Skeleton className="h-6 w-64 sm:h-8 sm:w-80 md:w-96" />
          <Skeleton className="h-3 w-2/3 sm:h-4" />
        </div>

        {/* Lesson Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <Skeleton className="h-12 w-full sm:h-14 md:h-16 rounded-lg" />
          <Skeleton className="h-12 w-full sm:h-14 md:h-16 rounded-lg" />
          <Skeleton className="h-12 w-full sm:h-14 md:h-16 rounded-lg" />
        </div>

        {/* Video Player Placeholder */}
        <div className="bg-card rounded-lg border p-3 sm:p-4 md:p-6">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <Skeleton className="h-12 w-12 sm:h-16 sm:w-16 rounded-full" />
          </div>
        </div>

        {/* Lesson Summary */}
        <div className="bg-card rounded-lg border p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
          <Skeleton className="h-5 w-24 sm:h-6 sm:w-32" />
          <div className="space-y-2 sm:space-y-3">
            <Skeleton className="h-3 w-full sm:h-4" />
            <Skeleton className="h-3 w-5/6 sm:h-4" />
            <Skeleton className="h-3 w-4/5 sm:h-4" />
            <Skeleton className="h-3 w-3/4 sm:h-4" />
          </div>
        </div>

        {/* Voice Tutor Section */}
        <div className="bg-card rounded-lg border p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
          <Skeleton className="h-5 w-32 sm:h-6 sm:w-40" />
          <div className="space-y-2 sm:space-y-3">
            <Skeleton className="h-3 w-full sm:h-4" />
            <Skeleton className="h-3 w-2/3 sm:h-4" />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <Skeleton className="h-8 w-20 sm:h-10 sm:w-24" />
            <Skeleton className="h-8 w-28 sm:h-10 sm:w-32" />
          </div>
        </div>

        {/* Completion Button */}
        <div className="flex justify-center pt-3 sm:pt-4">
          <Skeleton className="h-10 w-40 sm:h-12 sm:w-48 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
