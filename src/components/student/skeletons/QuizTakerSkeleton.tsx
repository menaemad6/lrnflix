import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const QuizTakerSkeleton = ({ onBackToCourse }: { onBackToCourse: () => void }) => {
  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={onBackToCourse}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Button>
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      {/* Quiz Content */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Quiz Title and Description */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Quiz Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>

        {/* Question Content */}
        <div className="bg-card rounded-lg border p-6 space-y-6">
          {/* Question Header */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-20" />
          </div>

          {/* Question Text */}
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />

          {/* Answer Options */}
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Skeleton className="h-10 w-24" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
};
