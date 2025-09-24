import React, { useEffect } from 'react';
import { ChemistryHero } from '@/components/chemistry-landing/ChemistryHero';
import { YearsSection } from '@/components/chemistry-landing/YearsSection';
import { LatestCourses } from '@/components/chemistry-landing/LatestCourses';
import { PlatformFeatures } from '@/components/chemistry-landing/PlatformFeatures';
import { AboutTeacher } from '@/components/chemistry-landing/AboutTeacher';
import { Testimonials } from '@/components/chemistry-landing/Testimonials';
import { SEOHead } from '@/components/seo/SEOHead';
import { Footer } from '@/components/landing/saas-landing';

export const ChemistryLanding = () => {
  useEffect(() => {
    // Add smooth scroll behavior and prevent default scrolling issues
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <>
      <SEOHead 
        title="مدرس الكيمياء - تعلم الكيمياء بطريقة تفاعلية وممتعة"
        description="انضم إلى أفضل منصة لتعليم الكيمياء للمرحلة الثانوية. دروس تفاعلية، مواد شاملة، ودعم مستمر مع أستاذ متخصص."
        keywords="كيمياء، تعليم، ثانوية، دروس، مدرس، تفاعلي، أول ثانوي، ثاني ثانوي، ثالث ثانوي"
        ogImage="/chemistry-og-image.jpg"
      />
      
      <div className="min-h-screen relative overflow-x-hidden">
        {/* General Premium Background */}
        <div className="fixed inset-0 -z-10">
          {/* Main Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5" />
          
          {/* Secondary Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-secondary/3 to-accent/5" />
          
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_1px_1px,hsl(var(--primary))_1px,transparent_0)] bg-[length:32px_32px]" />
          
          {/* Floating Elements with Theme Colors */}
          <div className="absolute top-20 left-10 w-40 h-40 bg-primary/8 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-20 w-32 h-32 bg-secondary/10 rounded-full blur-2xl animate-pulse delay-1000" />
          <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-accent/6 rounded-full blur-3xl animate-pulse delay-2000" />
          <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-primary/5 rounded-full blur-2xl animate-pulse delay-3000" />
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-secondary/8 rounded-full blur-xl animate-pulse delay-1500" />
        </div>

        {/* Hero Section */}
        <ChemistryHero />
        
        {/* Years Categories Section */}
        <YearsSection />
        
        {/* Latest Courses Section */}
        <LatestCourses />
        
        {/* Platform Features Section */}
        <PlatformFeatures />
        
        {/* About Teacher Section */}
        <AboutTeacher />
        
        {/* Testimonials Section */}
        <Testimonials />

        <Footer />
      </div>
    </>
  );
};