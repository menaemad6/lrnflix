import React, { useEffect } from 'react';
import { ChemistryHero } from '@/components/chemistry-landing/ChemistryHero';
import { YearsSection } from '@/components/chemistry-landing/YearsSection';
import { LatestCourses } from '@/components/chemistry-landing/LatestCourses';
import { PlatformFeatures } from '@/components/chemistry-landing/PlatformFeatures';
import { AboutTeacher } from '@/components/chemistry-landing/AboutTeacher';
import { Testimonials } from '@/components/chemistry-landing/Testimonials';
import { SEOHead } from '@/components/seo/SEOHead';

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
      
      <div className="min-h-screen">
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
      </div>
    </>
  );
};