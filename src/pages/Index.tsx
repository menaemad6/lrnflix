import React from 'react';
import { Home } from '@/pages/Home';
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

  // Otherwise show the regular home page
  return (
    <div className={bgClass + " min-h-screen"}>
      <Home />
    </div>
  );
};

export default Index;
