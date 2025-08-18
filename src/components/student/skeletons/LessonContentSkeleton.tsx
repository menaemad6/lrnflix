import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const LessonContentSkeleton = ({ onBackToCourse }: { onBackToCourse: () => void }) => {
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

      {/* Lesson Content */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Lesson Title and Description */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Lesson Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>

        {/* Video Player Placeholder */}
        <div className="bg-card rounded-lg border p-6">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <Skeleton className="h-16 w-16 rounded-full" />
          </div>
        </div>

        {/* Lesson Summary */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* Voice Tutor Section */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Completion Button */}
        <div className="flex justify-center pt-4">
          <Skeleton className="h-12 w-48 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
