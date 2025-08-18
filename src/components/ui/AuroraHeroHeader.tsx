import React, { useMemo } from 'react';
import Aurora from '@/components/react-bits/backgrounds/Aurora/Aurora';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface AuroraHeroHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  buttonText?: string;
  onButtonClick?: () => void;
  children?: React.ReactNode;
}



const AuroraHeroHeader: React.FC<AuroraHeroHeaderProps> = ({
  title,
  subtitle,
  buttonText,
  onButtonClick,
  children,
}) => {
  const { theme } = useTheme();

  return (
    <div className="mb-12 text-center relative overflow-hidden rounded-3xl shadow-xl bg-background/80 py-16 px-4 sm:px-8 flex flex-col items-center justify-center">
      {/* Animated Aurora Background */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <Aurora amplitude={1.2} blend={0.6} />
        {theme === 'dark' && (
          <div className="absolute inset-0 bg-black/60" />
        )}
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4 gradient-text drop-shadow-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto font-medium">
            {subtitle}
          </p>
        )}
        {buttonText && (
          <Button size="lg" className="rounded-full px-8 py-4 text-lg font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-xl transition-all" onClick={onButtonClick}>
            {buttonText}
          </Button>
        )}
        {children}
      </div>
    </div>
  );
};

export default AuroraHeroHeader; 