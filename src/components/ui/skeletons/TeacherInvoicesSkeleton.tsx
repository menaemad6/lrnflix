import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Plus, User, Calendar, DollarSign } from "lucide-react";

export function TeacherInvoicesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Invoices Card Skeleton */}
      <div className="border rounded-lg p-6">
        {/* Card Header */}
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <Skeleton className="h-6 w-32" />
        </div>

        {/* Invoice Items Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Status and Invoice Number */}
                  <div className="flex items-center gap-3 mb-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  
                  {/* Invoice Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  
                  {/* Payment Type */}
                  <div className="flex items-center gap-2 mt-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  
                  {/* Notes (optional) */}
                  {index % 3 === 0 && (
                    <div className="mt-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-9 w-32" />
                  {index % 2 === 0 && (
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
