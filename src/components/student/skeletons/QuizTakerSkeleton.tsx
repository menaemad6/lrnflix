import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const QuizTakerSkeleton = ({ onBackToCourse }: { onBackToCourse: () => void }) => {
  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6">



      {/* Quiz Content */}
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Quiz Title and Description */}
        <div className="space-y-3 sm:space-y-4">
          <Skeleton className="h-6 w-64 sm:h-8 sm:w-80 md:w-96" />
          <Skeleton className="h-3 w-2/3 sm:h-4" />
        </div>

        {/* Quiz Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <Skeleton className="h-12 w-full sm:h-14 md:h-16 rounded-lg" />
          <Skeleton className="h-12 w-full sm:h-14 md:h-16 rounded-lg" />
          <Skeleton className="h-12 w-full sm:h-14 md:h-16 rounded-lg" />
        </div>

        {/* Question Content */}
        <div className="bg-card rounded-lg border p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          {/* Question Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <Skeleton className="h-4 w-24 sm:h-5 sm:w-32" />
            <Skeleton className="h-4 w-16 sm:h-5 sm:w-20" />
          </div>

          {/* Question Text */}
          <Skeleton className="h-5 w-full sm:h-6" />
          <Skeleton className="h-5 w-3/4 sm:h-6" />

          {/* Answer Options */}
          <div className="space-y-2 sm:space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg">
                <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded-full" />
                <Skeleton className="h-3 sm:h-4 flex-1" />
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-3 sm:pt-4">
            <Skeleton className="h-8 w-20 sm:h-10 sm:w-24" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20 sm:h-10 sm:w-24" />
              <Skeleton className="h-8 w-20 sm:h-10 sm:w-24" />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Skeleton className="h-3 w-12 sm:h-4 sm:w-16" />
            <Skeleton className="h-3 w-12 sm:h-4 sm:w-16" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
};
