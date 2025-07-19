import React from 'react';
import { Home } from '@/pages/Home';
import UltraModernLanding from '@/components/landing/UltraModernLanding';
import { useRandomBackground } from "../hooks/useRandomBackground";
import { useTenant } from '@/contexts/TenantContext';
import TeacherLanding from './TeacherLanding';

const Index = () => {
  const bgClass = useRandomBackground();
  const { teacher, loading } = useTenant();

  
  // If we have a teacher, show their landing page
  if (teacher) {
    return <TeacherLanding />;
  }

  // Show the ultra-modern landing page instead of the regular home page
  return <UltraModernLanding />;
};

export default Index;
