import React from 'react';
import { cn } from '@/lib/utils';

interface CustomScrollbarProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
  hideScrollbar?: boolean;
  scrollbarColor?: string;
  scrollbarTrackColor?: string;
  scrollbarWidth?: string;
  scrollbarRadius?: string;
}

export const CustomScrollbar = ({ 
  children, 
  className, 
  maxHeight = "400px",
  hideScrollbar = false,
  scrollbarColor = "rgb(0 0 0 / 0.2)", // blue-500/30
  scrollbarTrackColor = "rgb(0 0 0 / 0.05)", // black/5
  scrollbarWidth = "6px",
  scrollbarRadius = "3px"
}: CustomScrollbarProps) => {
  const scrollbarStyles = hideScrollbar ? {
    scrollbarWidth: 'none' as const,
    msOverflowStyle: 'none' as const,
  } : {
    scrollbarWidth: 'thin' as const,
    scrollbarColor: `${scrollbarColor} ${scrollbarTrackColor}`,
  };

  return (
    <div 
      className={cn(
        "overflow-auto",
        hideScrollbar && "scrollbar-none",
        className
      )}
      style={{ 
        maxHeight,
        ...scrollbarStyles,
        // Custom scrollbar styles for webkit browsers
        ...(!hideScrollbar && {
          '--scrollbar-width': scrollbarWidth,
          '--scrollbar-color': scrollbarColor,
          '--scrollbar-track-color': scrollbarTrackColor,
          '--scrollbar-radius': scrollbarRadius,
        } as React.CSSProperties)
      }}
    >
      {children}
      {!hideScrollbar && (
        <style>
          {`
            ::-webkit-scrollbar {
              width: ${scrollbarWidth};
            }
            
            ::-webkit-scrollbar-track {
              background: ${scrollbarTrackColor};
              border-radius: ${scrollbarRadius};
            }
            
            ::-webkit-scrollbar-thumb {
              background: ${scrollbarColor};
              border-radius: ${scrollbarRadius};
              transition: background 0.2s ease;
            }
            
            ::-webkit-scrollbar-thumb:hover {
              background: ${scrollbarColor.replace('0.2', '0.4')};
            }
          `}
        </style>
      )}
    </div>
  );
};

// Variant for hidden scrollbars
export const HiddenScrollbar = ({ 
  children, 
  className, 
  maxHeight 
}: Omit<CustomScrollbarProps, 'hideScrollbar' | 'scrollbarColor' | 'scrollbarTrackColor' | 'scrollbarWidth' | 'scrollbarRadius'>) => {
  return (
    <CustomScrollbar 
      className={className} 
      maxHeight={maxHeight} 
      hideScrollbar={true}
    >
      {children}
    </CustomScrollbar>
  );
};

// Variant for primary colored scrollbars
export const PrimaryScrollbar = ({ 
  children, 
  className, 
  maxHeight 
}: Omit<CustomScrollbarProps, 'scrollbarColor' | 'scrollbarTrackColor' | 'scrollbarWidth' | 'scrollbarRadius'>) => {
  return (
    <CustomScrollbar 
      className={className} 
      maxHeight={maxHeight}
      scrollbarColor="rgb(59 130 246 / 0.4)"
      scrollbarTrackColor="rgb(0 0 0 / 0.05)"
      scrollbarWidth="8px"
      scrollbarRadius="4px"
    >
      {children}
    </CustomScrollbar>
  );
};

// Variant for secondary colored scrollbars
export const SecondaryScrollbar = ({ 
  children, 
  className, 
  maxHeight 
}: Omit<CustomScrollbarProps, 'scrollbarColor' | 'scrollbarTrackColor' | 'scrollbarWidth' | 'scrollbarRadius'>) => {
  return (
    <CustomScrollbar 
      className={className} 
      maxHeight={maxHeight}
      scrollbarColor="rgb(139 92 246 / 0.4)"
      scrollbarTrackColor="rgb(0 0 0 / 0.05)"
      scrollbarWidth="8px"
      scrollbarRadius="4px"
    >
      {children}
    </CustomScrollbar>
  );
};
