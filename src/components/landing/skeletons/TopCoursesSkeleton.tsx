import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const TopCoursesSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(3)].map((_, index) => (
        <Card key={index} className="relative overflow-hidden h-full bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/20">
          <CardContent className="p-8 relative z-10 h-full flex flex-col">
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="w-16 h-16 rounded-full" />
              </div>
              <Skeleton className="h-6 w-1/2" />
            </div>
            <div className="flex items-center justify-between mt-6">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-10 w-10" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TopCoursesSkeleton;
