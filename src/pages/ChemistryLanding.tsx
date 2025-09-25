import React, { useEffect, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo/SEOHead';
import { Footer } from '@/components/landing/saas-landing';
import { preloadCriticalResources, addResourceHints } from '@/utils/dynamic-imports';
import { getOptimizedAnimationProps } from '@/utils/performance';
import { HeroSection } from '@/components/chemistry-landing/HeroSection';

// Lazy load components for better performance (except hero)
const YearsSection = lazy(() => import('@/components/chemistry-landing/YearsSection').then(module => ({ default: module.YearsSection })));
const LatestCourses = lazy(() => import('@/components/chemistry-landing/LatestCourses').then(module => ({ default: module.LatestCourses })));
const PlatformFeatures = lazy(() => import('@/components/chemistry-landing/PlatformFeatures').then(module => ({ default: module.PlatformFeatures })));
const Testimonials = lazy(() => import('@/components/chemistry-landing/Testimonials').then(module => ({ default: module.Testimonials })));

// Loading component
const SectionLoader = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

export const ChemistryLanding = () => {
  const { t } = useTranslation('landing');

  useEffect(() => {
    // Add smooth scroll behavior and prevent default scrolling issues
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Preload critical resources for better performance
    preloadCriticalResources();
    addResourceHints();
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const animationProps = getOptimizedAnimationProps();

  return (
    <>
      <div className="min-h-screen relative overflow-x-hidden">
        {/* Optimized Background - Reduced complexity for mobile */}
        <div className="fixed inset-0 -z-10">
          {/* Main Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5" />
          
          {/* Simplified Pattern Overlay - Only on desktop and high-end devices */}
          {!animationProps.isMobileDevice && !animationProps.isLowEnd && (
            <div className="hidden md:block absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,hsl(var(--primary))_1px,transparent_0)] bg-[length:32px_32px]" />
          )}
          
          {/* Reduced floating elements for mobile performance */}
          {animationProps.enableComplexAnimations && (
            <>
              <div className="absolute top-20 left-10 w-32 h-32 bg-primary/6 rounded-full blur-2xl animate-pulse" />
              <div className="absolute bottom-40 right-20 w-24 h-24 bg-secondary/8 rounded-full blur-xl animate-pulse delay-2000" />
            </>
          )}
        </div>

        {/* Hero Section - Load immediately */}
        <HeroSection />
        
        {/* Years Categories Section */}
        <Suspense fallback={<SectionLoader />}>
          <YearsSection />
        </Suspense>
        
        {/* Latest Courses Section */}
        <Suspense fallback={<SectionLoader />}>
          <LatestCourses />
        </Suspense>
        
        {/* Platform Features Section */}
        <Suspense fallback={<SectionLoader />}>
          <PlatformFeatures />
        </Suspense>
        
        {/* Testimonials Section */}
        <Suspense fallback={<SectionLoader />}>
          <Testimonials />
        </Suspense>

        <Footer />
      </div>
    </>
  );
};