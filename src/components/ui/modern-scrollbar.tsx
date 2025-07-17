import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ModernScrollbarProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

export const ModernScrollbar = ({ children, className, maxHeight = "400px" }: ModernScrollbarProps) => {
  return (
    <ScrollArea 
      className={cn(
        "w-full rounded-lg",
        "[&>div>div[style]]:!block",
        "[&>div>div]:h-full",
        "[&>div>div]:overflow-auto",
        "[&>div>div]:scrollbar-thin",
        "[&>div>div]:scrollbar-track-background/20",
        "[&>div>div]:scrollbar-thumb-primary/30",
        "[&>div>div]:hover:scrollbar-thumb-primary/50",
        "[&>div>div]:scrollbar-track-rounded-full",
        "[&>div>div]:scrollbar-thumb-rounded-full",
        className
      )}
      style={{ maxHeight }}
    >
      <div className="h-full">
        {children}
      </div>
    </ScrollArea>
  );
};
