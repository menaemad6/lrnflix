/**
 * Performance optimization utilities for mobile devices
 */

// Check if device prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Check if device is mobile
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

// Check if device has low memory
export const isLowEndDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  // Check for low memory devices
  const memory = (navigator as any).deviceMemory;
  if (memory && memory <= 2) return true;
  
  // Check for low-end CPUs
  const cores = navigator.hardwareConcurrency;
  if (cores && cores <= 2) return true;
  
  return false;
};

// Optimize image loading based on device capabilities
export const getOptimizedImageSrc = (src: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
}): string => {
  const { width, height, quality = 80, format = 'webp' } = options || {};
  
  // For now, return original src
  // In production, you would integrate with an image optimization service
  // like Cloudinary, ImageKit, or Next.js Image Optimization
  return src;
};

// Debounce function for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Intersection Observer options optimized for performance
export const getIntersectionObserverOptions = (threshold: number = 0.1) => ({
  threshold,
  rootMargin: '50px 0px', // Start loading 50px before element comes into view
});

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  if (typeof performance === 'undefined') {
    fn();
    return;
  }
  
  const start = performance.now();
  fn();
  const end = performance.now();
  
  console.log(`${name} took ${end - start} milliseconds`);
};

// Lazy load images with intersection observer
export const createLazyImageLoader = () => {
  if (typeof window === 'undefined') return null;
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  }, getIntersectionObserverOptions());
  
  return imageObserver;
};

// Preload critical resources
export const preloadCriticalResources = (resources: string[]) => {
  resources.forEach((resource) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.css') ? 'style' : 'image';
    document.head.appendChild(link);
  });
};

// Optimize animations for mobile
export const getOptimizedAnimationProps = () => {
  const shouldReduceMotion = prefersReducedMotion();
  const isMobileDevice = isMobile();
  const isLowEnd = isLowEndDevice();
  
  return {
    shouldReduceMotion,
    isMobileDevice,
    isLowEnd,
    // Reduce animation complexity on mobile and low-end devices
    animationDuration: isMobileDevice || isLowEnd ? 0.3 : 0.6,
    staggerDelay: isMobileDevice || isLowEnd ? 0.05 : 0.1,
    // Disable complex animations on low-end devices
    enableComplexAnimations: !isLowEnd && !shouldReduceMotion,
  };
};
