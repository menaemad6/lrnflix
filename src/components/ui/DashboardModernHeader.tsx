import React from 'react';
import { Button } from '@/components/ui/button';

interface DashboardModernHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  buttonText?: string;
  onButtonClick?: () => void;
  children?: React.ReactNode;
}

const DashboardModernHeader: React.FC<DashboardModernHeaderProps> = ({
  title,
  subtitle,
  buttonText,
  onButtonClick,
  children,
}) => (
  <div className="glass-card py-14 px-4 sm:px-10 flex flex-col items-center justify-center mb-10">
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-3 text-primary drop-shadow-2xl text-balance text-center">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg md:text-2xl text-muted-foreground mb-7 max-w-2xl mx-auto font-medium animate-fade-in text-balance text-center">
          {subtitle}
        </p>
      )}
      {buttonText && (
        <Button size="lg" variant='default' onClick={onButtonClick}>
          {buttonText}
        </Button>
      )}
      {children}
    </div>
  </div>
);

export default DashboardModernHeader; 