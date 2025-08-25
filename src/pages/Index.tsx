import React from 'react';
import { Home } from '@/pages/Home';
import UltraModernLanding from '@/components/landing/UltraModernLanding';
import { useRandomBackground } from "../hooks/useRandomBackground";
import { useTenant } from '@/contexts/TenantContext';
import TeacherLanding from './TeacherLanding';
import { SEOHead } from '@/components/seo/SEOHead';
import SaasLanding from '@/components/landing/SaasLanding';

const Index = () => {
  const bgClass = useRandomBackground();
  const { teacher, loading } = useTenant();

  // If we have a teacher, show their landing page
  if (teacher) {
    return (
      <>
        <SEOHead />
        <TeacherLanding />
      </>
    );
  }

  // Show the ultra-modern landing page instead of the regular home page
  return (
    <>
      <SEOHead />
      <SaasLanding />
    </>
  );
};

export default Index;
