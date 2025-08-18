import React from 'react';
import Waves from '@/components/react-bits/backgrounds/Waves/Waves';
import { useTheme } from '@/contexts/ThemeContext';

interface WavesHeroHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}

const WavesHeroHeader: React.FC<WavesHeroHeaderProps> = ({ title, description, className = '' }) => {
  const { theme } = useTheme();
  
  // Function to get computed color values from CSS variables
  const getComputedColor = (cssVariable: string): string => {
    if (typeof window === 'undefined') return '#10b981'; // Fallback for SSR
    const computedStyle = getComputedStyle(document.documentElement);
    const colorValue = computedStyle.getPropertyValue(cssVariable).trim();
    
    if (colorValue) {
      // Convert HSL to hex if needed
      if (colorValue.includes(' ')) {
        // It's HSL format, convert to hex
        const [h, s, l] = colorValue.split(/\s|%/).filter(Boolean).map(Number);
        const a = s / 100;
        const b = l / 100;
        const k = (n: number) => (n + h / 30) % 12;
        const f = (n: number) => b - a * Math.min(b, 1 - b) * Math.max(Math.min(k(n) - 3, 9 - k(n), 1), -1);
        const rgb = [f(0), f(8), f(4)].map(x => Math.round(255 * x));
        return `#${rgb.map(x => x.toString(16).padStart(2, '0')).join('')}`;
      }
      return colorValue;
    }
    
    return '#10b981'; // Default fallback
  };

  // Get the actual color values from CSS variables
  const lineColor = getComputedColor('--primary-dark');

  return (
    <section className={`relative min-h-[40vh] flex flex-col items-center justify-center overflow-hidden bg-background/80 py-10 px-4 sm:px-8 ${className}`}>
      {/* Waves Background */}
      <Waves
        lineColor={lineColor}
        backgroundColor="transparent"
        className="absolute inset-0 w-full h-full z-0"
      />
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center px-2 py-8 pt-[140px] pb-[95px] z-10 relative">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-3 text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-lg md:text-xl text-muted-foreground mb-0 max-w-2xl mx-auto">
            {description}
          </p>
        )}
      </div>
    </section>
  );
};

export default WavesHeroHeader; 