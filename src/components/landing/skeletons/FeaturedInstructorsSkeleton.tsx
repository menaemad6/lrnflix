import { Skeleton } from "@/components/ui/skeleton";

const FeaturedInstructorsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="text-center flex flex-col items-center">
          <Skeleton className="w-40 h-40 md:w-48 md:h-48 rounded-full" />
          <Skeleton className="h-8 w-48 mt-6" />
          <Skeleton className="h-6 w-32 mt-2" />
        </div>
      ))}
    </div>
  );
};

export default FeaturedInstructorsSkeleton;
