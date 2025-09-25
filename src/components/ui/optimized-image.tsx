import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  quality = 80,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  const { ref } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    skip: priority, // Skip intersection observer if priority is true
    onChange: (inView) => {
      if (inView) {
        setIsInView(true);
      }
    },
  });

  useEffect(() => {
    if (isInView && !isLoaded && !hasError) {
      const img = new Image();
      
      img.onload = () => {
        setIsLoaded(true);
        onLoad?.();
      };
      
      img.onerror = () => {
        setHasError(true);
        onError?.();
      };
      
      // Add loading optimization
      img.loading = 'lazy';
      img.src = src;
    }
  }, [isInView, isLoaded, hasError, src, onLoad, onError]);

  // Generate optimized src based on device capabilities
  const getOptimizedSrc = () => {
    // In production, you would integrate with an image optimization service
    // For now, return the original src
    return src;
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return null; // Don't show anything on error
  }

  return (
    <div ref={ref} className={className} style={{ width, height }}>
      {isInView && (
        <img
          ref={imgRef}
          src={getOptimizedSrc()}
          alt={alt}
          className={className}
          style={{ width, height }}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
    </div>
  );
};

// Hook for preloading images
export const useImagePreloader = (srcs: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadImage = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, src]));
          resolve();
        };
        img.onerror = () => {
          setFailedImages(prev => new Set([...prev, src]));
          reject();
        };
        img.src = src;
      });
    };

    // Load images in batches to avoid overwhelming the browser
    const batchSize = 3;
    const batches = [];
    for (let i = 0; i < srcs.length; i += batchSize) {
      batches.push(srcs.slice(i, i + batchSize));
    }

    const loadBatches = async () => {
      for (const batch of batches) {
        await Promise.allSettled(batch.map(loadImage));
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    };

    loadBatches();
  }, [srcs]);

  return {
    loadedImages,
    failedImages,
    isLoaded: (src: string) => loadedImages.has(src),
    hasFailed: (src: string) => failedImages.has(src),
    allLoaded: loadedImages.size === srcs.length,
  };
};
